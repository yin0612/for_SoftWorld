/**
 * 圖表模組 (Charts Module)
 * 使用 Chart.js v4 繪製，日系清新風格，莫蘭迪配色。
 * 依賴：全域資料變數來自 js/data.js (COMPANIES, MONTHLY_STATS, MEDIA_CHANNELS, PRESS_RELEASES)
 */

// 設定 Chart.js 日系明亮清新主題預設值
if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#5a6578';
    Chart.defaults.font.family = "'Noto Sans TC', 'Inter', sans-serif";
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(43, 48, 58, 0.9)';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.scale.grid.color = 'rgba(229, 233, 240, 0.7)';
}

const charts = {};

/**
 * 取得公司品牌顏色
 */
function getBrandColor(companyId) {
    const company = COMPANIES.find(c => c.id === companyId);
    return company ? company.brandColor : '#ffffff';
}

/**
 * 初始化每月媒體曝光趨勢折線圖
 */
function initExposureTrendChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // 取得所有月份標籤 (假設所有公司的月份區間相同)
    const firstCompanyId = COMPANIES[0].id;
    const months = MONTHLY_STATS[firstCompanyId].map(stat => stat.month);

    const datasets = COMPANIES.map(company => {
        const data = MONTHLY_STATS[company.id].map(stat => stat.mediaCoverage);
        return {
            label: company.name,
            data: data,
            borderColor: company.brandColor,
            backgroundColor: company.brandColor,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            tension: 0.4 // 平滑曲線
        };
    });

    charts[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            onClick: function(evt, elements) {
                if (!elements || !elements.length) return;
                const el = elements[0];
                const datasetIndex = el.datasetIndex;
                const index = el.index;
                
                const company = COMPANIES[datasetIndex];
                const month = months[index];
                
                if (company && month) {
                    const docs = typeof loadSources === 'function' ? loadSources(company.id, month) : [];
                    showProvenanceModal(company.name, month, docs);
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} 則 (點擊檢視原始新聞連結)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        callback: function(val, index) {
                            // 每 3 個月顯示一次標籤
                            return index % 3 === 0 ? this.getLabelForValue(val) : '';
                        }
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * 初始化媒體通路分佈甜甜圈圖
 */
function initMediaChannelChart(canvasId, companyId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // 取得容器
    const container = canvas.parentElement;

    const channelColors = [
        '#00b4d8', '#f72585', '#7209b7', '#4361ee', '#4cc9f0', '#ffb703', '#9b5de5'
    ];

    // 若尚未加入公司選擇器，則加入
    let selectEl = document.getElementById(`${canvasId}-select`);
    if (!selectEl) {
        const selectHtml = `
            <select id="${canvasId}-select" class="company-selector" style="margin-bottom: 12px; padding: 6px 12px; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                ${COMPANIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
        `;
        container.insertAdjacentHTML('afterbegin', selectHtml);
        selectEl = document.getElementById(`${canvasId}-select`);
        
        selectEl.addEventListener('change', (e) => {
            updateChart(e.target.value);
        });
    }

    function updateChart(cid) {
        const company = COMPANIES.find(c => c.id === cid);
        const channels = MEDIA_CHANNELS[cid];
        const labels = Object.keys(channels);
        const data = Object.values(channels);

        if (charts[canvasId]) {
            charts[canvasId].data.labels = labels;
            charts[canvasId].data.datasets[0].data = data;
            
            // 更新中心文字的 plugin state
            charts[canvasId].options.plugins.centerText = {
                text: company.name,
                color: company.brandColor
            };
            
            charts[canvasId].update();
        } else {
            charts[canvasId] = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: channelColors,
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        centerText: {
                            text: company.name,
                            color: company.brandColor
                        }
                    }
                },
                plugins: [{
                    id: 'centerTextPlugin',
                    beforeDraw: function(chart) {
                        const width = chart.width, height = chart.height, ctx = chart.ctx;
                        const pluginOptions = chart.options.plugins.centerText || {};
                        const text = pluginOptions.text || '';
                        const color = pluginOptions.color || '#fff';
                        
                        ctx.restore();
                        ctx.font = "bold 20px 'Noto Sans TC'";
                        ctx.fillStyle = color;
                        ctx.textBaseline = "middle";
                        
                        const textX = Math.round((chart.chartArea.left + chart.chartArea.right) / 2 - ctx.measureText(text).width / 2);
                        const textY = height / 2;
                        
                        ctx.fillText(text, textX, textY);
                        ctx.save();
                    }
                }]
            });
        }
    }

    updateChart(companyId || COMPANIES[0].id);
}

/**
 * 初始化 KOL 合作排行長條圖 (橫向)
 */
function initKolRankChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // 計算各公司 KOL 總合作數
    const kolData = COMPANIES.map(company => {
        const totalKol = MONTHLY_STATS[company.id].reduce((sum, stat) => sum + stat.kolCollabs, 0);
        return {
            id: company.id,
            name: company.name,
            total: totalKol,
            color: company.brandColor
        };
    });

    // 排序降冪
    kolData.sort((a, b) => b.total - a.total);

    charts[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: kolData.map(d => d.name),
            datasets: [{
                label: 'KOL 合作總數',
                data: kolData.map(d => d.total),
                backgroundColor: kolData.map(d => d.color || '#3a86ff'),
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y', // 橫向長條圖
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.x} 次合作`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                y: {
                    ticks: { color: '#334155', font: { weight: '600' } },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * 初始化新聞稿數量排行長條圖 (直向)
 */
function initPressReleaseChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // 計算各公司新聞稿總數
    const prData = COMPANIES.map(company => {
        const totalPr = MONTHLY_STATS[company.id].reduce((sum, stat) => sum + stat.pressReleaseCount, 0);
        return {
            id: company.id,
            name: company.name,
            total: totalPr,
            color: company.brandColor || company.color || '#3a86ff'
        };
    });

    // 排序降冪
    prData.sort((a, b) => b.total - a.total);

    charts[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: prData.map(d => d.name),
            datasets: [{
                label: '新聞稿總數',
                data: prData.map(d => d.total),
                backgroundColor: prData.map(d => d.color),
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} 篇新聞稿`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#334155', font: { weight: '600' } },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                }
            }
        },
        plugins: [{
            id: 'topLabelsPlugin',
            afterDatasetsDraw(chart) {
                const { ctx, data } = chart;
                ctx.save();
                chart.getDatasetMeta(0).data.forEach((datapoint, index) => {
                    const value = data.datasets[0].data[index];
                    ctx.font = "bold 13px 'Noto Sans TC', sans-serif";
                    ctx.fillStyle = '#2d3748';
                    ctx.textAlign = 'center';
                    ctx.fillText(value, datapoint.x, datapoint.y - 8);
                });
                ctx.restore();
            }
        }]
    });
}

/**
 * 銷毀並重新創建數據分析頁面的 4 大圖表 (解決 SPA 切頁 display:none -> block 畫布壞死)
 */
function renderAnalyticsCharts() {
    if (typeof Chart === 'undefined') {
        document.querySelectorAll('#analytics canvas').forEach(c => {
            if (!c.parentElement.querySelector('.chart-error-msg')) {
                c.insertAdjacentHTML('afterend', '<p class="chart-error-msg" style="text-align:center;color:#94a3b8;padding:40px;">圖表元件載入失敗，請檢查網路連線後重新整理。</p>');
            }
        });
        return;
    }

    const analyticsSec = document.getElementById('analytics');
    if (analyticsSec && (analyticsSec.offsetWidth === 0 || window.getComputedStyle(analyticsSec).display === 'none')) {
        return; // 若頁面處於隱藏狀態，暫不出圖，避免 canvas 尺寸變 0
    }

    // 1. 8 大企業月度報導趨勢圖
    if (document.getElementById('exposureTrendChart')) {
        if (charts['exposureTrendChart']) {
            try { charts['exposureTrendChart'].destroy(); } catch (e) {}
            delete charts['exposureTrendChart'];
        }
        initExposureTrendChart('exposureTrendChart');
    }

    // 2. 媒體曝光通路分佈比例
    if (document.getElementById('mediaChannelChart') && typeof COMPANIES !== 'undefined' && COMPANIES.length > 0) {
        if (charts['mediaChannelChart']) {
            try { charts['mediaChannelChart'].destroy(); } catch (e) {}
            delete charts['mediaChannelChart'];
        }
        const selectedCompanyId = document.getElementById('channelCompanySelect')?.value || COMPANIES[0].id;
        initMediaChannelChart('mediaChannelChart', selectedCompanyId);
    }

    // 3. KOL 合作宣傳排行榜
    if (document.getElementById('kolRankChart')) {
        if (charts['kolRankChart']) {
            try { charts['kolRankChart'].destroy(); } catch (e) {}
            delete charts['kolRankChart'];
        }
        initKolRankChart('kolRankChart');
    }

    // 4. 新聞稿發布篇數排行榜
    if (document.getElementById('pressReleaseChart')) {
        if (charts['pressReleaseChart']) {
            try { charts['pressReleaseChart'].destroy(); } catch (e) {}
            delete charts['pressReleaseChart'];
        }
        initPressReleaseChart('pressReleaseChart');
    }
}

function forceResizeAllCharts() {
    const hasCharts = Object.keys(charts).length > 0;
    if (!hasCharts) {
        renderAnalyticsCharts();
    } else {
        Object.values(charts).forEach(c => {
            if (c) {
                try {
                    c.resize();
                    c.update('none');
                } catch (e) {}
            }
        });
    }
}

/**
 * 懶載入與初始化圖表
 */
function initAllCharts() {
    initAllChartsNow();

    const chartConfigs = [
        { id: 'exposureTrendChart', initFn: () => initExposureTrendChart('exposureTrendChart') },
        { id: 'mediaChannelChart', initFn: () => initMediaChannelChart('mediaChannelChart', COMPANIES[0].id) },
        { id: 'kolRankChart', initFn: () => initKolRankChart('kolRankChart') },
        { id: 'pressReleaseChart', initFn: () => initPressReleaseChart('pressReleaseChart') }
    ];

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                const config = chartConfigs.find(c => targetId.includes(c.id) || c.id.includes(targetId));
                if (config && !charts[config.id]) {
                    config.initFn();
                }
            }
        });
    }, { threshold: 0.05 });

    chartConfigs.forEach(c => {
        const el = document.getElementById(c.id);
        if (el && el.parentElement) {
            observer.observe(el.parentElement);
        }
    });
}

// 自動在 DOMReady 時初始化圖表
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initAllChartsNow, 200);
    });
}

// 匯出供 app.js 呼叫
window.initAllCharts = initAllCharts;
