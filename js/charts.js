/**
 * 真實監測圖表模組。
 * Chart.js 只在使用者進入分析頁時載入，圖表資料完全來自 monitoringNews。
 */

const charts = {};
const CHART_JS_SRC = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
let chartJsPromise = null;

function ensureChartJs() {
    if (window.Chart) return Promise.resolve(window.Chart);
    if (chartJsPromise) return chartJsPromise;
    chartJsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = CHART_JS_SRC;
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        script.onload = () => resolve(window.Chart);
        script.onerror = () => reject(new Error('Chart.js 載入失敗'));
        document.head.appendChild(script);
    });
    return chartJsPromise;
}

function getRealArticles() {
    return typeof monitoringNews !== 'undefined' && Array.isArray(monitoringNews)
        ? monitoringNews.filter((article) => article && article.title)
        : [];
}

function getRealRange() {
    const range = typeof monitoringLoadState !== 'undefined' ? monitoringLoadState?.range : null;
    if (range?.from && range?.to) return `${range.from} — ${range.to}`;
    if (typeof getRollingMonitoringDateRange === 'function') {
        const fallback = getRollingMonitoringDateRange();
        return `${fallback.from} — ${fallback.to}`;
    }
    return '近兩個月 — 今天';
}

function destroyChart(id) {
    if (charts[id]) {
        try { charts[id].destroy(); } catch (_) {}
        delete charts[id];
    }
}

function chartColors(count) {
    const palette = ['#0f766e', '#e76f51', '#48cae4', '#f4a261', '#9d4edf', '#4a7c59', '#64748b', '#f59e0b', '#2563eb', '#db2777'];
    return Array.from({ length: count }, (_, index) => palette[index % palette.length]);
}

function folderLabel(folderId) {
    if (typeof HUIKE_2025_STRUCTURE !== 'undefined') {
        const folder = HUIKE_2025_STRUCTURE.find((entry) => entry.id === folderId);
        if (folder) return String(folder.folderName || folder.name || folderId).replace(/^\d+\.\s*/, '');
    }
    if (typeof monitoringManifest !== 'undefined' && monitoringManifest?.folders) {
        const folder = monitoringManifest.folders.find((entry) => entry.id === folderId);
        if (folder?.name) return folder.name;
    }
    return folderId;
}

function folderCounts(articles) {
    const counts = new Map();
    articles.forEach((article) => {
        const folders = Array.isArray(article.huikeFolders) && article.huikeFolders.length
            ? article.huikeFolders
            : [article.huikeFolder];
        folders.filter(Boolean).forEach((folder) => counts.set(folder, (counts.get(folder) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function sourceCounts(articles) {
    const counts = new Map();
    articles.forEach((article) => {
        const source = article.source || '來源未提供';
        counts.set(source, (counts.get(source) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
}

function keywordCounts(articles) {
    const counts = new Map();
    articles.forEach((article) => {
        const terms = Array.isArray(article.matchedTerms) ? article.matchedTerms : [];
        const unique = new Set(terms.filter(Boolean));
        unique.forEach((term) => counts.set(term, (counts.get(term) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
}

function dateCounts(articles) {
    const counts = new Map();
    articles.forEach((article) => {
        if (!article.date) return;
        const current = counts.get(article.date) || { official: 0, aggregated: 0 };
        if (article.sourceKind === 'google_news_rss') current.aggregated += 1;
        else current.official += 1;
        counts.set(article.date, current);
    });
    const labels = [...counts.keys()].sort();
    return {
        labels,
        official: labels.map((label) => counts.get(label).official),
        aggregated: labels.map((label) => counts.get(label).aggregated)
    };
}

function applyChartDefaults() {
    if (!window.Chart) return;
    window.Chart.defaults.color = '#5a6578';
    window.Chart.defaults.font.family = "'Noto Sans TC', 'Inter', sans-serif";
    window.Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(43, 48, 58, 0.9)';
    window.Chart.defaults.plugins.tooltip.padding = 10;
    window.Chart.defaults.plugins.tooltip.cornerRadius = 8;
    window.Chart.defaults.plugins.legend.labels.usePointStyle = true;
    window.Chart.defaults.scale.grid.color = 'rgba(229, 233, 240, 0.7)';
}

function makeChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas || !window.Chart) return;
    destroyChart(id);
    charts[id] = new window.Chart(canvas, config);
}

function renderRealSummary(articles) {
    const host = document.getElementById('analyticsInsights');
    if (!host) return;
    const official = articles.filter((article) => article.sourceKind !== 'google_news_rss').length;
    const aggregated = articles.length - official;
    const sourceTotal = new Set(articles.map((article) => article.source).filter(Boolean)).size;
    const latest = articles.map((article) => article.date).filter(Boolean).sort().pop() || '待更新';
    const cards = [
        ['📰', '真實新聞', articles.length.toLocaleString(), '目前監測窗口'],
        ['✓', '官方 RSS', official.toLocaleString(), '已驗證來源文章'],
        ['🔎', 'Google News 聚合', aggregated.toLocaleString(), '保留原文索引'],
        ['📡', '實際來源', sourceTotal.toLocaleString(), `最新發布 ${latest}`]
    ];
    host.innerHTML = cards.map(([icon, label, value, note]) => `
        <article class="insight-card">
            <div class="insight-card-top"><span class="insight-card-icon" aria-hidden="true">${icon}</span><span class="insight-card-label">${label}</span></div>
            <p class="insight-card-value">${value}</p>
            <p class="insight-card-note">${note}</p>
        </article>
    `).join('');
}

function renderEmptyAnalytics(message) {
    const host = document.getElementById('analyticsInsights');
    if (host) host.innerHTML = `<p class="method-muted">${message}</p>`;
    ['exposureTrendChart', 'categoryChart', 'sourceChart', 'keywordChart'].forEach((id) => destroyChart(id));
}

function renderAnalyticsCharts() {
    const analytics = document.getElementById('analytics');
    if (!analytics || window.getComputedStyle(analytics).display === 'none') return;
    const articles = getRealArticles();
    const rangeLabel = document.getElementById('trendRangeLabel');
    if (rangeLabel) rangeLabel.textContent = `資料區間：${getRealRange()}`;
    if (!articles.length) {
        renderEmptyAnalytics('正在等待真實新聞監測資料；資料服務無法驗證時不會以其他資料補足。');
        return;
    }
    renderRealSummary(articles);
    ensureChartJs().then(() => {
        applyChartDefaults();
        const dates = dateCounts(articles);
        makeChart('exposureTrendChart', {
            type: 'line',
            data: { labels: dates.labels, datasets: [
                { label: '官方 RSS', data: dates.official, borderColor: '#0f766e', backgroundColor: 'rgba(15,118,110,.12)', fill: true, tension: .25 },
                { label: 'Google News 聚合', data: dates.aggregated, borderColor: '#e76f51', backgroundColor: 'rgba(231,111,81,.08)', fill: true, tension: .25 }
            ] },
            options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { tooltip: { callbacks: { label: (context) => `${context.dataset.label}：${context.parsed.y} 篇` } } } }
        });

        const categories = folderCounts(articles);
        makeChart('categoryChart', {
            type: 'bar', data: { labels: categories.map(([id]) => folderLabel(id)), datasets: [{ label: '文章數', data: categories.map(([, count]) => count), backgroundColor: chartColors(categories.length) }] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { display: false } } }
        });

        const sources = sourceCounts(articles);
        makeChart('sourceChart', {
            type: 'bar', data: { labels: sources.map(([name]) => name), datasets: [{ label: '文章數', data: sources.map(([, count]) => count), backgroundColor: '#48cae4' }] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { display: false } } }
        });

        const keywords = keywordCounts(articles);
        makeChart('keywordChart', {
            type: 'bar', data: { labels: keywords.map(([term]) => term), datasets: [{ label: '命中文章數', data: keywords.map(([, count]) => count), backgroundColor: '#f4a261' }] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { display: false } } }
        });
    }).catch((error) => {
        console.warn('[charts] Chart.js unavailable', error);
        renderEmptyAnalytics('圖表元件載入失敗，但真實新聞清單仍可正常使用。');
    });
}

function forceResizeAllCharts() {
    Object.values(charts).forEach((chart) => {
        try { chart.resize(); } catch (_) {}
    });
}

window.renderAnalyticsCharts = renderAnalyticsCharts;
window.forceResizeAllCharts = forceResizeAllCharts;
