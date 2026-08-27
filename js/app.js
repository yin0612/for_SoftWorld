// 輿情決策台 主應用邏輯 (Dashboard SPA Controller)

document.addEventListener('DOMContentLoaded', () => {
    // 確保資料已載入
    if (typeof COMPANIES === 'undefined' || typeof PRESS_RELEASES === 'undefined') {
        console.error('Data not loaded. Make sure data.js is included before app.js');
        return;
    }

    initHashRouter();
    initStatsOverview();
    renderCompanyCards();
    renderOverviewStream();
    initNewsSection();
});

// 1. Hash 路由切換系統 (Hash Router for Dashboard SPA)
function initHashRouter() {
    const navItems = document.querySelectorAll('.sys-nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    function handleHashChange() {
        let hash = window.location.hash || '#/overview';
        let targetView = hash.replace('#/', '');

        // 預設為 overview
        if (!document.getElementById(`view-${targetView}`)) {
            targetView = 'overview';
            window.location.hash = '#/overview';
        }

        // 切換 Active View
        viewSections.forEach(section => {
            if (section.id === `view-${targetView}`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // 切換 Nav Item Active 狀態
        navItems.forEach(item => {
            const itemKey = item.getAttribute('data-view');
            if (itemKey === targetView) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 捲動至頁面頂端
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 觸發圖表與動畫
        if (targetView === 'charts' && typeof initAllCharts === 'function') {
            setTimeout(initAllCharts, 100);
        }
        if (targetView === 'compare' && typeof initCompare === 'function') {
            setTimeout(() => initCompare('compareContainer'), 100);
        }
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // 初始載入觸發
}

// 2. 初始化 4 大 KPI 統計指標數據
function initStatsOverview() {
    let totalPR = 0;
    let totalCoverage = 0;
    let totalSocial = 0;
    let totalKol = 0;

    if (typeof PRESS_RELEASES !== 'undefined') {
        totalPR = PRESS_RELEASES.length;
    }

    if (typeof MONTHLY_STATS !== 'undefined') {
        Object.values(MONTHLY_STATS).forEach(companyStats => {
            companyStats.forEach(stat => {
                totalCoverage += (stat.mediaCoverage || 0);
                totalSocial += (stat.socialMentions || 0);
                totalKol += (stat.kolCollabs || 0);
            });
        });
    }

    // 更新 KPI 指標卡片 (數字格式化)
    const elPR = document.getElementById('kpiPressReleases');
    const elCoverage = document.getElementById('kpiMediaCoverage');
    const elSocial = document.getElementById('kpiSocialMentions');
    const elKol = document.getElementById('kpiKolCollabs');

    if (elPR) elPR.textContent = totalPR.toLocaleString();
    if (elCoverage) elCoverage.textContent = totalCoverage.toLocaleString();
    if (elSocial) elSocial.textContent = totalSocial.toLocaleString();
    if (elKol) elKol.textContent = totalKol.toLocaleString();
}

// 3. 渲染總覽儀表板觀測清單與熱點新聞流
function renderOverviewStream() {
    // 渲染排行榜 Top 5 公司
    const topListEl = document.getElementById('topCompaniesList');
    if (topListEl && typeof COMPANIES !== 'undefined') {
        topListEl.innerHTML = '';
        
        // 依照新聞發布與媒體曝光計算總和排序
        const rankedCompanies = [...COMPANIES].map(comp => {
            const stats = MONTHLY_STATS[comp.id] || [];
            const totalCov = stats.reduce((acc, curr) => acc + (curr.mediaCoverage || 0), 0);
            const totalPRCount = PRESS_RELEASES.filter(pr => pr.companyId === comp.id).length;
            return { ...comp, totalCov, totalPRCount };
        }).sort((a, b) => b.totalCov - a.totalCov);

        rankedCompanies.slice(0, 5).forEach((comp, idx) => {
            const item = document.createElement('div');
            item.className = 'top-company-item';
            item.style.setProperty('--item-color', comp.brandColor || comp.color);
            item.innerHTML = `
                <div class="top-company-info">
                    <span class="top-rank-num">0${idx + 1}</span>
                    <span class="top-company-name">${comp.name}</span>
                    <span class="top-company-stock">${comp.stock || comp.stockTicker}</span>
                </div>
                <div class="top-company-stats">
                    <div class="top-stat-val">${comp.totalCov.toLocaleString()} <span style="font-size: 0.7rem;">篇</span></div>
                    <div class="top-stat-lbl">媒體報導曝光聲量</div>
                </div>
            `;
            topListEl.appendChild(item);
        });
    }

    // 渲染最新熱點新聞動態流 (前 5 則)
    const streamEl = document.getElementById('recentNewsStream');
    if (streamEl && typeof PRESS_RELEASES !== 'undefined') {
        streamEl.innerHTML = '';

        const sortedPR = [...PRESS_RELEASES].sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedPR.slice(0, 5).forEach(news => {
            const item = document.createElement('div');
            item.className = 'stream-news-item';
            item.style.setProperty('--item-color', news.companyColor || '#2d5a3f');
            item.innerHTML = `
                <div class="stream-news-meta">
                    <span class="stream-news-comp">${news.companyName}</span>
                    <span class="stream-news-date">${news.date}</span>
                </div>
                <h4 class="stream-news-title">${news.title}</h4>
                <div class="stream-news-source">媒體來源：${news.source} • 分類：${news.category}</div>
            `;
            streamEl.appendChild(item);
        });
    }
}

// 4. 渲染企業品牌卡片 (Companies View)
function renderCompanyCards() {
    const container = document.getElementById('companyGrid');
    if (!container) return;

    container.innerHTML = '';
    
    COMPANIES.forEach((company) => {
        const card = document.createElement('div');
        card.className = 'company-card animate-on-scroll';
        card.style.setProperty('--card-brand-color', company.brandColor || company.color);
        
        const productsList = company.products || company.keyProducts || [];
        const tagsHtml = productsList.map(p => `<span class="tag">${p}</span>`).join('');
        const newsText = company.latestNews || company.recentNews || '2024-2026 營運與公關動態彙整中';
        
        card.innerHTML = `
            <div class="company-card-header">
                <div>
                    <h3 class="company-name" style="color: ${company.brandColor || company.color}">${company.name}</h3>
                    <div class="company-meta">
                        <span>${company.enName || company.englishName || ''}</span> • 
                        <span>成立 ${company.founded || company.foundingYear} 年</span>
                    </div>
                </div>
                <span class="company-stock">${company.stock || company.stockTicker}</span>
            </div>
            <p class="company-desc">${company.description || company.desc}</p>
            <div style="margin-bottom: var(--spacing-sm);">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">核心代表作品：</div>
                <div class="company-tags">${tagsHtml}</div>
            </div>
            <div style="background: #f8faf9; border-left: 3px solid ${company.brandColor || company.color}; padding: 10px 12px; border-radius: 4px; font-size: 0.8rem; margin-bottom: var(--spacing-md);">
                <span style="font-weight: 700; color: ${company.brandColor || company.color}; display: block; margin-bottom: 2px;">2024-2026 重大動態：</span>
                <span style="color: #475569; line-height: 1.5; display: block;">${newsText}</span>
            </div>
            <div class="company-card-footer">
                <a href="${company.website || company.officialWebsite}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">
                    官方網站 ↗
                </a>
                <button class="btn btn-primary btn-sm view-details-btn" data-id="${company.id}">
                    完整剖析
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });

    // 綁定詳細資訊 Modal 按鈕
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const companyId = e.currentTarget.getAttribute('data-id');
            showCompanyModal(companyId);
        });
    });
}

// 彈出公司詳細資訊 Modal
function showCompanyModal(companyId) {
    const modal = document.getElementById('companyModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    const company = COMPANIES.find(c => c.id === companyId);
    if (!company) return;

    const productsList = company.products || company.keyProducts || [];
    const tagsHtml = productsList.map(p => `<span class="tag">${p}</span>`).join('');

    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <span class="section-tag" style="background: ${company.brandColor}15; color: ${company.brandColor}">${company.stock || company.stockTicker}</span>
            <h2 style="font-size: 1.8rem; color: ${company.brandColor}; margin-top: 8px;">${company.name}</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${company.enName || company.englishName || ''}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <h4 style="font-size: 1rem; margin-bottom: 6px;">公司簡介</h4>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">${company.description || company.desc}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <h4 style="font-size: 1rem; margin-bottom: 6px;">主要代表作品</h4>
            <div class="company-tags">${tagsHtml}</div>
        </div>
        <div style="margin-bottom: 20px; background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-sm);">
            <h4 style="font-size: 0.9rem; color: var(--primary); margin-bottom: 4px;">近期關鍵動態</h4>
            <p style="font-size: 0.9rem; color: var(--text-primary);">${company.latestNews || company.recentNews || '資料彙整中'}</p>
        </div>
        <div style="text-align: right;">
            <a href="${company.website || company.officialWebsite}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">前往官方網站 ↗</a>
        </div>
    `;

    modal.classList.add('active');

    const closeBtn = document.getElementById('modalClose');
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove('active');
    }
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };
}

// 5. 新聞發布區塊與過濾邏輯
let currentNewsPage = 1;
const NEWS_PER_PAGE = 8;
let filteredNews = [];

function initNewsSection() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    setupNewsFilters();
    filteredNews = [...PRESS_RELEASES];
    renderNews();

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentNewsPage++;
            renderNews(true);
        });
    }
}

function setupNewsFilters() {
    const togglesContainer = document.getElementById('companyToggles');
    if (!togglesContainer) return;

    togglesContainer.innerHTML = '';

    COMPANIES.forEach(comp => {
        const btn = document.createElement('button');
        btn.className = 'company-toggle-btn active';
        btn.setAttribute('data-id', comp.id);
        btn.style.setProperty('--btn-brand-color', comp.brandColor || comp.color);
        btn.innerHTML = `<span>✓</span> ${comp.name}`;

        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
                btn.querySelector('span').textContent = '✓';
            } else {
                btn.querySelector('span').textContent = '+';
            }
            applyNewsFilters();
        });

        togglesContainer.appendChild(btn);
    });

    const categorySelect = document.getElementById('filterCategory');
    const keywordInput = document.getElementById('filterKeyword');
    const dateFromInput = document.getElementById('filterDateFrom');
    const dateToInput = document.getElementById('filterDateTo');

    if (categorySelect) categorySelect.addEventListener('change', applyNewsFilters);
    if (keywordInput) keywordInput.addEventListener('input', applyNewsFilters);
    if (dateFromInput) dateFromInput.addEventListener('change', applyNewsFilters);
    if (dateToInput) dateToInput.addEventListener('change', applyNewsFilters);
}

function applyNewsFilters() {
    const activeCompBtns = document.querySelectorAll('.company-toggle-btn.active');
    const selectedCompanies = Array.from(activeCompBtns).map(btn => btn.getAttribute('data-id'));

    const selectedCategory = document.getElementById('filterCategory')?.value || '';
    const keyword = document.getElementById('filterKeyword')?.value.toLowerCase().trim() || '';
    const dateFrom = document.getElementById('filterDateFrom')?.value || '';
    const dateTo = document.getElementById('filterDateTo')?.value || '';

    filteredNews = PRESS_RELEASES.filter(news => {
        const matchCompany = selectedCompanies.includes(news.companyId);
        const matchCategory = !selectedCategory || news.category === selectedCategory;
        const matchKeyword = !keyword || 
                             news.title.toLowerCase().includes(keyword) || 
                             news.excerpt.toLowerCase().includes(keyword) ||
                             news.companyName.toLowerCase().includes(keyword);
        
        let matchDate = true;
        if (dateFrom && news.date < dateFrom) matchDate = false;
        if (dateTo && news.date > dateTo) matchDate = false;

        return matchCompany && matchCategory && matchKeyword && matchDate;
    });

    currentNewsPage = 1;
    renderNews(false);
}

function renderNews(append = false) {
    const container = document.getElementById('timelineContainer');
    const loadMoreBtn = document.getElementById('timelineLoadMore');
    const countEl = document.getElementById('filterResultCount');

    if (!container) return;

    if (!append) {
        container.innerHTML = '';
    }

    if (countEl) {
        countEl.textContent = `共 ${filteredNews.length} 則符合條件新聞稿`;
    }

    const startIndex = (currentNewsPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    const newsToShow = filteredNews.slice(startIndex, endIndex);

    if (filteredNews.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">找不到符合條件的公關新聞稿。</div>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    newsToShow.forEach(news => {
        const item = document.createElement('div');
        item.className = 'timeline-item animate-on-scroll';
        item.style.setProperty('--item-brand-color', news.companyColor || '#2d5a3f');

        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="timeline-card-header">
                    <span class="timeline-company-badge" style="background: ${news.companyColor}18; color: ${news.companyColor}">
                        ${news.companyName}
                    </span>
                    <span class="timeline-date">${news.date}</span>
                </div>
                <h4 class="timeline-title">${news.title}</h4>
                <p class="timeline-excerpt">${news.excerpt}</p>
                <div class="timeline-footer">
                    <span class="timeline-category">${news.category}</span>
                    <span class="timeline-source">來源：${news.source}</span>
                </div>
            </div>
        `;
        container.appendChild(item);
    });

    if (loadMoreBtn) {
        if (endIndex >= filteredNews.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}
