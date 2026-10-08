/** Hourly RSS backup uses exactly the Worker's parser, source checks and rule engine. */
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { parseRss } from '../worker/src/rss-parser.mjs';
import { evaluateRule, ruleAutoPublishes, ruleAllowsSource, configuredRules, revalidateArticle } from '../worker/src/rule-engine.mjs';
export { configuredRules } from '../worker/src/rule-engine.mjs';
import { normalizeFeedDate } from '../worker/src/time-quality.mjs';
import { verifyItemSource } from '../worker/src/source-verification.mjs';

const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await fs.readFile(new URL(path, root), 'utf8'));
function cutoffFor(now) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(now).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  const index = parts.year * 12 + parts.month - 3;
  const year = Math.floor(index / 12), month = ((index % 12) + 12) % 12;
  const day = Math.min(parts.day, new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
  return new Date(Date.UTC(year, month, day) - 8 * 60 * 60 * 1000);
}
export function approvedFeedArticles(xml, source, rules, now = new Date()) {
  const cutoff = cutoffFor(now);
  return parseRss(xml).flatMap(item => {
    const published = normalizeFeedDate(item.publishedAt, source, now.getTime());
    let link;
    try { link = new URL(item.link, source.feed_url).href; } catch { return []; }
    if (!published || new Date(published) < cutoff || !item.title || !verifyItemSource({ ...item, link }, source)) return [];
    const article = { title: item.title, excerpt: item.excerpt };
    const matches = rules.filter(rule => ruleAllowsSource(rule, source)).map(rule => ({ rule, result: evaluateRule(article, rule) }))
      .filter(({ rule, result }) => result.matched && ruleAutoPublishes(rule, result.evidence));
    if (!matches.length) return [];
    return [{ id: 'rss-snapshot-' + createHash('sha256').update(link).digest('hex').slice(0, 20),
      title: item.title, excerpt: item.excerpt, url: link, canonical_url: link,
      published_at: published, fetched_at: now.toISOString(), source_id: source.id, source: source.name,
      source_region: source.region, source_feed: source.feed_url, source_homepage: `https://${source.domain}/`,
      source_kind: 'official_rss', source_access_mode: 'rss', verification_status: 'verified_rss',
      url_kind: 'publisher_url', review_status: 'approved',
      folder_ids: [...new Set(matches.map(({ rule }) => rule.folder_id))].join(','),
      rule_ids: matches.map(({ rule }) => rule.id).join(','),
      evidence_jsons: matches.map(({ result }) => JSON.stringify(result.evidence)).join('|||'),
      snapshot_fallback: true }];
  });
}

export async function fetchBackupFeed(source, fetchFeed = fetch) {
  async function fetchXml(url) {
    const response = await fetchFeed(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'SoftWorldMonitoring/1.0' } });
    if (!response.ok) throw Error(`RSS HTTP ${response.status}`);
    const xml = await response.text();
    if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) throw Error('not_rss_or_atom');
    return xml;
  }
  try { return { xml: await fetchXml(source.feed_url), transport: 'publisher-direct' }; }
  catch (error) {
    if (!source.backup_worker_relay) throw error;
    const xml = await fetchXml(`https://softworld-monitoring-api.media-monitoring-worker.workers.dev/api/rss-backup?source=${encodeURIComponent(source.id)}`);
    return { xml, transport: 'worker-relay', direct_error: String(error).slice(0, 200) };
  }
}

export async function main() {
  const sources = (await read('config/core_media_sources.json')).sources.filter(source => source.enabled && source.auto_publish && source.access_mode === 'rss');
  const rules = configuredRules(await read('config/monitoring_rules.json'));
  const output = new URL('data/rss-snapshot.json', root);
  const now = new Date();
  let previous;
  try { previous = JSON.parse(await fs.readFile(output, 'utf8')); } catch { previous = { articles: [] }; }
  const articles = new Map();
  const results = [];
  let cursor = 0;
  async function collect() {
    while (cursor < sources.length) {
      const source = sources[cursor++];
      try {
        const { xml, ...transport } = await fetchBackupFeed(source);
        const rows = approvedFeedArticles(xml, source, rules, now);
        rows.forEach(article => articles.set(article.url, article));
        results.push({ source_id: source.id, name: source.name, result: 'success', checked_at: new Date().toISOString(), articles: rows.length, ...transport });
      } catch (error) {
        results.push({ source_id: source.id, name: source.name, result: 'failed', checked_at: new Date().toISOString(), error: String(error).slice(0, 200) });
      }
    }
  }
  await Promise.all(Array.from({ length: 5 }, collect));
  if (!results.some(result => result.result === 'success')) throw Error('All RSS sources failed; previous snapshot preserved');
  const cutoff = cutoffFor(now);
  for (const article of previous.articles || []) {
    const clean = revalidateArticle(article, sources.find(source => source.id === article.source_id), rules);
    if (clean && new Date(clean.published_at) >= cutoff && new Date(clean.published_at) <= now && !articles.has(clean.url)) articles.set(clean.url, clean);
  }
  const payload = { generated_at: new Date().toISOString(), method: 'official-rss-hourly-backup', source_count: sources.length,
    errors: results.filter(result => result.result === 'failed'), results,
    articles: [...articles.values()].sort((a, b) => b.published_at.localeCompare(a.published_at)) };
  const temporary = new URL('data/rss-snapshot.tmp', root);
  await fs.writeFile(temporary, JSON.stringify(payload, null, 2) + '\n');
  await fs.rename(temporary, output);
  console.log(JSON.stringify({ sources: sources.length, successful: results.filter(row => row.result === 'success').length, errors: payload.errors, articles: payload.articles.length }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
