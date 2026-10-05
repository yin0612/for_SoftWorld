import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const companies = JSON.parse(read('../config/company_coverage.json')).companies;

function context() {
    const host = { innerHTML: '' };
    const ctx = vm.createContext({ URL, Date, Intl, AbortSignal,
        fetch: async () => ({ ok: true, json: async () => ({ companies: [] }) }),
        document: { getElementById: () => host, querySelectorAll: () => [] } });
    vm.runInContext(read('../js/coverage-companies.js') + '\n' + read('../js/coverage.js'), ctx);
    return { ctx, host };
}

test('every pictured company and institution remains visible without any news', () => {
    const { ctx, host } = context();
    const stats = ctx.getCoverageStats([]);
    assert.equal(stats.length, 16);
    for (const name of ['威肯金融', '群心網路', '智酷媒體／RE:AD', '智雲科技／絕世好雲', '智冠科技文化藝術基金會', '遊戲音樂創作基地／智冠音樂中心']) {
        assert.ok(stats.some(row => row.name === name));
    }
    assert.ok(!stats.some(row => row.name.includes('淘米')));
    ctx.renderCompanyCoverage([]);
    assert.equal((host.innerHTML.match(/data-company-check=/g) || []).length, 16);
    assert.ok(host.innerHTML.includes('等待新聞資料載入'));
});

test('precise aliases match each row without attributing ordinary READ or broad cloud news', () => {
    const { ctx } = context();
    for (const company of companies) {
        for (const alias of company.aliases) {
            assert.equal(ctx.coverageMatches({ title: `${alias} 發布消息` }, company.aliases), true);
        }
    }
    assert.equal(ctx.coverageMatches({ title: 'Read about the cloud services market' }, companies.find(c => c.id === 'read').aliases), false);
    assert.equal(ctx.coverageMatches({ title: '全球雲端科技發展' }, companies.find(c => c.id === 'myserver').aliases), false);
});

test('same publisher and URL are deduplicated and each article retains its source', () => {
    const { ctx } = context();
    const article = { title: '群心網路發布消息', source: '經濟日報', sourceHomepage: 'https://money.udn.com/', url: 'https://money.udn.com/a' };
    const row = ctx.getCoverageStats([article, article]).find(c => c.id === 'cservice');
    assert.equal(row.total, 1);
    assert.equal(row.sources.length, 1);
    assert.equal(row.sources[0].articles[0].url, article.url);
});
