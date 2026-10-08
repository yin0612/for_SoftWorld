import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseRss, textFromXml } from '../worker/src/rss-parser.mjs';
import { evaluateRule, configuredRules, revalidateArticle } from '../worker/src/rule-engine.mjs';
import { approvedFeedArticles } from '../scripts/update_rss_snapshot.mjs';
import { cleanSnapshot, correctionSql } from '../scripts/revalidate_rss_data.mjs';
const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const rules = configuredRules(read('../config/monitoring_rules.json'));
const sources = read('../config/core_media_sources.json').sources;
const it = sources.find(source => source.id === 'ithome-cn');
const tw = sources.find(source => source.id === 'ithome');
const rule = id => rules.find(rule => rule.id === id);
const rss = (title, body = '') => `<rss><channel><item><title>${title}</title>
  <link>https://www.ithome.com/1/010/363.htm</link><pubDate>Wed, 07 Oct 2026 00:00:00 GMT</pubDate>
  <description>${body}</description></item></channel></rss>`;

test('escaped HTML is decoded before stripping markup, attributes and scripts', () => {
  const html = '&lt;p style=&quot;text-align: center&quot;&gt;奇瑞品牌進軍海外&lt;/p&gt;'
    + '&lt;img src=&quot;https://example.test/IG/LINE/Meta.jpg&quot;&gt;'
    + '&lt;script&gt;IG Facebook&lt;/script&gt;';
  const item = parseRss(rss('奇瑞品牌進軍海外', html))[0];
  assert.equal(item.excerpt, '奇瑞品牌進軍海外');
  assert.equal(evaluateRule(item, rule('industry-martech')).matched, false);
  assert.equal(textFromXml('&amp;lt;p&amp;gt;&#x904A;&#25138;&amp;lt;/p&amp;gt;'), '遊戲');
  assert.equal(textFromXml('<p>智冠</p><p>遊戲</p>'), '智冠\n\n遊戲');
});

test('Latin keywords cannot match align, inline, iPod, metadata or AIVA', () => {
  for (const [title, id] of [
    ['品牌曝光 text-align', 'industry-martech'],
    ['Win11 功能 inline actions', 'industry-platform-business'],
    ['iPod之父談Meta設備', 'industry-platform-business'],
    ['合作 metadata 格式', 'industry-platform-business'],
    ['赛豆 AIVA 汽車曝光', 'industry-martech']
  ]) assert.equal(evaluateRule({ title }, rule(id)).matched, false, title);
  for (const title of ['品牌曝光 IG', '品牌曝光（IG）', '品牌曝光ＩＧ', 'IG品牌曝光']) {
    assert.equal(evaluateRule({ title }, rule('industry-martech')).matched, true, title);
  }
  assert.equal(evaluateRule({ title: 'LINE推出合作功能' }, rule('industry-platform-business')).matched, true);
  assert.equal(evaluateRule({ title: 'MyCard遊戲儲值' }, rule('softworld-brand')).matched, true);
});

test('IT之家 RSS admits approval, game and competitor stories but excludes broad technology and cars', () => {
  const now = new Date('2026-10-08T00:00:00Z');
  for (const title of ['2026年9月209款游戏版号下发', 'MyCard遊戲服務', '明日方舟更新', '米哈游新遊戲']) {
    assert.equal(approvedFeedArticles(rss(title), it, rules, now).length, 1, title);
  }
  for (const title of ['Apple合作推出功能', 'Google推出新功能', '品牌曝光 AI 汽車']) {
    assert.equal(approvedFeedArticles(rss(title), it, rules, now).length, 0, title);
  }
});

test('old database and snapshot evidence is replaced; invalid rows cannot return after refresh', () => {
  const row = { title: '汽車品牌進軍海外', excerpt: '<p style="text-align:center">汽車品牌</p>',
    review_status: 'approved', source_kind: 'official_rss', rule_ids: 'industry-martech',
    folder_ids: 'folder_4', evidence_jsons: '{"any_hits":["品牌"],"all_hits":["IG"]}' };
  assert.equal(revalidateArticle(row, tw, rules), null);
  assert.equal(revalidateArticle({ ...row, title: 'Apple合作推出功能' }, it, rules), null);
  const good = { ...row, title: 'MyCard遊戲儲值', rule_ids: 'softworld-brand,industry-martech' };
  const clean = revalidateArticle(good, it, rules);
  assert.equal(clean.rule_ids, 'softworld-brand');
  assert.equal(clean.folder_ids, 'folder_1');
  assert.deepEqual(clean.matched_terms, ['MyCard']);
  assert.ok(!clean.excerpt.includes('style'));
  for (const review_status of ['rejected', 'pending']) assert.equal(revalidateArticle({ ...good, review_status }, it, rules), null);
  assert.equal(revalidateArticle(good, { ...it, enabled: false }, rules), null);
  assert.equal(revalidateArticle({ ...good, rule_ids: 'industry-martech' }, it, rules), null);
});

test('Google aggregation revalidation matches only the title and preserves genuine approval terms', () => {
  const source = read('../config/fintech_media_sources.json').sources.find(source => source.id === 'ithome-cn-google-news');
  const row = { title: '米哈游《源初之结》获批版号', excerpt: 'Google News RSS 聚合',
    review_status: 'approved', source_kind: 'google_news_rss', rule_ids: 'industry-cn-game-approval' };
  assert.ok(revalidateArticle(row, source, rules)?.matched_terms.includes('版号'));
  assert.equal(revalidateArticle({ ...row, title: '普通科技新聞', excerpt: row.title }, source, rules), null);
});

test('cleanup withdraws invalid system approvals while preserving manual review and other valid matches', () => {
  const bad = { article_id: 'bad', source_id: it.id, title: 'Apple合作推出功能',
    rule_id: 'industry-platform-business', status: 'approved', reviewed_by: 'system:verified-rss' };
  const good = { ...bad, article_id: 'good', title: 'MyCard遊戲儲值', rule_id: 'softworld-brand' };
  const manual = { ...bad, article_id: 'manual', reviewed_by: 'human:editor' };
  const rejected = { ...bad, article_id: 'rejected', status: 'rejected' };
  const result = correctionSql([bad, good, manual, rejected]);
  assert.equal(result.invalid_matches, 1);
  assert.equal(result.affected_articles, 1);
  assert.ok(!result.sql.includes("article_id = 'manual'"));
  assert.ok(!result.sql.includes("article_id = 'rejected'"));
  assert.ok(!result.sql.includes("article_id = 'good'"));
  const clean = cleanSnapshot({ generated_at: '2026-10-07T22:05:46Z', articles: [
    { ...bad, review_status: 'approved', source_kind: 'official_rss', rule_ids: bad.rule_id },
    { ...good, review_status: 'approved', source_kind: 'official_rss', rule_ids: good.rule_id }
  ] });
  assert.equal(clean.articles.length, 1);
  assert.equal(clean.generated_at, '2026-10-07T22:05:46Z');
  assert.equal(clean.articles[0].rule_ids, 'softworld-brand');
});

test('cached targets and rules refresh when the same object is updated', () => {
  const article = { title: '品牌曝光 IG' };
  const mutableRule = { ...rule('industry-martech') };
  assert.equal(evaluateRule(article, mutableRule).matched, true);
  article.title = '品牌曝光 inline';
  assert.equal(evaluateRule(article, mutableRule).matched, false);
  mutableRule.all_of_json = JSON.stringify(['inline']);
  assert.equal(evaluateRule(article, mutableRule).matched, true);
});
