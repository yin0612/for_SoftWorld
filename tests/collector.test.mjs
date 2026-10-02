import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { verifyItemSource } from '../worker/src/source-verification.mjs';
import { normalizeFeedDate, sourceIsFresh } from '../worker/src/time-quality.mjs';
import { evaluateRule, ruleAutoPublishes, ruleAllowsSource } from '../worker/src/rule-engine.mjs';
import { parseRss } from '../worker/src/rss-parser.mjs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
function worker(overrides = {}) {
    const context = vm.createContext({ URL, URLSearchParams, Date, Intl, Request, Response, AbortController, AbortSignal,
        console, setTimeout, clearTimeout, crypto: webcrypto, verifyItemSource, normalizeFeedDate, sourceIsFresh,
        evaluateRule, ruleAutoPublishes, ruleAllowsSource, parseRss,
        coreSourceConfig: JSON.parse(read('../config/core_media_sources.json')),
        googleSourceConfig: JSON.parse(read('../config/fintech_media_sources.json')), ...overrides });
    vm.runInContext(read('../worker/src/index.js').replace(/^import .*;\r?\n/gm, '').replace('export default {', 'globalThis.worker = {'), context);
    return context;
}

test('scheduled collection isolates a failed invocation and awaits every source with at most four concurrent children', async () => {
    const context = worker();
    context.syncDomesticConfig = async () => {};
    const sources = Array.from({ length: 29 }, (_, i) => ({ id: `source-${i}` }));
    const recorded = [];
    let pending = 0, maxPending = 0;
    const env = { MONITORING_ADMIN_TOKEN: 'test-only', DB: {
        prepare: sql => ({ bind(...values) { recorded.push({ sql, values }); return this; }, run: async () => {}, all: async () => ({ results: sources }) }),
        batch: async statements => recorded.push(...statements),
    }, COLLECTOR: { fetch: async request => {
        assert.equal(request.headers.get('authorization'), 'Bearer test-only');
        const { source_id } = await request.json();
        maxPending = Math.max(maxPending, ++pending);
        await new Promise(resolve => setTimeout(resolve, 2));
        pending--;
        if (source_id === 'source-1') throw Error('invocation exceeded query budget');
        return Response.json({ source_id, result: 'success' });
    } } };
    const runs = await context.collectAll(env);
    assert.equal(runs.length, 29);
    assert.equal(runs.filter(run => run.result === 'success').length, 28);
    assert.equal(runs.find(run => run.source_id === 'source-1').result, 'failed');
    assert.equal(pending, 0); assert.equal(maxPending, 4);
    assert.ok(recorded.some(row => row.sql?.includes('Previous collection did not finish')));
    assert.ok(recorded.some(row => row.values?.includes('source-1')));
});

test('source collector requires authorization and only accepts an enabled database source', async () => {
    const context = worker();
    let queries = 0;
    const env = { MONITORING_ADMIN_TOKEN: 'test-only', DB: {
        prepare: () => { queries++; return { bind: () => ({ first: async () => null }) }; },
    } };
    const request = (body, authorized = true) => new Request('https://example.test/api/internal/collect-source', {
        method: 'POST', headers: authorized ? { authorization: 'Bearer test-only' } : {}, body: JSON.stringify(body),
    });
    assert.equal((await context.worker.fetch(request({ source_id: 'ithome' }, false), env)).status, 404);
    assert.equal(queries, 0);
    assert.equal((await context.worker.fetch(request({ feed_url: 'http://private.test' }), env)).status, 400);
    assert.equal(queries, 0);
    assert.equal((await context.worker.fetch(request({ source_id: 'disabled-source' }), env)).status, 404);
    assert.equal(queries, 1);
});

test('a 200 HTML block page fails collection rather than marking an RSS source healthy', async () => {
    const context = worker({ fetch: async () => new Response('<html>Access denied</html>') });
    const writes = [];
    const env = { DB: {
        prepare: sql => ({ bind(...values) { writes.push({ sql, values }); return this; }, run: async () => {} }),
        batch: async () => {},
    } };
    const result = await context.collectSource({ id: 'ithome', feed_url: 'https://www.ithome.com.tw/rss' }, [], env);
    assert.equal(result.result, 'failed'); assert.match(result.error, /not_rss_or_atom/);
    assert.equal(writes.some(row => row.values.includes('healthy')), false);
    assert.ok(writes.some(row => row.values.includes('failed')));
});

test('collection records completion time after the upstream fetch finishes', async () => {
    const context = worker({ fetch: async () => {
        await new Promise(resolve => setTimeout(resolve, 15));
        return new Response('<?xml version="1.0"?><rss><channel></channel></rss>');
    } });
    const writes = [];
    const env = { DB: {
        prepare: sql => ({ bind(...values) { writes.push({ sql, values }); return this; }, run: async () => {} }),
        batch: async () => {},
    } };
    assert.equal((await context.collectSource({ id: 'ithome', feed_url: 'https://www.ithome.com.tw/rss' }, [], env)).result, 'success');
    const start = writes.find(row => row.sql.startsWith('INSERT INTO collection_runs')).values[2];
    const finish = writes.find(row => row.sql.startsWith('UPDATE collection_runs')).values[0];
    assert.ok(new Date(finish) > new Date(start));
});
