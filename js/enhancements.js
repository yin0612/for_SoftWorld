/**
 * 功能強化模組 (Enhancements)
 * ---------------------------------------------------------------------------
 * 在不更動既有版面結構的前提下，補上研究與展示用得到的能力：
 *   1. 洞察摘要卡    — 自動從 MONTHLY_STATS 算出四個結論，不必自己看圖推
 *   2. 趨勢年度切換  — 折線圖可只看 2024 / 2025 / 2026
 *   3. 圖表數據表    — 每張圖可展開底層數字（同時提供螢幕閱讀器可讀的替代內容）
 *   4. CSV 匯出      — 圖表資料與對比表都能帶回 Excel 做後續分析
 *   5. 跳至主要內容  — 鍵盤使用者不必逐一 Tab 過導覽列
 *
 * 本檔案只做「附加」，不覆寫任何既有函式。
 */

/* ==========================================================================
   共用工具
   ========================================================================== */

/** 產生 CSV 並觸發下載（加 BOM，Excel 開啟中文不會亂碼）。 */
function downloadCsv(filename, rows) {
    const csv = rows
        .map(row => row.map(cell => {
            const value = cell === null || cell === undefined ? '' : String(cell);
            return /[",\n\r]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
        }).join(','))
        .join('\r\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 今天日期，用於檔名。 */
function todayStamp() {
    return new Date().toISOString().slice(0, 10);
}

/** 把 Chart.js 實例轉成二維陣列（第一列為標題列）。 */
function chartToRows(chart) {
    const labels = chart.data.labels || [];
    const datasets = chart.data.datasets || [];

    if (datasets.length === 1) {
        const rows = [['項目', datasets[0].label || '數值']];
        labels.forEach((label, i) => rows.push([label, datasets[0].data[i]]));
        return rows;
    }

    const rows = [['月份'].concat(datasets.map(d => d.label))];
    labels.forEach((label, i) => {
        rows.push([label].concat(datasets.map(d => d.data[i])));
    });
    return rows;
}

/* ==========================================================================
   1. 洞察摘要卡
   ========================================================================== */

/** 加總單一公司的四項指標。 */
function sumStats(companyId) {
    const stats = MONTHLY_STATS[companyId] || [];
    return stats.reduce((acc, s) => ({
        media: acc.media + (s.mediaCoverage || 0),
        pr: acc.pr + (s.pressReleaseCount || 0),
        social: acc.social + (s.socialMentions || 0),
        kol: acc.kol + (s.kolCollabs || 0)
    }), { media: 0, pr: 0, social: 0, kol: 0 });
}

/**
 * 後半段相對前半段的媒體聲量成長率。
 * 用「後 6 個月平均」對比「再往前 6 個月平均」，避免單月極端值主導結論。
 */
function growthRate(companyId) {
    const stats = MONTHLY_STATS[companyId] || [];
    if (stats.length < 12) return 0;

    const recent = stats.slice(-6);
    const previous = stats.slice(-12, -6);
    const avg = arr => arr.reduce((a, s) => a + (s.mediaCoverage || 0), 0) / arr.length;

    const base = avg(previous);
    if (!base) return 0;
    return ((avg(recent) - base) / base) * 100;
}

function buildInsights() {
    const rows = COMPANIES.map(c => {
        const totals = sumStats(c.id);
        const peak = (MONTHLY_STATS[c.id] || []).reduce(
            (best, s) => (!best || s.mediaCoverage > best.mediaCoverage ? s : best), null);
        return { company: c, totals, growth: growthRate(c.id), peak };
    });

    const top = key => rows.slice().sort((a, b) => b.totals[key] - a.totals[key])[0];
    const topMedia = top('media');
    const topPr = top('pr');
    const topKol = top('kol');
    const fastest = rows.slice().sort((a, b) => b.growth - a.growth)[0];

    return [
        {
            icon: '📣',
            label: '媒體聲量冠軍',
            company: topMedia.company,
            value: topMedia.totals.media.toLocaleString() + ' 則',
            note: '2024–2026 累計媒體報導篇數最高'
        },
        {
            icon: '📈',
            label: '聲量成長最快',
            company: fastest.company,
            value: (fastest.growth >= 0 ? '+' : '') + fastest.growth.toFixed(1) + '%',
            note: '近 6 個月平均相對前 6 個月的變化'
        },
        {
            icon: '📰',
            label: '新聞稿最積極',
            company: topPr.company,
            value: topPr.totals.pr.toLocaleString() + ' 篇',
            note: '官方公關新聞稿累計發布量最高'
        },
        {
            icon: '🤝',
            label: 'KOL 佈局最深',
            company: topKol.company,
            value: topKol.totals.kol.toLocaleString() + ' 次',
            note: '實況主與網紅合作次數累計最高'
        }
    ];
}

function initInsightCards() {
    const host = document.getElementById('analyticsInsights');
    if (!host || host.dataset.rendered === 'true') return;
    if (typeof COMPANIES === 'undefined' || typeof MONTHLY_STATS === 'undefined') return;

    host.innerHTML = buildInsights().map(item => `
        <article class="insight-card" style="--insight-color: ${item.company.brandColor}">
            <div class="insight-card-top">
                <span class="insight-card-icon" aria-hidden="true">${item.icon}</span>
                <span class="insight-card-label">${item.label}</span>
            </div>
            <p class="insight-card-company">${item.company.name}</p>
            <p class="insight-card-value">${item.value}</p>
            <p class="insight-card-note">${item.note}</p>
        </article>
    `).join('');

    host.dataset.rendered = 'true';
}

/* ==========================================================================
   2. 趨勢圖年度區間切換
   ========================================================================== */

function initTrendYearFilter() {
    const host = document.getElementById('trendYearFilter');
    if (!host || host.dataset.rendered === 'true') return;

    const years = ['all', '2024', '2025', '2026'];
    const labelOf = y => (y === 'all' ? '全部區間' : y + ' 年');

    host.innerHTML = years.map(y => `
        <button type="button" class="year-chip${y === 'all' ? ' is-active' : ''}"
                data-year="${y}" aria-pressed="${y === 'all'}">${labelOf(y)}</button>
    `).join('');

    host.addEventListener('click', event => {
        const button = event.target.closest('.year-chip');
        if (!button) return;

        const year = button.dataset.year;
        window.TREND_YEAR = year;

        host.querySelectorAll('.year-chip').forEach(chip => {
            const active = chip === button;
            chip.classList.toggle('is-active', active);
            chip.setAttribute('aria-pressed', String(active));
        });

        // 重建折線圖（destroy 後由 initExposureTrendChart 依新區間重畫）
        if (typeof charts !== 'undefined' && charts.exposureTrendChart) {
            try { charts.exposureTrendChart.destroy(); } catch (e) {}
            delete charts.exposureTrendChart;
        }
        if (typeof initExposureTrendChart === 'function') {
            initExposureTrendChart('exposureTrendChart');
        }

        const subtitle = document.getElementById('trendRangeLabel');
        if (subtitle) {
            if (year === 'all') {
                syncDateRanges();
            } else {
                const inYear = (typeof MONTHS_LIST !== 'undefined')
                    ? MONTHS_LIST.filter(m => m.startsWith(year))
                    : [];
                subtitle.textContent = inYear.length
                    ? '監測區間：' + inYear[0].replace('-', '/') + ' — ' + inYear[inYear.length - 1].replace('-', '/')
                    : '監測區間：' + year;
            }
        }

        // 數據表若正在顯示，一併更新
        const panel = document.querySelector('#chartTrendCard .chart-data-table');
        if (panel && panel.hidden === false) renderDataTable(panel, 'exposureTrendChart');
    });

    host.dataset.rendered = 'true';
}

/* ==========================================================================
   3. 圖表數據表 + 4. CSV 匯出
   ========================================================================== */

const CHART_TOOL_TARGETS = [
    { card: 'chartTrendCard', canvas: 'exposureTrendChart', name: '月度媒體曝光趨勢' },
    { card: 'chartChannelCard', canvas: 'mediaChannelChart', name: '媒體通路分佈' },
    { card: 'chartKolCard', canvas: 'kolRankChart', name: 'KOL合作排行' },
    { card: 'chartPressCard', canvas: 'pressReleaseChart', name: '新聞稿發布排行' }
];

function renderDataTable(panel, canvasId) {
    const chart = (typeof charts !== 'undefined') ? charts[canvasId] : null;
    if (!chart) {
        panel.innerHTML = '<p class="chart-data-empty">圖表尚未載入，無法顯示數據表。</p>';
        return;
    }

    const rows = chartToRows(chart);
    const head = rows[0];
    const body = rows.slice(1);

    panel.innerHTML = `
        <div class="chart-data-scroll">
            <table class="chart-data-grid">
                <thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
                <tbody>
                    ${body.map(r => `<tr>${r.map((cell, i) =>
                        i === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`
                    ).join('')}</tr>`).join('')}
                </tbody>
            </table>
        </div>`;
}

function initChartTools() {
    CHART_TOOL_TARGETS.forEach(target => {
        const card = document.getElementById(target.card);
        if (!card || card.dataset.toolsReady === 'true') return;

        const toolbar = document.createElement('div');
        toolbar.className = 'chart-tools';
        toolbar.innerHTML = `
            <button type="button" class="chart-tool-btn" data-action="table"
                    aria-expanded="false">📋 顯示數據表</button>
            <button type="button" class="chart-tool-btn" data-action="csv">⬇️ 匯出 CSV</button>
        `;

        const panel = document.createElement('div');
        panel.className = 'chart-data-table';
        panel.hidden = true;

        card.appendChild(toolbar);
        card.appendChild(panel);

        toolbar.addEventListener('click', event => {
            const button = event.target.closest('.chart-tool-btn');
            if (!button) return;

            if (button.dataset.action === 'table') {
                const showing = panel.hidden;
                if (showing) renderDataTable(panel, target.canvas);
                panel.hidden = !showing;
                button.setAttribute('aria-expanded', String(showing));
                button.textContent = showing ? '📋 隱藏數據表' : '📋 顯示數據表';
                return;
            }

            const chart = (typeof charts !== 'undefined') ? charts[target.canvas] : null;
            if (!chart) {
                alert('圖表尚未載入完成，請稍候再試。');
                return;
            }
            downloadCsv(`${target.name}_${todayStamp()}.csv`, chartToRows(chart));
        });

        card.dataset.toolsReady = 'true';
    });
}

/** 對比工具：把目前選取企業的四項指標匯出成 CSV。 */
function exportCompareCsv() {
    if (typeof compareState === 'undefined' || typeof getCompanyAggregatedStats !== 'function') return;

    const selected = COMPANIES.filter(c => compareState.selectedCompanyIds.includes(c.id));
    if (!selected.length) {
        alert('請先選擇至少一家企業。');
        return;
    }

    const metrics = [
        ['新聞稿總發布數', 'prTotal'],
        ['媒體報導總篇數', 'mediaTotal'],
        ['社群網路聲量提及', 'socialTotal'],
        ['KOL 實況主合作數', 'kolTotal']
    ];

    const statsByCompany = selected.map(c => getCompanyAggregatedStats(c.id));
    const rows = [['比較指標'].concat(selected.map(c => c.name))];
    metrics.forEach(([label, key]) => {
        rows.push([label].concat(statsByCompany.map(s => s[key])));
    });

    downloadCsv(`企業對比數據_${todayStamp()}.csv`, rows);
}

function initCompareExport() {
    const actions = document.querySelector('#compareContainer .compare-actions');
    if (!actions || actions.dataset.csvReady === 'true') return;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'btn-export-csv';
    button.className = 'compare-action-btn';
    button.textContent = '⬇️ 匯出 CSV';
    button.addEventListener('click', exportCompareCsv);

    actions.appendChild(button);
    actions.dataset.csvReady = 'true';
}

/* ==========================================================================
   5. 跳至主要內容
   ========================================================================== */

function initSkipLink() {
    const link = document.getElementById('skipToContent');
    if (!link || link.dataset.ready === 'true') return;

    link.addEventListener('click', event => {
        event.preventDefault();
        const pages = ['companies', 'news', 'analytics', 'compare', 'trends', 'methodology'];
        const active = pages
            .map(id => document.getElementById(id))
            .find(el => el && window.getComputedStyle(el).display !== 'none');

        const target = active || document.getElementById('hero');
        if (!target) return;

        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    link.dataset.ready = 'true';
}

/* ==========================================================================
   6. 資料說明頁的即時數字
   ========================================================================== */

/**
 * 把三處會過期的硬編碼日期換成實際資料區間。
 * update_data.py 每週會推進 END_MONTH，寫死的日期會逐漸對不上。
 */
function syncDateRanges() {
    if (typeof MONTHS_LIST === 'undefined' || !MONTHS_LIST.length) return;

    const first = MONTHS_LIST[0];
    const last = MONTHS_LIST[MONTHS_LIST.length - 1];
    const [lastYear, lastMonth] = last.split('-').map(Number);
    const lastDay = new Date(lastYear, lastMonth, 0).getDate();

    const from = document.getElementById('filterDateFrom');
    const to = document.getElementById('filterDateTo');
    if (from && !from.dataset.synced) {
        from.value = first + '-01';
        from.dataset.synced = 'true';
    }
    if (to && !to.dataset.synced) {
        to.value = last + '-' + String(lastDay).padStart(2, '0');
        to.dataset.synced = 'true';
    }

    const label = document.getElementById('trendRangeLabel');
    if (label && (!window.TREND_YEAR || window.TREND_YEAR === 'all')) {
        label.textContent = '監測區間：' + first.replace('-', '/') + ' — ' + last.replace('-', '/');
    }
}

function initMethodologyFigures() {
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    if (typeof COMPANIES !== 'undefined') set('methodCompanies', COMPANIES.length);
    if (typeof MONTHS_LIST !== 'undefined') set('methodMonths', MONTHS_LIST.length);
    if (typeof PRESS_RELEASES !== 'undefined') {
        set('methodPressTotal', PRESS_RELEASES.length);
        set('methodSynthetic', PRESS_RELEASES.filter(p => p.synthetic).length);
        set('methodCurated', PRESS_RELEASES.filter(p => !p.synthetic).length);
    }
    if (typeof MEDIA_CHANNELS !== 'undefined' && typeof COMPANIES !== 'undefined') {
        set('methodChannels', Object.keys(MEDIA_CHANNELS[COMPANIES[0].id] || {}).length);
    }
    if (typeof MONTHS_LIST !== 'undefined' && MONTHS_LIST.length) {
        set('methodRange', MONTHS_LIST[0] + ' — ' + MONTHS_LIST[MONTHS_LIST.length - 1]);
    }
}

/* ==========================================================================
   啟動
   ========================================================================== */

function refreshEnhancements() {
    try { initInsightCards(); } catch (e) { console.error('[enhancements] insights', e); }
    try { initTrendYearFilter(); } catch (e) { console.error('[enhancements] year filter', e); }
    try { initChartTools(); } catch (e) { console.error('[enhancements] chart tools', e); }
    try { initCompareExport(); } catch (e) { console.error('[enhancements] compare export', e); }
    try { syncDateRanges(); } catch (e) { console.error('[enhancements] date range', e); }
    try { initMethodologyFigures(); } catch (e) { console.error('[enhancements] methodology', e); }
}

document.addEventListener('DOMContentLoaded', () => {
    initSkipLink();
    refreshEnhancements();
    // 圖表與對比工具是切頁後才建立的，稍後再補掛一次
    setTimeout(refreshEnhancements, 400);
});

window.addEventListener('hashchange', () => {
    setTimeout(refreshEnhancements, 120);
    setTimeout(refreshEnhancements, 500);
});

window.refreshEnhancements = refreshEnhancements;
