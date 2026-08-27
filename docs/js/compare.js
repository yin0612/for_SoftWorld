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

    // 預設全選
    compareState.selectedCompanyIds = COMPANIES.map(c => c.id);

    renderCompareUI(container);
    updateComparison(compareState.selectedCompanyIds);
}

/**
 * 渲染 UI 外觀
 */
function renderCompareUI(container) {
    // 公司選擇器
    const selectorsHtml = COMPANIES.map(c => `
        <button class="compare-company-btn active" data-id="${c.id}" 
                style="background-color: ${c.brandColor}33; color: ${c.brandColor}; border: 1px solid ${c.brandColor}; padding: 8px 16px; border-radius: 20px; cursor: pointer; margin: 5px; transition: all 0.3s ease;">
            ${c.name}
        </button>
    `).join('');

    container.innerHTML = `
        <div class="compare-controls" style="margin-bottom: 30px; text-align: center;">
            <h3 style="color: #fff; margin-bottom: 15px;">選擇要比較的企業 (最少 2 家)</h3>
            <div class="company-selectors" id="compare-company-selectors" style="display: flex; flex-wrap: wrap; justify-content: center; margin-bottom: 20px;">
                ${selectorsHtml}
            </div>
            <div class="compare-actions">
                <button id="btn-export-img" style="background: transparent; border: 1px solid #555; color: #ccc; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin: 0 5px;">下載圖片</button>
                <button id="btn-copy-summary" style="background: transparent; border: 1px solid #555; color: #ccc; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin: 0 5px;">複製摘要</button>
            </div>
        </div>
        
        <div class="compare-dashboard" id="compare-export-area" style="background: #1a1a24; padding: 20px; border-radius: 12px;">
            <div class="compare-row" style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px;">
                <div class="compare-chart-container" style="flex: 1; min-width: 300px; background: #252533; padding: 20px; border-radius: 8px;">
                    <h4 style="color: #fff; text-align: center; margin-top: 0;">綜合指標雷達圖</h4>
                    <div style="height: 350px; position: relative;"><canvas id="compareRadarChart"></canvas></div>
                </div>
                <div class="compare-chart-container" style="flex: 1; min-width: 300px; background: #252533; padding: 20px; border-radius: 8px;">
                    <h4 style="color: #fff; text-align: center; margin-top: 0;">關鍵數據比較</h4>
                    <div style="height: 350px; position: relative;"><canvas id="compareBarChart"></canvas></div>
                </div>
            </div>
            <div class="compare-table-container" style="background: #252533; padding: 20px; border-radius: 8px; overflow-x: auto;">
                <h4 style="color: #fff; margin-top: 0; margin-bottom: 15px;">詳細數據對照表</h4>
                <div class="table-responsive" id="compareTableContainer"></div>
            </div>
        </div>
    `;

    // 綁定事件
    document.querySelectorAll('.compare-company-btn').forEach(btn => {
        // 設定 active 狀態樣式
        btn.style.backgroundColor = btn.dataset.active ? COMPANIES.find(c=>c.id === btn.dataset.id).brandColor : COMPANIES.find(c=>c.id === btn.dataset.id).brandColor + '33';
        btn.style.color = btn.dataset.active ? '#fff' : COMPANIES.find(c=>c.id === btn.dataset.id).brandColor;

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
                e.target.style.backgroundColor = c.brandColor + '33';
                e.target.style.color = c.brandColor;
            } else {
                compareState.selectedCompanyIds.push(id);
                e.target.classList.add('active');
                e.target.style.backgroundColor = c.brandColor;
                e.target.style.color = '#fff';
            }
            updateComparison(compareState.selectedCompanyIds);
        });
        
        // 初始化全部為 active 狀態
        const c = COMPANIES.find(comp => comp.id === btn.dataset.id);
        btn.style.backgroundColor = c.brandColor;
        btn.style.color = '#fff';
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
 * 繪製雷達圖
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
        backgroundColor: d.company.brandColor + '33', // 0.2 opacity
        borderColor: d.company.brandColor,
        pointBackgroundColor: d.company.brandColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
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
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#e2e8f0', font: { size: 12, family: "'Noto Sans TC', sans-serif" } },
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
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

/**
 * 渲染對照表
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
        return `<td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; ${isBest ? 'color: #ffb703; font-weight: bold;' : 'color: #ccc;'}">${val.toLocaleString()}${isBest ? ' ★' : ''}</td>`;
    };

    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
            <thead>
                <tr>
                    <th style="padding: 12px; text-align: left; color: #a0a0b8; border-bottom: 1px solid rgba(255,255,255,0.1);">比較項目</th>
                    ${selectedCompanies.map(c => `<th style="padding: 12px; text-align: right; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); border-top: 3px solid ${c.brandColor}">${c.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #a0a0b8;">新聞稿總數</td>
                    ${statsData.map(d => renderCell(d.stats.prTotal, bestVals.prTotal)).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #a0a0b8;">媒體曝光總數</td>
                    ${statsData.map(d => renderCell(d.stats.mediaTotal, bestVals.mediaTotal)).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #a0a0b8;">社群提及總數</td>
                    ${statsData.map(d => renderCell(d.stats.socialTotal, bestVals.socialTotal)).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #a0a0b8;">KOL合作總數</td>
                    ${statsData.map(d => renderCell(d.stats.kolTotal, bestVals.kolTotal)).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #a0a0b8;">月均新聞稿</td>
                    ${statsData.map(d => `<td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #ccc;">${(d.stats.prTotal / d.stats.monthsCount).toFixed(1)}</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #a0a0b8;">月均媒體曝光</td>
                    ${statsData.map(d => `<td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #ccc;">${(d.stats.mediaTotal / d.stats.monthsCount).toFixed(1)}</td>`).join('')}
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #a0a0b8;">最活躍月份</td>
                    ${statsData.map(d => {
                        const maxMonth = MONTHLY_STATS[d.company.id].reduce((prev, current) => 
                            (prev.mediaCoverage > current.mediaCoverage) ? prev : current
                        );
                        return `<td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #ccc;">${maxMonth.month} (${maxMonth.mediaCoverage}則)</td>`;
                    }).join('')}
                </tr>
            </tbody>
        </table>
    `;

    container.innerHTML = tableHtml;
}

/**
 * 匯出比較圖為圖片 (示意)
 */
function exportComparisonImg() {
    alert('此功能需要引入 html2canvas 函式庫，若已引入則可將比較區域匯出為圖片！');
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
