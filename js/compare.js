/**
 * 真實新聞比較工具。
 * 只比較 API 已收錄文章，不推估媒體曝光、社群或 KOL 數字。
 */

const compareState = { selectedCompanyIds: [] };
const COMPARE_MAX = 8;
const COMPANY_ALIASES = {
    'soft-world': ['智冠', '智冠科技', '藍新科技', '藍新金流', 'NewebPay', 'MyCard', '中華網龍', '遊戲新幹線'],
    softstar: ['大宇資', '大宇資訊', 'Softstar', '仙劍', '軒轅劍'],
    gamania: ['橘子', '遊戲橘子', 'Gamania', '橘子支付'],
    wanin: ['網銀國際', 'Wanin', '星城'],
    wayi: ['華義', '華義國際', 'Wayi'],
    userjoy: ['宇峻', '宇峻奧汀', 'USERJOY', '三國群英傳'],
    xlegend: ['傳奇網路', 'X-Legend', '精靈樂章', '幻想神域'],
    astro: ['泰偉', 'Astro Corp']
};

function getCompareArticles() {
    return typeof monitoringNews !== 'undefined' && Array.isArray(monitoringNews)
        ? monitoringNews
        : [];
}

function companyMatchesArticle(company, article) {
    const text = [article.title, article.excerpt, ...(article.matchedTerms || [])].filter(Boolean).join(' ').toLowerCase();
    const names = [company.name, company.enName, company.id, ...(COMPANY_ALIASES[company.id] || [])]
        .filter(Boolean).map((value) => String(value).toLowerCase());
    return names.some((name) => text.includes(name));
}

function getCompanyRealStats(company) {
    const articles = getCompareArticles().filter((article) => companyMatchesArticle(company, article));
    const categories = new Map();
    articles.forEach((article) => {
        (article.huikeFolders || [article.huikeFolder]).filter(Boolean).forEach((folder) => {
            categories.set(folder, (categories.get(folder) || 0) + 1);
        });
    });
    const sources = new Set(articles.map((article) => article.source).filter(Boolean));
    const latest = articles.map((article) => article.date).filter(Boolean).sort().pop() || '—';
    return { total: articles.length, sourceCount: sources.size, latest, categories };
}

function folderCompareLabel(folderId) {
    if (typeof HUIKE_2025_STRUCTURE !== 'undefined') {
        const folder = HUIKE_2025_STRUCTURE.find((entry) => entry.id === folderId);
        if (folder) return String(folder.folderName || folder.name || folderId).replace(/^\d+\.\s*/, '');
    }
    return folderId;
}

function renderCompareUI(container) {
    const selectors = COMPANIES.map((company) => {
        const active = compareState.selectedCompanyIds.includes(company.id);
        return `<button type="button" class="compare-company-btn ${active ? 'active' : ''}" data-id="${company.id}" aria-pressed="${active}">${company.name}</button>`;
    }).join('');
    container.innerHTML = `
        <div class="compare-controls" style="margin-bottom:20px;text-align:center;">
            <div class="company-selectors" id="compare-company-selectors" style="display:flex;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">${selectors}</div>
            <p class="method-muted">僅顯示近兩個月 API 真實新聞命中數；沒有資料時顯示 0，不使用估算值。</p>
        </div>
        <div class="compare-table-container" style="background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #f1f5f9;overflow-x:auto;">
            <div id="compareTableContainer"></div>
        </div>
    `;
    container.querySelectorAll('.compare-company-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const index = compareState.selectedCompanyIds.indexOf(id);
            if (index >= 0) {
                if (compareState.selectedCompanyIds.length <= 1) return;
                compareState.selectedCompanyIds.splice(index, 1);
            } else if (compareState.selectedCompanyIds.length < COMPARE_MAX) {
                compareState.selectedCompanyIds.push(id);
            }
            renderCompareUI(container);
            renderComparisonTable(document.getElementById('compareTableContainer'));
        });
    });
}

function renderComparisonTable(container) {
    if (!container) return;
    const selected = COMPANIES.filter((company) => compareState.selectedCompanyIds.includes(company.id));
    if (!selected.length) {
        container.innerHTML = '<p class="method-muted">請選擇至少一家企業。</p>';
        return;
    }
    const stats = selected.map(getCompanyRealStats);
    const folderIds = [...new Set(stats.flatMap((stat) => [...stat.categories.keys()]))];
    const rows = [
        ['真實新聞總數', stats.map((stat) => stat.total.toLocaleString())],
        ['實際來源數', stats.map((stat) => stat.sourceCount.toLocaleString())],
        ['最新發布日期', stats.map((stat) => stat.latest)],
        ...folderIds.map((folder) => [folderCompareLabel(folder), stats.map((stat) => (stat.categories.get(folder) || 0).toLocaleString())])
    ];
    container.innerHTML = `
        <table class="method-table compare-real-table">
            <caption class="sr-only">企業真實新聞監測比較</caption>
            <thead><tr><th scope="col">監測指標</th>${selected.map((company) => `<th scope="col">${company.name}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(([label, values]) => `<tr><th scope="row">${label}</th>${values.map((value) => `<td>${value}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
    `;
}

function initCompare(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!compareState.selectedCompanyIds.length) compareState.selectedCompanyIds = COMPANIES.slice(0, 3).map((company) => company.id);
    renderCompareUI(container);
    renderComparisonTable(document.getElementById('compareTableContainer'));
}

function forceResizeCompareCharts() {
    initCompare('compareContainer');
}

window.initCompare = initCompare;
window.forceResizeCompareCharts = forceResizeCompareCharts;
