/** Explicit gaming-only backfill. Never revive manually rejected matches or articles. */
import fs from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import gaming from '../js/gaming.js';
import { configuredRules, evaluateRule, ruleAllowsSource, ruleAutoPublishes, revalidateArticle } from '../worker/src/rule-engine.mjs';
const root = new URL('../', import.meta.url);
const read = name => JSON.parse(fs.readFileSync(new URL(name, root), 'utf8'));
const config = read('config/monitoring_rules.json');
const rules = configuredRules(config);
const sources = [...read('config/core_media_sources.json').sources, ...read('config/fintech_media_sources.json').sources];
const added = new Set(gaming.rules.map(rule => rule.id));
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
export function gamingMatches(article) {
    const source = sources.find(item => item.id === article.source_id);
    if (!source?.enabled || !source.auto_publish || article.review_status !== 'approved' || gaming.isIndex(article)) return [];
    const target = article.source_kind === 'google_news_rss' ? { title: article.title } : article;
    return rules.filter(rule => added.has(rule.id) && ruleAllowsSource(rule, source))
        .map(rule => ({ rule, result: evaluateRule(target, rule) }))
        .filter(({ rule, result }) => result.matched && ruleAutoPublishes(rule, result.evidence));
}
export function backfillArticle(article) {
    const matches = gamingMatches(article);
    const clean = revalidateArticle(article, sources.find(source => source.id === article.source_id), rules);
    if (!matches.length) return clean;
    const base = clean || article;
    const evidence = String(clean?.evidence_jsons || '').split('|||').filter(Boolean);
    return { ...base,
        rule_ids: [...new Set([...(clean?.rule_ids || '').split(',').filter(Boolean), ...matches.map(({rule}) => rule.id)])].join(','),
        folder_ids: [...new Set([...(clean?.folder_ids || '').split(',').filter(Boolean), ...matches.map(({rule}) => rule.folder_id)])].join(','),
        evidence_jsons: [...evidence, ...matches.map(({result}) => JSON.stringify(result.evidence))].join('|||'),
        matched_terms: [...new Set([...(clean?.matched_terms || []), ...matches.flatMap(({result}) => result.evidence.required_any_group_hits.flat())])] };
}
export function backfillSql(rows) {
    return rows.flatMap(article => gamingMatches(article).map(({rule,result}) =>
        `INSERT INTO article_matches (article_id,rule_id,evidence_json,status,reviewed_by,reviewed_at) SELECT ${quote(article.id)},${quote(rule.id)},${quote(JSON.stringify(result.evidence))},'approved','system:gaming-v2-backfill',CURRENT_TIMESTAMP WHERE EXISTS (SELECT 1 FROM articles WHERE id=${quote(article.id)} AND review_status='approved') ON CONFLICT(article_id,rule_id) DO NOTHING;`)).join('\n')+'\n';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const [input, output] = process.argv.slice(2);
    if (input && output) {
        const data = JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));
        const rows = Array.isArray(data) ? data.flatMap(item => item.results || []) : data.articles || [];
        const sql = backfillSql(rows); fs.writeFileSync(output,sql); console.log(JSON.stringify({articles:rows.length,new_matches:sql.split('\n').filter(Boolean).length}));
    } else {
        for (const path of ['data/rss-snapshot.json','data/fintech-aggregated.json']) {
            const payload = read(path), before=payload.articles.length;
            payload.articles = payload.articles.map(backfillArticle).filter(Boolean);
            if ('article_count' in payload) payload.article_count=payload.articles.length;
            payload.quality_rules_version=config.version;
            payload.gaming_reclassification={version:config.version,at:new Date().toISOString(),before,after:payload.articles.length};
            fs.writeFileSync(new URL(path,root),JSON.stringify(payload,null,2)+'\n');
            console.log(JSON.stringify({path,before,after:payload.articles.length}));
        }
    }
}
