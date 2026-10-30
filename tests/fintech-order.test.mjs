import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');

function page(articles) {
    const elements = Object.fromEntries(['fintechMonitoringSummary', 'fintechNewsGrid',
        'fintechResultCount', 'fintechLoadMore', 'fintechSourceFilter', 'fintechKeywordFilter']
        .map(id => [id, { value: '', children: [], replaceChildren() { this.children = []; },
            appendChild(child) { this.children.push(child); } }]));
    const context = vm.createContext({ console, window: {},
        document: { addEventListener() {}, getElementById: id => elements[id] || null } });
    vm.runInContext(app, context);
    // Exercise the actual filter, ordering and pagination, omitting unrelated card markup.
    for (const name of ['updateFintechModeButtons', 'refreshFintechSourceOptions',
        'renderFintechSummary', 'renderFintechKeywordPills']) context[name] = () => {};
    context.createFintechArticleCard = article => article;
    context.articles = articles;
    vm.runInContext("monitoringNews = articles; monitoringDataMode = 'verified'; fintechMode = 'stablecoin';", context);
    return { context, elements, render() { context.renderFintechMonitoring();
        return elements.fintechNewsGrid.children; } };
}

const article = (id, date, rule = 'stablecoin-core') => ({ id, date, title: id,
    folderIds: ['folder_6'], ruleIds: [rule], source: '媒體', sourceKind: 'google_news_rss' });

test('stablecoin dates stay newest first across priorities, pagination and filters', () => {
    const articles = [article('奧丁丁', '2026-10-28'), article('old-vasp', '2026-09-30', 'stablecoin-vasp'),
        article('old-core', '2026-09-09'),
        ...Array.from({ length: 23 }, (_, i) => article(`latest-${i}`, '2026-10-30'))];
    const state = page(articles);
    const check = rows => {
        const dates = rows.map(row => row.date);
        assert.deepEqual(dates, [...dates].sort().reverse());
    };
    const first = state.render();
    check(first);
    assert.equal(first.length, 20);
    assert.ok(first.every(row => row.date === '2026-10-30'));
    assert.equal(state.elements.fintechLoadMore.hidden, false);
    vm.runInContext('fintechPage = 2', state.context);
    const all = state.render();
    check(all);
    assert.equal(all.length, articles.length);
    assert.equal(state.elements.fintechLoadMore.hidden, true);
    state.elements.fintechSourceFilter.value = '媒體';
    state.elements.fintechKeywordFilter.value = 'latest';
    check(state.render());
    assert.equal(state.render().length, 23);
    // Refresh input order must not move older priorities ahead of the latest date.
    articles.reverse();
    state.elements.fintechKeywordFilter.value = '';
    check(state.render());
});

test('same-day OwlPay and VASP priority is retained without changing article dates', () => {
    const state = page([article('ordinary', '2026-10-30'),
        article('vasp', '2026-10-30', 'stablecoin-vasp'), article('OwlPay', '2026-10-30')]);
    assert.deepEqual(state.render().map(row => row.id), ['OwlPay', 'vasp', 'ordinary']);
    assert.ok(state.render().every(row => row.date === '2026-10-30'));
});
