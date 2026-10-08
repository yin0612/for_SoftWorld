import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { verifyItemSource } from '../worker/src/source-verification.mjs';
import { normalizeFeedDate, sourceIsFresh } from '../worker/src/time-quality.mjs';
import { evaluateRule, ruleAutoPublishes, ruleAllowsSource, configuredRules, revalidateArticle } from '../worker/src/rule-engine.mjs';
import { parseRss } from '../worker/src/rss-parser.mjs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const row = (id, extra = {}) => ({ id, source_id: 'ithome', source: 'iThome', title: '智冠發布新聞',
    url: `https://www.ithome.com.tw/news/${id}`, published_at: '2026-09-20T00:00:00Z',
    folder_ids: 'folder_1', rule_ids: 'softworld-brand', source_kind: 'official_rss', ...extra });

function client(payloads) {
    let calls = 0;
    const context = vm.createContext({ Date, Intl, URLSearchParams, AbortSignal, setTimeout,
        fetch: async () => ({ ok: true, json: async () => payloads[calls++] }) });
    context.window = context;
    vm.runInContext(read('../js/monitoring.js'), context);
    return { context, calls: () => calls };
}
test('frontend reads all pages and flags a broken cursor rather than silently truncating totals', async () => {
    const { context, calls } = client([
        { articles: [row('1')], total: 2, has_more: true, next_offset: 1 },
        { articles: [row('2')], total: 2, has_more: false },
    ]);
    const data = await context.loadVerifiedMonitoringArticles();
    assert.equal(data.articles.length, 2); assert.equal(data.complete, true); assert.equal(calls(), 2);
    const broken = client([{ articles: [row('1')], total: 2, has_more: true, next_offset: 0 }]);
    assert.equal((await broken.context.loadVerifiedMonitoringArticles()).complete, false);
});
test('client rejects future dates, deduplicates URLs and forwards snapshot quality', async () => {
    const { context } = client([{ articles: [row('1'), row('1'), row('future', { published_at: '2099-10-01T00:00:00Z' })], total: 3,
        partial: true, aggregated_snapshot: { generated_at: '2026-09-20T00:00:00Z', error_count: 2 } }]);
    const data = await context.loadVerifiedMonitoringArticles();
    assert.equal(data.articles.length, 1); assert.equal(data.complete, false); assert.equal(data.partial, true);
    assert.equal(data.aggregatedSnapshot.error_count, 2);
});
test('Worker excludes future, out-of-range and unapproved-domain rows and counts only the result', () => {
    const context = vm.createContext({ URL, URLSearchParams, Date, Intl, Request, Response, AbortController, AbortSignal,
        console, setTimeout, clearTimeout, verifyItemSource, normalizeFeedDate, sourceIsFresh, evaluateRule, ruleAutoPublishes, ruleAllowsSource, configuredRules, revalidateArticle, parseRss,
        coreSourceConfig: JSON.parse(read('../config/core_media_sources.json')),
        monitoringRuleConfig: JSON.parse(read('../config/monitoring_rules.json')),
        googleSourceConfig: JSON.parse(read('../config/fintech_media_sources.json')) });
    vm.runInContext(read('../worker/src/index.js').replace(/^import .*;\r?\n/gm, '').replace('export default {', 'globalThis.worker = {'), context);
    const payload = context.makeArticlePayload([row('1'), row('1'), row('2', { url: 'https://www.ithome.com.tw.evil.test/a' }),
        row('3', { published_at: '2099-01-01T00:00:00Z' }), row('4', { published_at: '2025-01-01T00:00:00Z' })],
        { offset: 0, limit: 2000, fromDate: '2026-08-01', toDate: '2026-10-01', dataMode: 'test' });
    assert.equal(payload.total, 1); assert.equal(payload.articles.length, 1); assert.equal(payload.has_more, false);
    assert.ok(payload.generated_at);
});

test('RSS backup cannot restore rejected URLs and failed review lookup is reported and blocked', async () => {
    const context = vm.createContext({ URL, URLSearchParams, Date, Intl, Request, Response, AbortController, AbortSignal,
        console, setTimeout, clearTimeout, verifyItemSource, normalizeFeedDate, sourceIsFresh, evaluateRule, ruleAutoPublishes, ruleAllowsSource, configuredRules, revalidateArticle, parseRss,
        coreSourceConfig: JSON.parse(read('../config/core_media_sources.json')),
        monitoringRuleConfig: JSON.parse(read('../config/monitoring_rules.json')),
        googleSourceConfig: JSON.parse(read('../config/fintech_media_sources.json')) });
    vm.runInContext(read('../worker/src/index.js').replace(/^import .*;\r?\n/gm, '').replace('export default {', 'globalThis.worker = {'), context);
    const rejected = 'https://www.ithome.com.tw/news/rejected';
    const approved = 'https://www.ithome.com.tw/news/approved';
    const env = { DB: { prepare: () => ({ bind: status => ({ all: async () => ({ results: status === 'rejected' ? [{ canonical_url: rejected }] : [] }) }) }) } };
    assert.equal((await context.findExistingArticleUrls(env, [rejected, approved], 'rejected')).has(rejected), true);
    const diagnostics = [];
    const failing = { DB: { prepare: () => { throw Error('quota'); } } };
    const blocked = await context.findExistingArticleUrls(failing, [rejected, approved], 'rejected', diagnostics);
    assert.equal(blocked.size, 2);
    assert.equal(diagnostics[0].result, 'review_lookup_error');
});
