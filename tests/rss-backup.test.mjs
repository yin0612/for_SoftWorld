import test from 'node:test';
import assert from 'node:assert/strict';
import { configuredRules, approvedFeedArticles, fetchBackupFeed } from '../scripts/update_rss_snapshot.mjs';
const source = { id: 'gamebase', name: '遊戲基地', domain: 'gamebase.com.tw', region: 'TW', feed_url: 'https://news.gamebase.com.tw/rss.xml' };
const config = { global_exclude_any: ['大宇紡織'], automatic_publication_rule_ids: ['test'], automatic_publication_allowed_terms: {},
  folders: [{ id: 'folder_1', region_scope: ['TW'] }],
  rules: [{ id: 'test', folder_id: 'folder_1', scope: 'full_text', required_any_groups: [['智冠'], ['遊戲']] }] };
const rss = (title, link = 'https://news.gamebase.com.tw/news/123') => `<rss><channel><item><title>${title}</title><link>${link}</link><pubDate>Thu, 01 Oct 2026 16:00:00 GMT</pubDate></item></channel></rss>`;

test('blocked feeds use the configured relay and preserve the direct error and transport', async () => {
  const calls = [];
  const fakeFetch = async url => {
    calls.push(url);
    return calls.length === 1 ? new Response('Denied', { status: 403 }) : new Response(rss('智冠遊戲'));
  };
  const result = await fetchBackupFeed({ ...source, backup_worker_relay: true }, fakeFetch);
  assert.equal(result.transport, 'worker-relay'); assert.match(result.direct_error, /403/);
  assert.equal(calls.length, 2); assert.match(calls[1], /api\/rss-backup\?source=gamebase$/);
  assert.equal(approvedFeedArticles(result.xml, source, configuredRules(config), new Date('2026-10-01T09:00:00Z')).length, 1);
});

test('backup does not relay undesignated sources or accept a successful HTML block page', async () => {
  let calls = 0;
  await assert.rejects(fetchBackupFeed(source, async () => { calls++; return new Response('denied', { status: 403 }); }), /403/);
  assert.equal(calls, 1);
  await assert.rejects(fetchBackupFeed({ ...source, backup_worker_relay: true }, async () => new Response('<html>Denied</html>')), /not_rss_or_atom/);
});
test('backup shares AND groups, source boundaries, auto approval and timezone with Worker', () => {
  const now = new Date('2026-10-01T09:00:00Z');
  const rules = configuredRules(config);
  const rows = approvedFeedArticles(rss('智冠遊戲上市'), source, rules, now);
  assert.equal(rows.length, 1); assert.equal(rows[0].source_kind, 'official_rss');
  assert.equal(rows[0].published_at, '2026-10-01T08:00:00.000Z');
  for (const title of ['智冠財經', '遊戲上市', '智冠遊戲 大宇紡織']) assert.equal(approvedFeedArticles(rss(title), source, rules, now).length, 0);
  assert.equal(approvedFeedArticles(rss('智冠遊戲', 'https://gamebase.com.tw.evil.test/a'), source, rules, now).length, 0);
  assert.equal(approvedFeedArticles(rss('智冠遊戲'), { ...source, region: 'GLOBAL' }, rules, now).length, 0);
  assert.equal(approvedFeedArticles(rss('智冠遊戲'), source, configuredRules({ ...config, automatic_publication_rule_ids: [] }), now).length, 0);
});
