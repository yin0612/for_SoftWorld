/* 真實新聞監測 API 設定。官方 RSS 與 Google News RSS 聚合來源分開標示，
   不把聚合結果誤稱為媒體官方 RSS，也不以展示資料補足。 */
window.MONITORING_API_BASE = 'https://softworld-monitoring-api.media-monitoring-worker.workers.dev';

function monitoringApiBase() {
    return (window.MONITORING_API_BASE || '').replace(/\/$/, '');
}

async function fetchMonitoringJson(url, options = {}, maxAttempts = 3) {
    let lastError = null;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            const response = await fetch(url, { cache: 'no-store', ...options });
            if (!response.ok) throw new Error(`Monitoring request returned ${response.status}`);
            return await response.json();
        } catch (error) {
            lastError = error;
            if (attempt < maxAttempts - 1) {
                // 短暫 502/503 或網路抖動時退避重試，避免整頁誤判為無法驗證。
                await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
            }
        }
    }
    throw lastError || new Error('Monitoring request failed');
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
    return fetchMonitoringJson('config/monitoring_rules.json?v=20260922_01', {
        headers: { Accept: 'application/json' }
    });
};

window.loadMonitoringStatus = async function loadMonitoringStatus() {
    const base = monitoringApiBase();
    if (!base) return null;
    return fetchMonitoringJson(`${base}/api/status`, {
        headers: { Accept: 'application/json' }
    });
};

function normalizeMonitoringArticle(article) {
    const evidenceList = parseEvidenceList(article);
    const matchedTerms = uniqueTerms(evidenceList.flatMap((evidence) => [
        ...(evidence.any_hits || []),
        ...(evidence.all_hits || []),
        ...(evidence.required_any_group_hits || []).flat()
    ]).concat(Array.isArray(article.matched_terms) ? article.matched_terms : []));
    const folders = uniqueTerms(String(article.folder_ids || '').split(','));
    const ruleIds = uniqueTerms(String(article.rule_ids || '').split(','));
    return {
        companyId: 'monitoring',
        companyName: '真實新聞監測',
        companyColor: '#0f766e',
        title: article.title,
        keyPointZh: article.key_point_zh || article.keyPointZh || '',
        category: '關鍵字監測',
        huikeFolder: folders[0] || '',
        huikeFolders: folders,
        huikeKeyword: matchedTerms[0] || ruleIds[0] || '規則命中',
        matchedTerms,
        ruleIds,
        excerpt: article.excerpt || (article.source_kind === 'google_news_rss'
            ? 'Google News RSS 聚合僅提供標題與發布時間；請開啟原文閱讀完整內容。'
            : '此文章由已驗證公開 RSS 來源收錄。'),
        date: formatMonitoringDate(article.published_at || article.fetched_at),
        collectedDate: formatMonitoringDate(article.fetched_at),
        reviewState: article.review_status || 'approved',
        source: article.source,
        sourceRegion: article.source_region || '',
        sourceFeed: article.source_feed,
        sourceHomepage: article.source_homepage,
        sourceKind: article.source_kind || 'official_rss',
        sourceAccessMode: article.source_access_mode || 'rss',
        verificationStatus: article.verification_status || (article.source_kind === 'google_news_rss' ? 'aggregated' : 'verified_rss'),
        urlKind: article.url_kind || 'publisher_url',
        liveFallback: article.live_fallback === true,
        url: article.url,
        verifiedMonitoring: article.source_kind !== 'google_news_rss',
        verificationLabel: article.source_kind === 'google_news_rss'
            ? 'Google News RSS 聚合（非官方 RSS）'
            : '已驗證 RSS 自動收錄'
    };
}

window.loadVerifiedMonitoringArticles = async function loadVerifiedMonitoringArticles() {
    const base = monitoringApiBase();
    if (!base) return { loaded: false, reason: 'not_configured' };

    const baseParams = new URLSearchParams({ limit: '100' });
    if (typeof getRollingMonitoringDateRange === 'function') {
        const range = getRollingMonitoringDateRange();
        baseParams.set('from', range.from);
        baseParams.set('to', range.to);
    }
    const articles = [];
    let liveFallbackCount = 0;
    let officialLiveFallbackCount = 0;
    let aggregatedCount = 0;
    let officialRssCount = 0;
    let offset = 0;
    let total = null;
    let range = null;
    let complete = true;

    // The Worker returns a total and cursor-like offset. Fetch every page so the
    // client never silently treats the first 100 articles as the full result set.
    for (let page = 0; page < 1000; page++) {
        const params = new URLSearchParams(baseParams);
        params.set('offset', String(offset));
        const payload = await fetchMonitoringJson(`${base}/api/articles?${params.toString()}`, {
            headers: { Accept: 'application/json' }
        });
        const pageArticles = Array.isArray(payload.articles) ? payload.articles : [];
        pageArticles.forEach((article) => {
            if (article.live_fallback === true) {
                liveFallbackCount += 1;
                if (article.source_kind !== 'google_news_rss') officialLiveFallbackCount += 1;
            }
            if (article.source_kind === 'google_news_rss') aggregatedCount += 1;
            else officialRssCount += 1;
            articles.push(normalizeMonitoringArticle(article));
        });
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
        total: total ?? articles.length,
        complete,
        liveFallbackCount,
        officialLiveFallbackCount,
        aggregatedCount,
        officialRssCount,
        articles
    };
};
