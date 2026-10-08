/** Revalidate snapshots and prepare an auditable D1 correction without deleting news. */
import fs from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configuredRules, evaluateRule, ruleAllowsSource, revalidateArticle } from '../worker/src/rule-engine.mjs';
const root = new URL('../', import.meta.url);
const read = path => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8'));
const config = read('config/monitoring_rules.json');
const rules = configuredRules(config);
const sources = [...read('config/core_media_sources.json').sources, ...read('config/fintech_media_sources.json').sources];
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";

export function cleanSnapshot(payload) {
  const articles = (payload.articles || []).map(article => revalidateArticle(article,
    sources.find(source => source.id === article.source_id), rules)).filter(Boolean);
  return { ...payload, ...(Object.hasOwn(payload, 'article_count') ? { article_count: articles.length } : {}),
    articles, quality_rules_version: config.version };
}

export function correctionSql(rows) {
  const invalid = rows.filter(row => {
    if (row.status !== 'approved' || !String(row.reviewed_by || '').startsWith('system:')) return false;
    const source = sources.find(source => source.id === row.source_id);
    const rule = rules.find(rule => rule.id === row.rule_id);
    return !source?.enabled || !source.auto_publish || !rule || !ruleAllowsSource(rule, source)
      || !evaluateRule(row, rule).matched;
  });
  const ids = [...new Set(invalid.map(row => row.article_id))];
  const sql = invalid.map(row => `UPDATE article_matches SET status = 'pending', reviewed_by = 'system:rss-precision-revalidation', reviewed_at = CURRENT_TIMESTAMP WHERE article_id = ${quote(row.article_id)} AND rule_id = ${quote(row.rule_id)} AND status = 'approved' AND reviewed_by LIKE 'system:%';`);
  // Scope the status correction to affected articles and preserve manual rejection.
  for (const id of ids) sql.push(`UPDATE articles SET review_status = CASE WHEN EXISTS (SELECT 1 FROM article_matches WHERE article_id = articles.id AND status = 'approved') THEN 'approved' ELSE 'pending' END WHERE id = ${quote(id)} AND review_status <> 'rejected';`);
  return { sql: sql.join('\n') + '\n', invalid_matches: invalid.length, affected_articles: ids.length,
    by_source: Object.fromEntries([...new Set(invalid.map(row => row.source_id))].map(id => [id, invalid.filter(row => row.source_id === id).length])) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (input && output) {
    const payload = JSON.parse(fs.readFileSync(input, 'utf8').replace(/^\uFEFF/, ''));
    const result = correctionSql(payload.flatMap(entry => entry.results || []));
    fs.writeFileSync(output, result.sql);
    console.log(JSON.stringify({ ...result, sql: undefined }));
  } else {
    for (const path of ['data/rss-snapshot.json']) {
      const original = read(path), clean = cleanSnapshot(original);
      fs.writeFileSync(new URL(path, root), JSON.stringify(clean, null, 2) + '\n');
      console.log(JSON.stringify({ path, before: original.articles.length, after: clean.articles.length,
        removed: original.articles.length - clean.articles.length }));
    }
  }
}
