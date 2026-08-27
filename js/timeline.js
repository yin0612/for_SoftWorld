/**
 * 新聞稿時間軸模組 (Timeline Module)
 * 負責渲染、過濾及動畫顯示新聞稿動態
 */

let state = {
    filteredReleases: [],
    currentPage: 1,
    itemsPerPage: 20,
    sortOrder: 'desc' // 'desc' 新到舊, 'asc' 舊到新
};

/**
 * 取得公司品牌顏色與名稱
 */
function getCompanyDetails(companyId) {
    const company = COMPANIES.find(c => c.id === companyId);
    return company || { name: '未知', brandColor: '#777' };
}

/**
 * 初始化時間軸
 */
function initTimeline(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 初始載入所有新聞稿
    state.filteredReleases = [...PRESS_RELEASES];
    sortReleases();
    
    renderTimelineContainer(container);
    renderItems(true);
    setupScrollAnimation();
}

/**
 * 排序新聞稿
 */
function sortReleases() {
    state.filteredReleases.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return state.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
}

/**
 * 渲染時間軸外層結構
 */
function renderTimelineContainer(container) {
    container.innerHTML = `
        <div class="timeline-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div class="timeline-stats">
                共找到 <span id="timeline-count" class="neon-text" style="color: #00b4d8; font-weight: bold;">${state.filteredReleases.length}</span> 篇新聞稿
            </div>
            <div class="timeline-controls">
                <button id="timeline-sort-btn" style="background: transparent; border: 1px solid #555; color: #ccc; padding: 5px 10px; cursor: pointer; border-radius: 4px;">
                    排序：${state.sortOrder === 'desc' ? '由新到舊' : '由舊到新'}
                </button>
            </div>
        </div>
        <div id="timeline-track" class="timeline-track" style="position: relative; padding: 20px 0;">
            <!-- 中心線 -->
            <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.1); transform: translateX(-50%);"></div>
            <!-- 項目將插入於此 -->
        </div>
        <div class="timeline-footer" style="text-align: center; margin-top: 30px;">
            <button id="timeline-load-more" style="background: #4361ee; border: none; color: white; padding: 10px 20px; border-radius: 20px; cursor: pointer; display: none;">載入更多</button>
        </div>
    `;

    document.getElementById('timeline-sort-btn').addEventListener('click', (e) => {
        state.sortOrder = state.sortOrder === 'desc' ? 'asc' : 'desc';
        e.target.textContent = `排序：${state.sortOrder === 'desc' ? '由新到舊' : '由舊到新'}`;
        state.currentPage = 1;
        sortReleases();
        renderItems(true);
        setupScrollAnimation();
    });

    document.getElementById('timeline-load-more').addEventListener('click', () => {
        state.currentPage++;
        renderItems(false);
        setupScrollAnimation();
    });
}

/**
 * 過濾時間軸項目
 */
function filterTimeline(filters) {
    let results = PRESS_RELEASES;

    if (filters.companies && filters.companies.length > 0) {
        results = results.filter(pr => filters.companies.includes(pr.companyId));
    }
    if (filters.dateFrom) {
        const fromTime = new Date(filters.dateFrom).getTime();
        results = results.filter(pr => new Date(pr.date).getTime() >= fromTime);
    }
    if (filters.dateTo) {
        const toTime = new Date(filters.dateTo).getTime();
        results = results.filter(pr => new Date(pr.date).getTime() <= toTime);
    }
    if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        results = results.filter(pr => 
            pr.title.toLowerCase().includes(kw) || 
            pr.excerpt.toLowerCase().includes(kw)
        );
    }
    if (filters.category) {
        results = results.filter(pr => pr.category === filters.category);
    }

    state.filteredReleases = results;
    state.currentPage = 1;
    sortReleases();
    
    document.getElementById('timeline-count').textContent = results.length;
    renderItems(true);
    setupScrollAnimation();
}

/**
 * 渲染單個時間軸項目 DOM
 */
function renderTimelineItem(pr, index) {
    const company = getCompanyDetails(pr.companyId);
    const item = document.createElement('div');
    const alignment = index % 2 === 0 ? 'left' : 'right';
    
    // 行內樣式，確保於深色背景顯示
    item.className = \`timeline-item \${alignment} hidden-timeline-item\`;
    item.style.cssText = \`
        position: relative;
        width: 50%;
        padding: 20px 40px;
        box-sizing: border-box;
        margin-bottom: 20px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
        \${alignment === 'left' ? 'left: 0; text-align: right;' : 'left: 50%; text-align: left;'}
    \`;
    
    item.innerHTML = \`
        <div class="timeline-marker" style="position: absolute; top: 25px; \${alignment === 'left' ? 'right: -6px;' : 'left: -6px;'} width: 12px; height: 12px; border-radius: 50%; background: #1a1a24; border: 2px solid \${company.brandColor}; box-shadow: 0 0 10px \${company.brandColor}aa; z-index: 2;"></div>
        
        <div class="timeline-content card" style="background: #252533; border-radius: 8px; padding: 20px; border-top: 4px solid \${company.brandColor}; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: inline-block; width: 100%; text-align: left;">
            <div class="timeline-date" style="color: #a0a0b8; font-size: 0.9em; margin-bottom: 10px;">\${pr.date}</div>
            <div class="timeline-tags" style="margin-bottom: 15px;">
                <span class="badge" style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; margin-right: 5px; background-color: \${company.brandColor}22; color: \${company.brandColor}; border: 1px solid \${company.brandColor}">\${company.name}</span>
                <span class="badge badge-outline" style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; border: 1px solid #555; color: #ccc;">\${pr.category}</span>
            </div>
            <h3 class="timeline-title" style="margin: 0 0 10px 0; font-size: 1.2em; color: #fff;">\${pr.title}</h3>
            <p class="timeline-excerpt" style="margin: 0 0 15px 0; color: #b0b0c0; font-size: 0.95em; line-height: 1.5;">\${pr.excerpt}</p>
            <div class="timeline-meta" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85em;">
                <span class="source" style="color: #888;">📰 \${pr.source}</span>
                \${pr.link ? \`<a href="\${pr.link}" target="_blank" class="read-more" style="color: \${company.brandColor}; text-decoration: none;">閱讀全文 &rarr;</a>\` : ''}
            </div>
        </div>
    \`;
    
    return item;
}

/**
 * 渲染當前頁面的項目
 */
function renderItems(clear = false) {
    const track = document.getElementById('timeline-track');
    if (clear) {
        // 清除除了中心線以外的項目
        const items = track.querySelectorAll('.timeline-item');
        items.forEach(item => item.remove());
    }

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const itemsToShow = state.filteredReleases.slice(startIndex, endIndex);

    itemsToShow.forEach((pr, index) => {
        const itemEl = renderTimelineItem(pr, startIndex + index);
        track.appendChild(itemEl);
    });

    const loadMoreBtn = document.getElementById('timeline-load-more');
    if (endIndex >= state.filteredReleases.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

/**
 * 設定滾動動畫 (Intersection Observer)
 */
function setupScrollAnimation() {
    const items = document.querySelectorAll('.hidden-timeline-item');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('hidden-timeline-item');
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    items.forEach(item => observer.observe(item));
}

// 加入 RWD 樣式
const style = document.createElement('style');
style.textContent = \`
    @media (max-width: 768px) {
        .timeline-item {
            width: 100% !important;
            padding-left: 30px !important;
            padding-right: 0 !important;
            left: 0 !important;
            text-align: left !important;
        }
        .timeline-marker {
            left: -6px !important;
        }
        #timeline-track > div:first-child {
            left: 0 !important;
        }
    }
\`;
document.head.appendChild(style);

window.initTimeline = initTimeline;
window.filterTimeline = filterTimeline;
