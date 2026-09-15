/* 真實新聞監測 API 設定。公開頁只顯示已驗證公開 RSS 來源的規則命中文章。 */
window.MONITORING_API_BASE = 'https://softworld-monitoring-api.media-monitoring-worker.workers.dev';

function monitoringApiBase() {
    return (window.MONITORING_API_BASE || '').replace(/\/$/, '');
}

function uniqueTerms(values) {
    return [...new Set(values.filter(Boolean))];
}

function parseEvidenceList(article) {
    const raw = article.evidence_jsons || article.evidence_json || '';
    return String(raw).split('|||').map((entry) => {
        try { return JSON.parse(entry); } catch (_) { return null; }
    }).filter(Boolean);
}

function formatMonitoringDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date).filter((part) => part.type !== 'literal');
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

window.loadMonitoringManifest = async function loadMonitoringManifest() {
    const response = await fetch('config/monitoring_rules.json?v=20260915_02', {
        cache: 'no-store', headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Monitoring manifest returned ${response.status}`);
    return response.json();
};

window.loadMonitoringStatus = async function loadMonitoringStatus() {
    const base = monitoringApiBase();
    if (!base) return null;
    const response = await fetch(`${base}/api/status`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Monitoring status returned ${response.status}`);
    return response.json();
};

window.loadVerifiedMonitoringArticles = async function loadVerifiedMonitoringArticles() {
    const base = monitoringApiBase();
    if (!base) return { loaded: false, reason: 'not_configured' };

    const baseParams = new URLSearchParams({ limit: '100' });
    if (typeof getRollingMonitoringDateRange === 'function') {
        const range = getRollingMonitoringDateRange();
        baseParams.set('from', range.from);
        baseParams.set('to', range.to);
    }
    const rawArticles = [];
    let offset = 0;
    let total = null;
    let range = null;
    let complete = true;

    // The Worker returns a total and cursor-like offset. Fetch every page so the
    // client never silently treats the first 100 articles as the full result set.
    for (let page = 0; page < 1000; page++) {
        const params = new URLSearchParams(baseParams);
        params.set('offset', String(offset));
        const response = await fetch(`${base}/api/articles?${params.toString()}`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Monitoring API returned ${response.status}`);
        const payload = await response.json();
        const pageArticles = Array.isArray(payload.articles) ? payload.articles : [];
        rawArticles.push(...pageArticles);
        range = payload.range || range;
        if (Number.isFinite(Number(payload.total))) total = Number(payload.total);
        if (!payload.has_more) break;
        const nextOffset = Number(payload.next_offset);
        if (!Number.isFinite(nextOffset) || nextOffset <= offset || pageArticles.length === 0) {
            complete = false;
            break;
        }
        offset = nextOffset;
        if (page === 999) complete = false;
    }

    return {
        loaded: true,
        range,
        total: total ?? rawArticles.length,
        complete,
        articles: rawArticles.map((article) => {
            const evidenceList = parseEvidenceList(article);
            const matchedTerms = uniqueTerms(evidenceList.flatMap((evidence) => [
                ...(evidence.any_hits || []),
                ...(evidence.all_hits || []),
                ...(evidence.required_any_group_hits || []).flat()
            ]));
            const folders = uniqueTerms(String(article.folder_ids || '').split(','));
            const ruleIds = uniqueTerms(String(article.rule_ids || '').split(','));
            return {
                companyId: 'monitoring',
                companyName: '已驗證 RSS 監測',
                companyColor: '#0f766e',
                title: article.title,
                category: '關鍵字監測',
                huikeFolder: folders[0] || '',
                huikeFolders: folders,
                huikeKeyword: matchedTerms[0] || ruleIds[0] || '規則命中',
                matchedTerms,
                ruleIds,
                excerpt: article.excerpt || '此文章由已驗證公開 RSS 來源收錄。',
                date: formatMonitoringDate(article.published_at || article.fetched_at),
                source: article.source,
                url: article.url,
                synthetic: false,
                verifiedMonitoring: true,
                verificationLabel: '已驗證 RSS 自動收錄'
            };
        })
    };
};
