import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Run the refresh lifecycle without the unrelated DOM initialization and routes.
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const refreshSource = app.slice(app.indexOf('let monitoringDataRequest = null;'), app.indexOf('function initMonitoringAutoRefresh()'));

function lifecycle(results) {
    const modes = [], totals = [], warnings = [];
    let warningRenders = 0, loads = 0;
    const context = vm.createContext({
        Date, Promise,
        console: { warn: (...args) => warnings.push(args) },
        window: { location: { hash: '#/fintech' } },
        document: { getElementById: () => null },
        monitoringNews: [], monitoringRuntimeStatus: null, monitoringLoadState: null,
        monitoringRefreshState: { error: false }, monitoringManifest: null,
        loadVerifiedMonitoringArticles: async () => results[loads++],
        loadMonitoringStatus: async () => ({ source_summary: { healthy: loads } }),
        getRollingMonitoringDateRange: () => ({ from: '2026-08-13', to: '2026-10-13' }),
        monitoringFreshness: () => ({ sources: [] }),
        setNewsDataMode: mode => modes.push(mode),
        setVerifiedNewsTotal: total => totals.push(total),
        renderGlobalDataStatusBar: () => { warningRenders++; },
        ...Object.fromEntries(['setVerifiedMonitoringSourceTotal', 'updateRealStatsOverview',
            'refreshVerifiedSourceOptions', 'renderMonitoringTransparency', 'renderHuikeTabs',
            'renderHuikeChips', 'applyNewsFilters', 'renderFintechMonitoring', 'renderGamingMonitoring',
            'renderRealTrends', 'renderCompanyCards'].map(name => [name, () => {}]))
    });
    vm.runInContext(refreshSource, context);
    return { context, modes, totals, warnings, warningRenders: () => warningRenders };
}

test('incomplete refresh preserves the previous dataset and successful sync, then recovers', async () => {
    const originalArticles = [{ title: 'original one' }, { title: 'original two' }];
    const recoveredArticles = [{ title: 'latest one' }, { title: 'latest two' }, { title: 'latest three' }];
    const state = lifecycle([
        { loaded: true, complete: true, total: 2, articles: originalArticles },
        { loaded: true, complete: false, partial: true, total: 3, articles: [{ title: 'latest one' }] },
        { loaded: true, complete: true, total: 3, articles: recoveredArticles }
    ]);
    await state.context.refreshMonitoringData();
    const previousLoad = state.context.monitoringLoadState;
    const previousStatus = state.context.monitoringRuntimeStatus;
    const previousSync = state.context.monitoringRefreshState.syncedAt;

    await state.context.refreshMonitoringData();
    assert.equal(state.context.monitoringNews, originalArticles);
    assert.equal(state.context.monitoringLoadState, previousLoad);
    assert.equal(state.context.monitoringRuntimeStatus, previousStatus);
    assert.equal(state.context.monitoringRefreshState.syncedAt, previousSync);
    assert.equal(state.context.monitoringRefreshState.error, true);
    assert.equal(state.warningRenders(), 1);
    assert.deepEqual(state.totals, [2]);

    await state.context.refreshMonitoringData();
    assert.equal(state.context.monitoringNews, recoveredArticles);
    assert.equal(state.context.monitoringLoadState.complete, true);
    assert.equal(state.context.monitoringRefreshState.error, false);
    assert.deepEqual(state.totals, [2, 3]);
    assert.equal(state.warnings.length, 0);
});

test('initial load may display verified partial data with its incomplete markers', async () => {
    const articles = [{ title: 'verified first page' }];
    const state = lifecycle([{ loaded: true, complete: false, partial: true, total: 3, articles }]);
    await state.context.refreshMonitoringData();
    assert.equal(state.context.monitoringNews, articles);
    assert.equal(state.context.monitoringLoadState.loaded, 1);
    assert.equal(state.context.monitoringLoadState.total, 3);
    assert.equal(state.context.monitoringLoadState.complete, false);
    assert.equal(state.context.monitoringLoadState.partial, true);
    assert.deepEqual(state.modes, ['verified']);
    assert.deepEqual(state.totals, [1]);
    assert.equal(state.warningRenders(), 0);
    assert.equal(state.warnings.length, 0);
});
