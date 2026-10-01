import test from 'node:test';
import assert from 'node:assert/strict';
import { configuredRules, approvedFeedArticles } from '../scripts/update_rss_snapshot.mjs';
const source = { id: 'gamebase', name: '遊戲基地', domain: 'gamebase.com.tw', region: 'TW', feed_url: 'https://news.gamebase.com.tw/rss.xml' };
const config = { global_exclude_any: ['大宇紡織'], automatic_publication_rule_ids: ['test'], automatic_publication_allowed_terms: {},
  folders: [{ id: 'folder_1', region_scope: ['TW'] }],
  rules: [{ id: 'test', folder_id: 'folder_1', scope: 'full_text', required_any_groups: [['智冠'], ['遊戲']] }] };
const rss = (title, link = 'https://news.gamebase.com.tw/news/123') => `<rss><channel><item><title>${title}</title><link>${link}</link><pubDate>Thu, 01 Oct 2026 16:00:00 GMT</pubDate></item></channel></rss>`;
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
