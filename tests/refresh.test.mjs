import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const context = vm.createContext({ Intl, Date, Promise, setInterval, console });
vm.runInContext(fs.readFileSync(new URL('../js/refresh.js', import.meta.url), 'utf8'), context);

test('Taipei date boundaries and month-end clamping are independent of browser timezone', () => {
    for (const [time, from, to] of [
        ['2026-09-30T16:01:00Z', '2026-08-01', '2026-10-01'],
        ['2026-08-30T16:01:00Z', '2026-06-30', '2026-08-31'],
        ['2026-01-30T16:01:00Z', '2025-11-30', '2026-01-31'],
    ]) {
        const range = context.monitoringDateRange(new Date(time));
        assert.equal(range.from, from);
        assert.equal(range.to, to);
    }
});

test('only recent successful RSS checks count as healthy', () => {
    const now = Date.parse('2026-10-01T09:00:00Z');
    assert.equal(context.monitoringSourceIsFresh({ health_status: 'healthy', last_success_at: '2026-10-01T08:00:00Z' }, now), true);
    for (const last_success_at of [null, 'invalid', '2026-09-15T08:00:00Z', '2026-10-01T10:00:00Z']) {
        assert.equal(context.monitoringSourceIsFresh({ health_status: 'healthy', last_success_at }, now), false);
    }
});

test('all pages share a timer, overlapping refreshes coalesce, hidden pages pause and failures recover', async () => {
    let now = 0, visible = true, calls = 0, finish, tick, errors = 0;
    const coordinator = context.createMonitoringRefreshCoordinator({
        load: () => { calls++; return new Promise(resolve => { finish = resolve; }); },
        isVisible: () => visible, now: () => now,
        interval: (callback, period) => { tick = callback; assert.equal(period, 300000); },
        onError: () => { errors++; }
    });
    const first = coordinator.refresh();
    const concurrent = coordinator.refresh(true);
    assert.equal(first, concurrent);
    await Promise.resolve();
    assert.equal(calls, 1);
    finish(); await first;
    assert.equal(await coordinator.refresh(), false);
    now = 300000; visible = false;
    tick(); await Promise.resolve(); assert.equal(calls, 1);
    visible = true;
    const resumed = coordinator.refresh(); await Promise.resolve(); finish(); await resumed;
    assert.equal(calls, 2); assert.equal(errors, 0);
    let attempts = 0;
    const failing = context.createMonitoringRefreshCoordinator({
        load: () => { if (++attempts === 1) throw Error('offline'); },
        isVisible: () => true, interval: () => {}, onError: () => { errors++; }
    });
    await failing.refresh(true); await failing.refresh(true);
    assert.equal(attempts, 2); assert.equal(errors, 1);
});

test('stale, partial, failed sync and missing status remain visible', () => {
    const now = Date.parse('2026-10-01T09:00:00Z');
    const status = { source_summary: { latest_success: '2026-10-01T08:17:00Z' }, enabled_sources: [] };
    const load = { complete: true, aggregatedSnapshot: { generated_at: '2026-10-01T04:00:00Z' } };
    assert.equal(context.monitoringFreshness(status, load, {}, now).issues.length, 0);
    assert.ok(context.monitoringFreshness(null, { complete: false, partial: true }, { error: true }, now).issues.length >= 5);
});

test('a fresh successful RSS backup restores coverage but expired or failed checks do not', () => {
    const now = Date.parse('2026-10-01T09:00:00Z');
    const status = { enabled_sources: [{ id: 'gamebase', health_status: 'stale', last_success_at: '2026-09-15T00:00:00Z' }] };
    const load = { complete: true, aggregatedSnapshot: { generated_at: '2026-10-01T04:00:00Z' },
        rssSnapshot: { generated_at: '2026-10-01T08:23:00Z', results: [{ source_id: 'gamebase', result: 'success', checked_at: '2026-10-01T08:23:00Z' }] } };
    assert.equal(context.monitoringFreshness(status, load, {}, now).healthy, 1);
    assert.equal(context.monitoringFreshness(status, load, {}, now).issues.length, 0);
    load.rssSnapshot.results[0].result = 'failed';
    assert.equal(context.monitoringFreshness(status, load, {}, now).healthy, 0);
    load.rssSnapshot.results[0].result = 'success';
    load.rssSnapshot.results[0].checked_at = '2026-10-01T06:23:00Z';
    assert.equal(context.monitoringFreshness(status, load, {}, now).healthy, 0);
});
