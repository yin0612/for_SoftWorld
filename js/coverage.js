/** 企業覆蓋只按企業名稱／明確品牌別名判定，不以產品 IP 推定企業。 */
const COVERAGE_COMPANIES = [
    ['智冠', ['智冠', 'Soft-World', 'Soft World']],
    ['藍新', ['藍新', 'NewebPay']],
    ['大宇資訊／光聚', ['大宇資訊', '大宇資', 'Softstar', '光聚晶電', '光聚']],
    ['遊戲橘子', ['遊戲橘子', 'Gamania']],
    ['網銀國際', ['網銀國際', 'Wanin']],
    ['華義國際', ['華義國際', '華義', 'Wayi']],
    ['宇峻奧汀', ['宇峻奧汀', '宇峻', 'Userjoy']],
    ['傳奇網路', ['傳奇網路', 'X-Legend']],
    ['泰偉', ['泰偉', 'Astro Corp']],
    ['綠界科技', ['綠界科技', '綠界', 'ECPay']],
    ['紅陽科技', ['紅陽科技', '紅陽', 'SunTech']],
    ['LINE Pay', ['LINE Pay']],
    ['街口支付', ['街口支付', '街口電子支付']],
    ['全支付', ['全支付']]
];

function coverageEscape(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function coverageMatches(article, aliases) {
    const text = [article.title, article.excerpt, ...(article.matchedTerms || [])].filter(Boolean).join(' ').normalize('NFKC').toLowerCase();
    return aliases.some((alias) => {
        const term = alias.normalize('NFKC').toLowerCase();
        if (/^[\x00-\x7F]+$/.test(term)) {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i').test(text);
        }
        return text.includes(term);
    });
}

function coverageUrl(value) {
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
}

function getCoverageStats(articles) {
    return COVERAGE_COMPANIES.map(([name, aliases]) => {
        const seen = new Set();
        const matched = articles.filter((article) => {
            if (!coverageMatches(article, aliases)) return false;
            const source = String(article.source || '').normalize('NFKC').trim().replace(/\s+/g, ' ');
            const key = coverageUrl(article.url) || JSON.stringify([source, article.date, article.title]);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        const sources = new Map();
        matched.forEach((article) => {
            const source = String(article.source || '').normalize('NFKC').trim().replace(/\s+/g, ' ');
            if (!source) return;
            const key = source.toLowerCase();
            if (!sources.has(key)) sources.set(key, { name: source, articles: [] });
            sources.get(key).articles.push(article);
        });
        return { name, total: matched.length, unknown: matched.filter((article) => !String(article.source || '').trim()).length,
            sources: [...sources.values()].sort((a, b) => b.articles.length - a.articles.length || a.name.localeCompare(b.name, 'zh-Hant')) };
    });
}

function renderCompanyCoverage(articles) {
    const host = document.getElementById('companyCoverage');
    if (!host) return;
    if (!articles.length) {
        host.innerHTML = '<p class="method-muted">尚無可分析的新聞資料，等待資料載入後更新企業媒體覆蓋。</p>';
        return;
    }
    const rows = getCoverageStats(articles);
    host.innerHTML = `<div class="coverage-table-wrap"><table class="method-table coverage-table">
        <caption class="sr-only">企業媒體覆蓋與報導清單</caption>
        <thead><tr><th scope="col">企業</th><th scope="col">報導媒體數</th><th scope="col">已收錄報導</th><th scope="col">媒體與新聞</th></tr></thead>
        <tbody>${rows.map((row) => `<tr><th scope="row">${coverageEscape(row.name)}</th><td><strong>${row.sources.length}</strong> 家</td><td>${row.total} 篇${row.unknown ? `<br><small>其中 ${row.unknown} 篇未提供來源</small>` : ''}</td><td>${row.sources.length ? `<details><summary>查看 ${row.sources.length} 家媒體</summary><div class="coverage-sources">${row.sources.map((source) => `<details><summary>${coverageEscape(source.name)} · ${source.articles.length} 篇</summary><ul>${source.articles.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).map((article) => {
            const url = coverageUrl(article.url);
            return `<li><span class="chart-card-subtitle">${coverageEscape(article.date || '日期未提供')} · ${article.sourceKind === 'google_news_rss' ? 'Google News 聚合' : 'RSS'}</span><br>${url ? `<a href="${coverageEscape(url)}" target="_blank" rel="noopener noreferrer">${coverageEscape(article.title)}</a>` : coverageEscape(article.title)}</li>`;
        }).join('')}</ul></details>`).join('')}</div></details>` : '目前未收錄具名媒體報導'}</td></tr>`).join('')}</tbody></table></div>`;
}
