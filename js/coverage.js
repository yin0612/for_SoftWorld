/** 智冠集團公司與品牌分項覆蓋；名單來自 coverage-companies.js。 */

const COVERAGE_MEDIA_NAMES = [
    ['money.udn.com', '經濟日報'], ['udn.com', '聯合新聞網'],
    ['cna.com.tw', '中央社'], ['nccc.com.tw', '聯合信用卡處理中心'],
    ['ltn.com.tw', '自由時報'], ['cardu.com.tw', '卡優新聞網'],
    ['cnyes.com', '鉅亨網'], ['ctee.com.tw', '工商時報'],
    ['ithome.com.tw', 'iThome'], ['technews.tw', '科技新報']
];

function coverageSourceName(article) {
    const url = coverageUrl(article.sourceHomepage) || coverageUrl(article.url);
    const host = url ? new URL(url).hostname.toLowerCase().replace(/^www\./, '') : '';
    const canonical = COVERAGE_MEDIA_NAMES.find(([domain]) => host === domain || host.endsWith(`.${domain}`));
    return canonical ? canonical[1] : String(article.source || '').normalize('NFKC').trim().replace(/\s+/g, ' ');
}

let coverageVerificationPromise;
let coverageVerificationExpires = 0;
function renderSourceVerification() {
    const host = document.getElementById('sourceVerification');
    if (!host) return;
    if (!coverageVerificationPromise || Date.now() >= coverageVerificationExpires) {
        coverageVerificationExpires = Date.now() + 5 * 60 * 1000;
        coverageVerificationPromise = fetch('https://raw.githubusercontent.com/yin0612/for_SoftWorld/main/data/source-verification.json', { cache: 'no-store' })
        .then((response) => { if (!response.ok) throw new Error('report unavailable'); return response.json(); })
        .catch(() => { coverageVerificationPromise = null; return null; });
    }
    coverageVerificationPromise.then((report) => {
        if (!report || !Array.isArray(report.results)) {
            host.textContent = '來源檢查報告暫時無法讀取。';
            return;
        }
        const checked = new Date(report.checked_at);
        const date = Number.isNaN(checked.getTime()) ? '時間未提供' : checked.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
        host.innerHTML = `<p class="method-muted">來源檢查：${coverageEscape(date)}（台北時間）${Date.now() - checked.getTime() > 8 * 60 * 60 * 1000 ? ' · 報告已逾期，等待排程重新檢查' : ''}</p><div class="coverage-table-wrap"><table class="method-table coverage-table"><thead><tr><th scope="col">管線</th><th scope="col">通過</th><th scope="col">待確認</th><th scope="col">無結果</th><th scope="col">無法讀取</th></tr></thead><tbody>${['rss', 'google_news_rss'].map((kind) => {
            const rows = report.results.filter((row) => row.kind === kind);
            return `<tr><th scope="row">${kind === 'rss' ? 'RSS' : 'Google News'}</th>${['passed', 'warning', 'empty', 'unavailable'].map((status) => `<td>${rows.filter((row) => row.status === status).length}</td>`).join('')}</tr>`;
        }).join('')}</tbody></table></div><details><summary>查看待確認來源</summary><ul>${report.results.filter((row) => row.status === 'warning' || row.status === 'unavailable').map((row) => `<li>${coverageEscape(row.name)}（${row.kind === 'rss' ? 'RSS' : 'Google News'}）：${coverageEscape(row.error || Object.entries(row.reasons || {}).map(([reason, count]) => `${({date_timezone_missing: '日期缺少時區', invalid_date: '日期格式異常', article_domain_mismatch: '文章連至來源網域之外', publisher_domain_mismatch: '出版者不在核准網域', invalid_google_link: '聚合連結異常', missing_title_or_date: '缺少標題或日期'})[reason] || reason} ${count} 筆`).join('、'))}</li>`).join('') || '<li>目前沒有待確認來源。</li>'}</ul></details><p class="method-muted">檢查涵蓋 RSS／Google XML、日期與來源網域；Google 每個來源抽查一組主題，無結果不代表故障。來源網域核對不等於新聞內容查證，也不保證原文目前可開啟。</p>`;
    });
}

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
    return COVERAGE_COMPANIES.map(({ id, name, aliases, reference_url }) => {
        const seen = new Set();
        const matched = articles.filter((article) => {
            if (!coverageMatches(article, aliases)) return false;
            const source = coverageSourceName(article);
            const key = coverageUrl(article.url) || JSON.stringify([source, article.date, article.title]);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        const sources = new Map();
        matched.forEach((article) => {
            const source = coverageSourceName(article);
            if (!source) return;
            const key = source.toLowerCase();
            if (!sources.has(key)) sources.set(key, { name: source, articles: [] });
            sources.get(key).articles.push(article);
        });
        return { id, name, reference_url, total: matched.length, unknown: matched.filter((article) => !coverageSourceName(article)).length,
            sources: [...sources.values()].sort((a, b) => b.articles.length - a.articles.length || a.name.localeCompare(b.name, 'zh-Hant')) };
    });
}

function renderCompanyCoverage(articles) {
    const host = document.getElementById('companyCoverage');
    if (!host) return;
    const rows = getCoverageStats(articles);
    host.innerHTML = `<div class="coverage-table-wrap"><table class="method-table coverage-table">
        <caption class="sr-only">企業、公司、品牌與機構媒體覆蓋及報導清單</caption>
        <thead><tr><th scope="col">企業／公司／品牌／機構</th><th scope="col">報導媒體數</th><th scope="col">已收錄報導</th><th scope="col">媒體與新聞</th><th scope="col">來源與更新檢查</th></tr></thead>
        <tbody>${rows.map((row) => `<tr><th scope="row">${coverageEscape(row.name)}</th><td><strong>${row.sources.length}</strong> 家</td><td>${row.total} 篇${row.unknown ? `<br><small>其中 ${row.unknown} 篇未提供來源</small>` : ''}</td><td>${row.sources.length ? `<details><summary>查看 ${row.sources.length} 家媒體</summary><div class="coverage-sources">${row.sources.map((source) => `<details><summary>${coverageEscape(source.name)} · ${source.articles.length} 篇</summary><ul>${source.articles.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).map((article) => {
            const url = coverageUrl(article.url);
            return `<li><span class="chart-card-subtitle">${coverageEscape(article.date || '日期未提供')} · ${article.sourceKind === 'google_news_rss' ? 'Google News 聚合' : 'RSS'}</span><br>${url ? `<a href="${coverageEscape(url)}" target="_blank" rel="noopener noreferrer">${coverageEscape(article.title)}</a>` : coverageEscape(article.title)}</li>`;
        }).join('')}</ul></details>`).join('')}</div></details>` : (articles.length ? '近兩個月未收錄具名媒體報導' : '等待新聞資料載入') }</td><td><a href="${coverageEscape(coverageUrl(row.reference_url))}" target="_blank" rel="noopener noreferrer">公司／品牌資料依據</a><br><span data-company-check="${coverageEscape(row.id)}">正在讀取更新檢查…</span></td></tr>`).join('')}</tbody></table></div>`;
    renderCompanyChecks();
}

let companyChecksPromise;
let companyChecksExpires = 0;
function renderCompanyChecks() {
    if (!companyChecksPromise || Date.now() >= companyChecksExpires) {
        companyChecksExpires = Date.now() + 5 * 60 * 1000;
        companyChecksPromise = fetch('data/company-coverage-health.json', { cache: 'no-store', signal: AbortSignal.timeout(15000) })
            .then(response => { if (!response.ok) throw Error('report unavailable'); return response.json(); })
            .catch(() => { companyChecksPromise = null; return null; });
    }
    companyChecksPromise.then(report => {
        document.querySelectorAll('[data-company-check]').forEach(node => {
            const row = report?.companies?.find(company => company.id === node.dataset.companyCheck);
            const checked = Date.parse(row?.checked_at);
            if (!row || !Number.isFinite(checked)) { node.textContent = '來源檢查暫時無法讀取'; return; }
            const labels = { passed: '專項查詢正常', empty: '專項查詢正常，未回傳合規報導', unavailable: '查詢失敗，待下次重試' };
            const stale = checked > Date.now() || Date.now() - checked > 8 * 60 * 60 * 1000;
            const feed = coverageUrl(row.feed_url);
            node.innerHTML = `${coverageEscape(labels[row.status] || '來源狀態待確認')}${stale ? ' · 檢查已逾期' : ''}<br><small>${coverageEscape(new Date(checked).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }))}（台北）</small>${feed ? `<br><a href="${coverageEscape(feed)}" target="_blank" rel="noopener noreferrer">新聞來源查詢</a>` : ''}`;
        });
    });
}
