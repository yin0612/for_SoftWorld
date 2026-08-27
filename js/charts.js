/**
 * 圖表模組 (Charts Module)
 * 使用 Chart.js v4 繪製，深色主題，螢光配色。
 * 依賴：全域資料變數來自 js/data.js (COMPANIES, MONTHLY_STATS, MEDIA_CHANNELS, PRESS_RELEASES)
 */

Chart.defaults.color = '#a0a0b8';
Chart.defaults.font.family = "'Noto Sans TC', 'Inter', sans-serif";
Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
Chart.defaults.plugins.tooltip.titleColor = '#fff';
Chart.defaults.plugins.tooltip.bodyColor = '#ccc';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.displayColors = true;

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
                            return `${context.dataset.label}: ${context.parsed.y} 則`;
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
            <select id="${canvasId}-select" class="company-selector" style="margin-bottom: 10px; padding: 5px; background: #1a1a24; color: #fff; border: 1px solid #333; border-radius: 4px;">
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
                backgroundColor: kolData.map(d => d.color),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // 橫向長條圖
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
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
                    grid: { display: false }
                },
                y: {
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
            color: company.brandColor
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
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} 篇`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: { display: true }
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
                    ctx.font = "12px 'Noto Sans TC'";
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.fillText(value, datapoint.x, datapoint.y - 10);
                });
                ctx.restore();
            }
        }]
    });
}

/**
 * 懶載入圖表初始化
 */
function initAllCharts() {
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
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    chartConfigs.forEach(config => {
        const el = document.getElementById(config.id);
        if (el) observer.observe(el);
    });
}

// 匯出供 app.js 呼叫
window.initAllCharts = initAllCharts;
