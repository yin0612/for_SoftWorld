import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { configuredRules, approvedFeedArticles } from '../scripts/update_rss_snapshot.mjs';
import { evaluateRule, ruleAutoPublishes } from '../worker/src/rule-engine.mjs';
const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const rules = configuredRules(JSON.parse(read('../config/monitoring_rules.json')));
const rule = rules.find(rule => rule.id === 'industry-cn-game-approval');

test('Worker approval rule requires game context and auto-publishes real bilingual news', () => {
    for (const title of ['九月份版号名单出炉！米哈游《源初之结》过审', '中國9月國產遊戲版號公布',
        '2026年进口网络游戏审批信息', '2026年游戏审批变更信息']) {
        const result = evaluateRule({ title }, rule);
        assert.equal(result.matched, true, title);
        assert.equal(ruleAutoPublishes(rule, result.evidence), true);
    }
    for (const title of ['国产电影版号获批', '进口图书版号下发', '现代坦克通过军事验收', '遊戲版本號更新']) {
        assert.equal(evaluateRule({ title }, rule).matched, false, title);
    }
});

test('IT之家 official RSS uses a distinct mainland domain and retains approval evidence', () => {
    const source = JSON.parse(read('../config/core_media_sources.json')).sources.find(source => source.id === 'ithome-cn');
    const rss = link => `<rss><channel><item><title>2026年9月209款游戏版号下发</title><link>${link}</link>
        <pubDate>Wed, 30 Sep 2026 10:04:11 GMT</pubDate></item></channel></rss>`;
    const rows = approvedFeedArticles(rss('https://www.ithome.com/1/008/861.htm'), source, rules, new Date('2026-10-06T00:00:00Z'));
    assert.equal(rows.length, 1);
    assert.ok(rows[0].rule_ids.includes('industry-cn-game-approval'));
    assert.equal(rows[0].source_kind, 'official_rss');
    assert.equal(approvedFeedArticles(rss('https://www.ithome.com.tw/news/123'), source, rules, new Date('2026-10-06T00:00:00Z')).length, 0);
});

test('approval-only articles appear in gaming and the dedicated filter, without mobile ranking labels', () => {
    const context = vm.createContext({ document: { addEventListener() {} }, window: {}, console });
    vm.runInContext(read('../js/app.js'), context);
    const article = { ruleIds: ['industry-cn-game-approval'] };
    assert.equal(context.isGamingMonitoringArticle(article), true);
    assert.deepEqual(Array.from(context.getGamingCategoryLabels(article)), ['中國遊戲版號與審批']);
    assert.equal(vm.runInContext("GAMING_MODE_RULE_IDS.approval.has('industry-cn-game-approval')", context), true);
});
