/**
 * 企業比較工具模組 (Compare Module)
 * 負責雷達圖、數據表格、長條圖及匯出功能
 */

let compareState = {
    selectedCompanyIds: []
};

let compareCharts = {};

/**
 * 初始化比較工具
 */
function initCompare(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 預設選擇 3 家代表性公司，避免全選 8 家疊成一團
    compareState.selectedCompanyIds = ['soft-world', 'gamania', 'wanin'];

    renderCompareUI(container);
    updateComparison(compareState.selectedCompanyIds);
}

/**
 * 渲染 UI 外觀
 */
function renderCompareUI(container) {
    // 公司選擇器
    const selectorsHtml = COMPANIES.map(c => {
        const isSelected = compareState.selectedCompanyIds.includes(c.id);
        const bg = isSelected ? c.brandColor : '#f1f5f9';
        const color = isSelected ? '#ffffff' : '#64748b';
        const border = isSelected ? c.brandColor : '#cbd5e1';
        const shadow = isSelected ? `0 2px 8px ${c.brandColor}33` : 'none';
        const activeClass = isSelected ? 'active' : '';

        return `
            <button class="compare-company-btn ${activeClass}" data-id="${c.id}" 
                    style="background-color: ${bg}; color: ${color}; border: 1px solid ${border}; padding: 8px 18px; border-radius: 20px; cursor: pointer; margin: 5px; font-weight: 600; font-size: 0.9rem; transition: all 0.25s ease; box-shadow: ${shadow};">
                ${c.name}
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="compare-controls" style="margin-bottom: 30px; text-align: center;">
            <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 1.1rem; font-weight: 700;">選擇要進行對比的遊戲企業 (選擇 2 至 4 家)</h3>
            <div class="company-selectors" id="compare-company-selectors" style="display: flex; flex-wrap: wrap; justify-content: center; margin-bottom: 20px;">
                ${selectorsHtml}
            </div>
            <div class="compare-actions">
                <button id="btn-export-img" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px 18px; border-radius: 6px; cursor: pointer; margin: 0 6px; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">📸 下載雷達圖圖片</button>
                <button id="btn-copy-summary" style="background: #ffffff; border: 1px solid #cbd5e1; color: #334155; padding: 8px 18px; border-radius: 6px; cursor: pointer; margin: 0 6px; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">📋 複製數據摘要</button>
            </div>
        </div>
        
        <div class="compare-dashboard" id="compare-export-area" style="background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
            <div class="compare-row" style="display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 30px;">
                <div class="compare-chart-container" style="flex: 1; min-width: 320px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9;">
                    <h4 style="color: #1e293b; text-align: center; margin-top: 0; font-size: 1.05rem; font-weight: 700; margin-bottom: 15px;">📊 綜合指標 PK 雷達圖</h4>
                    <div style="height: 360px; position: relative;"><canvas id="compareRadarChart" role="img" aria-label="企業綜合指標多維度 PK 雷達圖，涵蓋媒體曝光、新聞稿、社群聲量與 KOL 合作四大指標"></canvas></div>
                </div>
                <div class="compare-chart-container" style="flex: 1; min-width: 320px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9;">
                    <h4 style="color: #1e293b; text-align: center; margin-top: 0; font-size: 1.05rem; font-weight: 700; margin-bottom: 15px;">📈 關鍵聲量數據柱狀比較</h4>
                    <div style="height: 360px; position: relative;"><canvas id="compareBarChart" role="img" aria-label="所選企業在媒體曝光則數與社群聲量等指標的柱狀比較圖"></canvas></div>
                </div>
            </div>
            <div class="compare-table-container" style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; overflow-x: auto;">
                <h4 style="color: #1e293b; margin-top: 0; margin-bottom: 16px; font-size: 1.05rem; font-weight: 700;">📋 詳細數據對照分析表</h4>
                <div class="table-responsive" id="compareTableContainer"></div>
            </div>
        </div>
    `;

    // 綁定事件
    document.querySelectorAll('.compare-company-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const idx = compareState.selectedCompanyIds.indexOf(id);
            const c = COMPANIES.find(comp => comp.id === id);
            
            if (idx > -1) {
                // 檢查是否少於 2 家
                if (compareState.selectedCompanyIds.length <= 2) {
                    alert('最少必須選擇 2 家企業進行比較！');
                    return;
                }
                compareState.selectedCompanyIds.splice(idx, 1);
                e.target.classList.remove('active');
                e.target.style.backgroundColor = '#f1f5f9';
                e.target.style.color = '#64748b';
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
            } else {
                const MAX_COMPARE = 4;
                if (compareState.selectedCompanyIds.length >= MAX_COMPARE) {
                    alert(`雷達圖最多同時比較 ${MAX_COMPARE} 家企業，請先取消一家再選擇。`);
                    return;
                }
                compareState.selectedCompanyIds.push(id);
                e.target.classList.add('active');
                e.target.style.backgroundColor = c.brandColor;
                e.target.style.color = '#ffffff';
                e.target.style.borderColor = c.brandColor;
                e.target.style.boxShadow = `0 2px 8px ${c.brandColor}33`;
            }
            updateComparison(compareState.selectedCompanyIds);
        });
    });

    document.getElementById('btn-export-img').addEventListener('click', exportComparisonImg);
    document.getElementById('btn-copy-summary').addEventListener('click', exportComparisonSummary);
}

/**
 * 更新所有比較視圖
 */
function updateComparison(selectedIds) {
    const selectedCompanies = COMPANIES.filter(c => selectedIds.includes(c.id));
    
    renderRadarChart('compareRadarChart', selectedCompanies);
    renderComparisonBarChart('compareBarChart', selectedCompanies);
    renderComparisonTable('compareTableContainer', selectedCompanies);
}

/**
 * 取得公司統計數據總和
 */
function getCompanyAggregatedStats(companyId) {
    const stats = MONTHLY_STATS[companyId];
    if (!stats || stats.length === 0) return null;
    
    const prTotal = stats.reduce((s, item) => s + item.pressReleaseCount, 0);
    const mediaTotal = stats.reduce((s, item) => s + item.mediaCoverage, 0);
    const socialTotal = stats.reduce((s, item) => s + item.socialMentions, 0);
    const kolTotal = stats.reduce((s, item) => s + item.kolCollabs, 0);
    
    // 計算成長率 (簡化：後半期對比前半期)
    const half = Math.floor(stats.length / 2);
    const firstHalfMedia = stats.slice(0, half).reduce((s, item) => s + item.mediaCoverage, 0);
    const secondHalfMedia = stats.slice(half).reduce((s, item) => s + item.mediaCoverage, 0);
    const growthRate = firstHalfMedia === 0 ? 0 : ((secondHalfMedia - firstHalfMedia) / firstHalfMedia) * 100;

    return { prTotal, mediaTotal, socialTotal, kolTotal, growthRate, monthsCount: stats.length };
}

/**
 * 繪製雷達圖 (優雅亮色)
 */
function renderRadarChart(canvasId, selectedCompanies) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // 計算最大值以進行正規化 (0-100)
    let maxPr = 0, maxMedia = 0, maxSocial = 0, maxKol = 0, maxGrowth = 0;
    
    const rawData = selectedCompanies.map(c => {
        const s = getCompanyAggregatedStats(c.id);
        maxPr = Math.max(maxPr, s.prTotal);
        maxMedia = Math.max(maxMedia, s.mediaTotal);
        maxSocial = Math.max(maxSocial, s.socialTotal);
        maxKol = Math.max(maxKol, s.kolTotal);
        maxGrowth = Math.max(maxGrowth, s.growthRate);
        return { company: c, stats: s };
    });

    const normalize = (val, max) => max === 0 ? 0 : (val / max) * 100;

    const datasets = rawData.map(d => ({
        label: d.company.name,
        data: [
            normalize(d.stats.prTotal, maxPr),
            normalize(d.stats.mediaTotal, maxMedia),
            normalize(d.stats.socialTotal, maxSocial),
            normalize(d.stats.kolTotal, maxKol),
            normalize(d.stats.growthRate, maxGrowth)
        ],
        backgroundColor: d.company.brandColor + '20', // 半透明美麗彩亮填色
        borderColor: d.company.brandColor,
        pointBackgroundColor: d.company.brandColor,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: d.company.brandColor,
        borderWidth: 2
    }));

    if (compareCharts[canvasId]) {
        compareCharts[canvasId].data.datasets = datasets;
        compareCharts[canvasId].update();
    } else {
        compareCharts[canvasId] = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: ['新聞稿數量', '媒體曝光量', '社群聲量', 'KOL合作數', '曝光成長率'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#334155', font: { size: 12, family: "'Noto Sans TC', sans-serif" } }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0, 0, 0, 0.08)' },
                        grid: { color: 'rgba(0, 0, 0, 0.06)' },
                        pointLabels: { color: '#334155', font: { size: 12, weight: '700', family: "'Noto Sans TC', sans-serif" } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#a0a0b8' } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${Math.round(context.raw)}分 (相對值)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * 繪製關鍵數據比較長條圖
 */
function renderComparisonBarChart(canvasId, selectedCompanies) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const dataRows = selectedCompanies.map(c => {
        return {
            company: c,
            stats: getCompanyAggregatedStats(c.id)
        };
    });

    const datasets = dataRows.map(row => ({
        label: row.company.name,
        data: [
            row.stats.prTotal,
            row.stats.mediaTotal,
            row.stats.socialTotal,
            row.stats.kolTotal
        ],
        backgroundColor: row.company.brandColor,
        borderRadius: 4
    }));

    if (compareCharts[canvasId]) {
        compareCharts[canvasId].data.datasets = datasets;
        compareCharts[canvasId].update();
    } else {
        compareCharts[canvasId] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['新聞稿', '媒體曝光', '社群聲量', 'KOL合作'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#334155', font: { size: 12, family: "'Noto Sans TC', sans-serif" } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#64748b' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#334155', font: { weight: '600' } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

/**
 * 渲染對照表 (亮色質感)
 */
function renderComparisonTable(containerId, selectedCompanies) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const statsData = selectedCompanies.map(c => ({ company: c, stats: getCompanyAggregatedStats(c.id) }));
    
    // 找出各項最佳值
    const bestVals = {
        prTotal: Math.max(...statsData.map(d => d.stats.prTotal)),
        mediaTotal: Math.max(...statsData.map(d => d.stats.mediaTotal)),
        socialTotal: Math.max(...statsData.map(d => d.stats.socialTotal)),
        kolTotal: Math.max(...statsData.map(d => d.stats.kolTotal))
    };

    const renderCell = (val, bestVal) => {
        const isBest = val === bestVal && val > 0;
        return `<td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; ${isBest ? 'color: #d97706; font-weight: 700; background: #fffbeb;' : 'color: #334155;'}">${val.toLocaleString()}${isBest ? ' 👑' : ''}</td>`;
    };

    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse; min-width: 600px; font-size: 0.95rem;">
            <thead>
                <tr style="background: #f1f5f9;">
                    <th style="padding: 12px 16px; text-align: left; color: #475569; border-bottom: 2px solid #e2e8f0;">比較指標 / 企業</th>
                    ${selectedCompanies.map(c => `<th style="padding: 12px 16px; text-align: right; color: ${c.brandColor}; border-bottom: 2px solid ${c.brandColor}; font-weight: 700;">${c.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #475569; font-weight: 600;">📰 新聞稿總發布數</td>
                    ${statsData.map(d => renderCell(d.stats.prTotal, bestVals.prTotal)).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #475569; font-weight: 600;">📺 媒體報導總篇數</td>
                    ${statsData.map(d => renderCell(d.stats.mediaTotal, bestVals.mediaTotal)).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #475569; font-weight: 600;">💬 社群網路聲量提及</td>
                    ${statsData.map(d => renderCell(d.stats.socialTotal, bestVals.socialTotal)).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #475569; font-weight: 600;">🤝 KOL 實況主合作數</td>
                    ${statsData.map(d => renderCell(d.stats.kolTotal, bestVals.kolTotal)).join('')}
                </tr>
            </tbody>
        </table>
    `;

    container.innerHTML = tableHtml;
}

/**
 * 強制重算尺寸並重繪對比工具圖表 (解決 SPA 切頁 display:none -> block 的畫布空白)
 */
function forceResizeCompareCharts() {
    const compareSec = document.getElementById('compare');
    if (compareSec && (compareSec.offsetWidth === 0 || window.getComputedStyle(compareSec).display === 'none')) {
        return; // 若頁面處於隱藏狀態，暫不出圖
    }

    const container = document.getElementById('compareContainer');
    if (!container) return;

    if (!container.children || container.children.length === 0) {
        initCompare('compareContainer');
    }

    // 強制銷毀舊實例
    if (typeof compareCharts !== 'undefined') {
        Object.keys(compareCharts).forEach(key => {
            if (compareCharts[key]) {
                try { compareCharts[key].destroy(); } catch (e) {}
                delete compareCharts[key];
            }
        });
    }

    if (typeof compareState !== 'undefined' && compareState.selectedCompanyIds) {
        updateComparison(compareState.selectedCompanyIds);
    }
}

/**
 * 匯出比較雷達圖為 PNG 圖片
 */
function exportComparisonImg() {
    const chart = compareCharts['compareRadarChart'];
    if (!chart) {
        alert('請先選擇要比較的企業並生成圖表。');
        return;
    }
    const link = document.createElement('a');
    link.download = `遊戲企業PK雷達圖_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = chart.toBase64Image('image/png', 1);
    link.click();
}

/**
 * 複製文字摘要
 */
function exportComparisonSummary() {
    const selectedCompanies = COMPANIES.filter(c => compareState.selectedCompanyIds.includes(c.id));
    let summary = `【遊戲公司媒體曝光度比較】\n比較對象：${selectedCompanies.map(c => c.name).join(', ')}\n\n`;
    
    selectedCompanies.forEach(c => {
        const s = getCompanyAggregatedStats(c.id);
        summary += `[${c.name}]\n`;
        summary += `- 新聞稿：${s.prTotal} 篇\n`;
        summary += `- 媒體曝光：${s.mediaTotal} 則\n`;
        summary += `- KOL合作：${s.kolTotal} 次\n\n`;
    });

    navigator.clipboard.writeText(summary).then(() => {
        alert('摘要已成功複製到剪貼簿！');
    }).catch(err => {
        console.error('複製失敗:', err);
        alert('複製失敗，請手動複製。');
    });
}

window.initCompare = initCompare;
