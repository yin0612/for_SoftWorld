import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { configuredRules, evaluateRule, ruleAutoPublishes } from '../worker/src/rule-engine.mjs';
import { approvedFeedArticles } from '../scripts/update_rss_snapshot.mjs';

const config = JSON.parse(fs.readFileSync(new URL('../config/monitoring_rules.json', import.meta.url), 'utf8'));
const rules = configuredRules(config);
const rule = rules.find(rule => rule.id === 'industry-ai-commerce');
const headline = 'LINE 各項服務將融合更多 AI Agent 為個人、商家及線上購物提供更強大且方便的功能';

test('AI commerce auto-publishes the supplied LINE headline and other service applications', () => {
    for (const title of [headline, 'LINE 結合 AI，打造購物助手', '電商導入人工智慧客服',
        'AI代理協助訂位與訂餐', '商家打造智慧助理', 'Agentic AI transforms shopping']) {
        const result = evaluateRule({ title }, rule);
        assert.equal(result.matched, true, title);
        assert.equal(ruleAutoPublishes(rule, result.evidence), true);
    }
    for (const title of ['LINE 購物雙十一促銷', 'AI 晶片效能提升', '商家推出全新優惠', 'Thailand shopping festival']) {
        assert.equal(evaluateRule({ title }, rule).matched, false, title);
    }
});

test('official RSS preserves the rule, folder, provenance and evidence for AI services', () => {
    const source = { id: 'fixture', name: 'Fixture', domain: 'example.com', region: 'TW',
        enabled: true, auto_publish: true, feed_url: 'https://example.com/feed' };
    const xml = `<rss><channel><item><title>平台服務更新</title><description>LINE 結合 AI，打造購物助手</description>
        <link>https://example.com/news/line-ai</link><pubDate>Tue, 13 Oct 2026 04:00:00 GMT</pubDate></item></channel></rss>`;
    const rows = approvedFeedArticles(xml, source, rules, new Date('2026-10-30T00:00:00Z'));
    assert.equal(rows.length, 1);
    assert.ok(rows[0].rule_ids.includes(rule.id));
    assert.ok(rows[0].folder_ids.includes('folder_4'));
    assert.equal(rows[0].source_kind, 'official_rss');
    assert.ok(rows[0].evidence_jsons.includes('rss_excerpt'));
});
