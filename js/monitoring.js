/*
 * 真實監測 API 設定。
 * 部署 Cloudflare Worker 後，將下方空字串改成 Worker 網址，例如：
 * window.MONITORING_API_BASE = 'https://softworld-monitoring-api.<account>.workers.dev';
 * 未設定或 API 無法使用時，網站維持既有展示資料，不會把它誤標示為真實監測資料。
 */
window.MONITORING_API_BASE = 'https://softworld-monitoring-api.media-monitoring-worker.workers.dev';

window.loadVerifiedMonitoringArticles = async function loadVerifiedMonitoringArticles() {
    const base = (window.MONITORING_API_BASE || '').replace(/\/$/, '');
    if (!base) return { loaded: false, reason: 'not_configured' };

    const params = new URLSearchParams({ limit: '100' });
    // 與頁面日期欄位使用相同的近兩個月窗口；API 端也會再次強制限制。
    if (typeof getRollingMonitoringDateRange === 'function') {
        const range = getRollingMonitoringDateRange();
        params.set('from', range.from);
        params.set('to', range.to);
    }
    const response = await fetch(`${base}/api/articles?${params.toString()}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Monitoring API returned ${response.status}`);
    const payload = await response.json();
    const articles = Array.isArray(payload.articles) ? payload.articles : [];
    return {
        loaded: true,
        articles: articles.map((article) => {
            let evidence = {};
            try { evidence = JSON.parse(article.evidence_json || '{}'); } catch (_) { /* keep empty evidence */ }
            const terms = [...(evidence.any_hits || []), ...(evidence.all_hits || [])];
            return {
                companyId: 'monitoring',
                companyName: '真實監測',
                companyColor: '#0f766e',
                title: article.title,
                category: '關鍵字監測',
                huikeFolder: article.folder_id,
                huikeKeyword: terms[0] || article.rule_id,
                excerpt: article.excerpt || '此文章由已審核監測規則收錄。',
                date: (article.published_at || article.fetched_at || '').slice(0, 10),
                source: article.source,
                url: article.url,
                synthetic: false,
                verifiedMonitoring: true,
                ruleId: article.rule_id
            };
        })
    };
};
