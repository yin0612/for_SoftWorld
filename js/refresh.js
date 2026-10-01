/* All pages share one refresh cycle and one Taipei calendar window. */
const MONITORING_REFRESH_MS = 5 * 60 * 1000;
const MONITORING_SOURCE_MAX_AGE_MS = 2 * 60 * 60 * 1000;

function monitoringDateRange(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
    const index = Number(parts.year) * 12 + Number(parts.month) - 3;
    const year = Math.floor(index / 12);
    const month = ((index % 12) + 12) % 12 + 1;
    const day = Math.min(Number(parts.day), new Date(Date.UTC(year, month, 0)).getUTCDate());
    return { from: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        to: `${parts.year}-${parts.month}-${parts.day}` };
}

function monitoringSourceIsFresh(source, now = Date.now()) {
    const timestamp = Date.parse(source?.last_success_at);
    return source?.health_status === 'healthy' && Number.isFinite(timestamp)
        && timestamp <= now && now - timestamp <= MONITORING_SOURCE_MAX_AGE_MS;
}

function monitoringFreshness(status, load, refresh, now = Date.now()) {
    const issues = [];
    if (refresh?.error) issues.push('同步失敗，保留上次資料');
    if (load?.complete === false) issues.push('文章未完整載入');
    if (load?.degraded) issues.push('資料庫暫時受限');
    if (load?.partial) issues.push('部分資料管線暫時無法讀取');
    const latest = Date.parse(status?.source_summary?.latest_success);
    const backupTime = Date.parse(load?.rssSnapshot?.generated_at);
    const rssUpdated = Math.max(Number.isFinite(latest) ? latest : -Infinity, Number.isFinite(backupTime) ? backupTime : -Infinity);
    if (!Number.isFinite(rssUpdated) || rssUpdated > now || now - rssUpdated > MONITORING_SOURCE_MAX_AGE_MS) issues.push('RSS 更新時間待確認或已逾期');
    const snapshot = Date.parse(load?.aggregatedSnapshot?.generated_at);
    if (!Number.isFinite(snapshot) || snapshot > now || now - snapshot > 8 * 60 * 60 * 1000) issues.push('聚合快照時間待確認或已逾期');
    else if (load?.aggregatedSnapshot?.error_count > 0) issues.push('部分聚合查詢失敗');
    const backupChecks = new Map((load?.rssSnapshot?.results || []).filter(row => row.result === 'success').map(row => [row.source_id, row]));
    const sources = (status?.enabled_sources || []).map(source => {
        const backup = backupChecks.get(source.id);
        return backup && monitoringSourceIsFresh({ health_status: 'healthy', last_success_at: backup.checked_at }, now)
            ? { ...source, health_status: 'healthy', last_success_at: backup.checked_at } : source;
    });
    const failed = sources.filter(source => !monitoringSourceIsFresh(source, now)).length;
    if (failed) issues.push(`${failed} 個 RSS 管道待確認`);
    return { issues, healthy: sources.filter(source => monitoringSourceIsFresh(source, now)).length, sources };
}

function createMonitoringRefreshCoordinator({ load, isVisible, now = Date.now, interval = setInterval, onError = () => {} }) {
    let pending = null;
    let lastAttempt = -Infinity;
    const refresh = (force = false) => {
        if (pending) return pending;
        if (!force && (!isVisible() || now() - lastAttempt < 60000)) return Promise.resolve(false);
        lastAttempt = now();
        pending = Promise.resolve().then(load).catch(onError).finally(() => { pending = null; });
        return pending;
    };
    const timer = interval(() => { refresh(); }, MONITORING_REFRESH_MS);
    return { refresh, timer };
}
