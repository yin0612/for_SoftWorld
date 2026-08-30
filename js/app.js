document.addEventListener('DOMContentLoaded', () => {
    // 確保資料已載入
    if (typeof COMPANIES === 'undefined' || typeof PRESS_RELEASES === 'undefined') {
        console.error('Data not loaded. Make sure data.js is included before app.js');
        return;
    }

    renderCompanyCards();
    initStatsOverview();
    initNewsSection();
    initNavbar();
    initHashRouter();
    initBackToTop();
});

// 1. Hash SPA 獨立切頁路由器 (點選目錄只顯示該項獨立頁面)
function initHashRouter() {
    const pages = ['companies', 'news', 'analytics', 'compare', 'trends', 'methodology'];

    function handleRouteChange() {
        let hash = window.location.hash || '#/companies';
        
        // 正規化 hash 路徑
        let targetPage = 'companies';
        pages.forEach(p => {
            if (hash.includes(p)) {
                targetPage = p;
            }
        });

        // 1. 隱藏/顯示區塊
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            if (targetPage === 'companies') {
                heroSection.style.setProperty('display', 'block', 'important');
            } else {
                heroSection.style.setProperty('display', 'none', 'important');
            }
        }

        pages.forEach(pId => {
            const sec = document.getElementById(pId);
            if (sec) {
                if (pId === targetPage) {
                    sec.style.setProperty('display', 'block', 'important');
                    sec.style.setProperty('opacity', '1', 'important');
                    sec.style.setProperty('visibility', 'visible', 'important');
                } else {
                    sec.style.setProperty('display', 'none', 'important');
                }
            }
        });

        // 2. 高亮頂部導覽列 active 狀態
        document.querySelectorAll('.navbar-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.includes(targetPage)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // 3. 頁面回到最頂端
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        // 4. 切頁後重新計算 Canvas 尺寸與流暢重繪
        // 用 setTimeout(100ms) 取代 RAF，確保瀏覽器已完成 display:block 的佈局後才渲染圖表
        // 雙層 RAF 仍在瀏覽器繪製前觸發，canvas 可能尺寸為 0；100ms 後佈局必然完成
        setTimeout(() => {
            if (targetPage === 'analytics' && typeof renderAnalyticsCharts === 'function') {
                renderAnalyticsCharts();
            }
            if (targetPage === 'compare' && typeof forceResizeCompareCharts === 'function') {
                forceResizeCompareCharts();
            }
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    // 監聽網址 Hash 變化
    window.addEventListener('hashchange', handleRouteChange);

    // 綁定導覽列連結點擊事件
    document.querySelectorAll('.navbar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                window.location.hash = href;
                handleRouteChange();
            }
        });
    });

    // 初始載入時觸發一次
    if (!window.location.hash) {
        window.history.replaceState(null, '', '#/companies');
    }
    handleRouteChange();
}

// 導覽列與點擊行為
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('navbarToggle');
    const navMenu = document.getElementById('navbarMenu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // 點擊目錄自動關閉行動版選單
    document.querySelectorAll('.navbar-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// 2. 渲染公司卡片
function renderCompanyCards() {
    const container = document.getElementById('companyGrid');
    if (!container) return;

    container.innerHTML = '';
    
    COMPANIES.forEach((company) => {
        const card = document.createElement('div');
        card.className = 'company-card animate-on-scroll is-visible';
        card.style.setProperty('--card-brand-color', company.brandColor || company.color);
        
        const productsList = company.products || company.keyProducts || [];
        const tagsHtml = productsList.map(p => `<span class="tag">${p}</span>`).join('');
        const newsText = company.latestNews || company.recentNews || '2024-2026 營運與公關動態彙整中';
        
        // 判斷新聞來源按鈕
        let newsBtnHtml = '';
        if (company.newsUrl) {
            newsBtnHtml = `<a href="${company.newsUrl}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" title="前往 ${company.name} 官方新聞專區">📰 官方新聞 ↗</a>`;
        } else {
            newsBtnHtml = `<a href="${company.mopsUrl || 'https://mops.twse.com.tw/mops/#/web/home'}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="color: #2d5a3f; border-color: #2d5a3f; background: #eaf3ed;" title="公開資訊觀測站 MOPS 快捷鍵">🏛️ MOPS觀測站 ↗</a>`;
        }

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
            <div class="company-card-footer" style="flex-wrap: wrap;">
                <a href="${company.website || company.officialWebsite}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">
                    官網 ↗
                </a>
                ${newsBtnHtml}
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

    let newsBtnHtml = '';
    if (company.newsUrl) {
        newsBtnHtml = `<a href="${company.newsUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">📰 官方新聞發布專區 ↗</a>`;
    }

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
        <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
            <a href="${company.mopsUrl || 'https://mops.twse.com.tw/mops/#/web/home'}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">🏛️ MOPS 公開資訊觀測站 ↗</a>
            ${newsBtnHtml}
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

// 彈出下鑽溯源 Modal 視窗 (Provenance Modal)
function showProvenanceModal(companyName, month, docs) {
    const modal = document.getElementById('companyModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    // 找出該公司的 newsUrl，提供給空狀態使用
    const company = COMPANIES.find(c => c.name === companyName);
    const newsUrl = company ? (company.newsUrl || company.website) : null;

    let docsListHtml = '';
    if (!docs || docs.length === 0) {
        const newsLink = newsUrl
            ? `<br><a href="${newsUrl}" target="_blank" rel="noopener" style="color:#2d5a3f;font-weight:700;">→ 前往 ${companyName} 官方新聞專區 ↗</a>`
            : '';
        docsListHtml = `<div style="text-align:center; padding: 20px; color: var(--text-muted);">該月份暫無登記之原始新聞來源清單。${newsLink}</div>`;
    } else {
        docsListHtml = docs.map(d => `
            <li style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed var(--border-color); list-style: none;">
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">
                    <a href="${d.url}" target="_blank" rel="noopener" style="color: #2d5a3f; text-decoration: none;">
                        ${d.title} ↗
                    </a>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 12px;">
                    <span>📅 ${d.published_at}</span>
                    <span>📰 來源：${d.source_domain}</span>
                    ${d.category ? `<span>🏷️ ${d.category}</span>` : ''}
                </div>
            </li>
        `).join('');
    }

    modalBody.innerHTML = `
        <div style="margin-bottom: 16px;">
            <span class="section-tag" style="background: #eaf3ed; color: #2d5a3f;">數據下鑽溯源 (Data Provenance)</span>
            <h2 style="font-size: 1.5rem; color: #1e2530; margin-top: 8px;">
                ${companyName} · ${month} 媒體曝光原始連結
            </h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
                點擊以下任何新聞標題可直接跳轉至原始媒體或官方報導頁面（共 ${docs ? docs.length : 0} 則紀錄）：
            </p>
        </div>
        <ul style="padding: 0; margin-bottom: 20px; max-height: 320px; overflow-y: auto;">
            ${docsListHtml}
        </ul>
        <div style="text-align: right;">
            <button class="btn btn-primary btn-sm" id="provenanceCloseBtn">關閉視窗</button>
        </div>
    `;

    modal.classList.add('active');

    const closeBtn = document.getElementById('modalClose');
    const pCloseBtn = document.getElementById('provenanceCloseBtn');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
    if (pCloseBtn) pCloseBtn.onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };
}

// 3. 初始化數據總覽 (計算 4 大指標全站數據)
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

    const elHeroPR = document.getElementById('totalPressReleases');
    const elNews = document.getElementById('statTotalNews');
    const elCoverage = document.getElementById('statTotalCoverage');
    const elSocial = document.getElementById('statTotalSocial');
    const elKol = document.getElementById('statTotalKol');
    const elMonths = document.getElementById('totalMonths');
    const elChannels = document.getElementById('totalChannels');

    if (elHeroPR) { elHeroPR.textContent = totalPR.toLocaleString(); elHeroPR.setAttribute('data-target', totalPR); }
    if (elNews) { elNews.textContent = totalPR.toLocaleString(); elNews.setAttribute('data-target', totalPR); }
    if (elCoverage) { elCoverage.textContent = totalCoverage.toLocaleString(); elCoverage.setAttribute('data-target', totalCoverage); }
    if (elSocial) { elSocial.textContent = totalSocial.toLocaleString(); elSocial.setAttribute('data-target', totalSocial); }
    if (elKol) { elKol.textContent = totalKol.toLocaleString(); elKol.setAttribute('data-target', totalKol); }

    if (elMonths && typeof MONTHS_LIST !== 'undefined') {
        elMonths.textContent = MONTHS_LIST.length;
        elMonths.setAttribute('data-target', MONTHS_LIST.length);
    }
    if (elChannels && typeof MEDIA_CHANNELS !== 'undefined' && typeof COMPANIES !== 'undefined' && COMPANIES.length > 0) {
        const numChannels = Object.keys(MEDIA_CHANNELS[COMPANIES[0].id] || {}).length;
        elChannels.textContent = numChannels;
        elChannels.setAttribute('data-target', numChannels);
    }
}

// 4. 新聞發布區塊與過濾邏輯
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
    const sourceSelect = document.getElementById('filterSource');
    const keywordInput = document.getElementById('filterKeyword');
    const dateFromInput = document.getElementById('filterDateFrom');
    const dateToInput = document.getElementById('filterDateTo');

    if (categorySelect) categorySelect.addEventListener('change', applyNewsFilters);
    if (sourceSelect) sourceSelect.addEventListener('change', applyNewsFilters);
    if (keywordInput) keywordInput.addEventListener('input', applyNewsFilters);
    if (dateFromInput) dateFromInput.addEventListener('change', applyNewsFilters);
    if (dateToInput) dateToInput.addEventListener('change', applyNewsFilters);
}

function applyNewsFilters() {
    const activeCompBtns = document.querySelectorAll('.company-toggle-btn.active');
    const selectedCompanies = Array.from(activeCompBtns).map(btn => btn.getAttribute('data-id'));

    const selectedCategory = document.getElementById('filterCategory')?.value || '';
    const selectedSource = document.getElementById('filterSource')?.value || '';
    const keyword = document.getElementById('filterKeyword')?.value.toLowerCase().trim() || '';
    const dateFrom = document.getElementById('filterDateFrom')?.value || '';
    const dateTo = document.getElementById('filterDateTo')?.value || '';

    filteredNews = PRESS_RELEASES.filter(news => {
        const matchCompany = selectedCompanies.includes(news.companyId);
        const matchCategory = !selectedCategory || news.category === selectedCategory;
        const matchSource = !selectedSource || news.source === selectedSource;
        const matchKeyword = !keyword || 
                             news.title.toLowerCase().includes(keyword) || 
                             news.excerpt.toLowerCase().includes(keyword) ||
                             news.companyName.toLowerCase().includes(keyword);
        
        let matchDate = true;
        if (dateFrom && news.date < dateFrom) matchDate = false;
        if (dateTo && news.date > dateTo) matchDate = false;

        return matchCompany && matchCategory && matchSource && matchKeyword && matchDate;
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
        item.className = 'timeline-item animate-on-scroll is-visible';
        item.style.setProperty('--item-brand-color', news.companyColor || '#2d5a3f');
        // F-08 Option B：合成資料徽章
        const syntheticBadge = news.synthetic
            ? '<span style="background:#fef3c7;color:#92400e;font-size:0.7rem;padding:2px 7px;border-radius:20px;font-weight:700;margin-left:8px;vertical-align:middle;">🤖 模擬資料</span>'
            : '';

        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="timeline-card-header">
                    <span class="timeline-company-badge" style="background: ${news.companyColor}18; color: ${news.companyColor}">
                        ${news.companyName}
                    </span>
                    <span class="timeline-date">${news.date}</span>
                </div>
                <h4 class="timeline-title">${news.title}${syntheticBadge}</h4>
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

// 5. 回到頂部按鈕
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
