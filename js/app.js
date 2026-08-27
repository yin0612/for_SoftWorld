// 應用程式主要邏輯
document.addEventListener('DOMContentLoaded', () => {
    // 確保資料已載入
    if (typeof COMPANIES === 'undefined' || typeof PRESS_RELEASES === 'undefined') {
        console.error('Data not loaded. Make sure data.js is included before app.js');
        return;
    }

    initNavbar();
    renderCompanyCards();
    initStatsOverview();
    initNewsSection();
    initBackToTop();
});

// 1. 導覽列與捲動行為
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('navbarToggle');
    const navMenu = document.getElementById('navbarMenu');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.navbar-link');

    // 捲動時改變導覽列樣式與 Scroll spy 狀態
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        
        // Scroll spy
        let current = '';
        const scrollPosition = window.pageYOffset + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // 行動版選單切換
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // 點擊目錄連結平滑捲動到對應區塊
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (navMenu) navMenu.classList.remove('active'); // 關閉行動選單
                
                const headerOffset = 75; // 避開固定導覽列高度
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

// 2. 渲染公司卡片
function renderCompanyCards() {
    const container = document.getElementById('companyGrid');
    if (!container) return;

    container.innerHTML = '';
    
    COMPANIES.forEach((company, index) => {
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

    // 綁定詳細資訊彈窗按鈕
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

// 3. 初始化數據總覽
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

    if (elHeroPR) elHeroPR.setAttribute('data-target', totalPR);
    if (elNews) elNews.setAttribute('data-target', totalPR);
    if (elCoverage) elCoverage.setAttribute('data-target', totalCoverage);
    if (elSocial) elSocial.setAttribute('data-target', totalSocial);
    if (elKol) elKol.setAttribute('data-target', totalKol);
}

// 4. 新聞發布區塊與過濾邏輯
let currentNewsPage = 1;
const NEWS_PER_PAGE = 6;
let filteredNews = [];

function initNewsSection() {
    const container = document.getElementById('news-container');
    if (!container) return;

    // 建立過濾器 UI
    setupNewsFilters();
    
    // 初始載入
    filteredNews = [...PRESS_RELEASES];
    renderNews();

    // 載入更多按鈕
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentNewsPage++;
            renderNews(true);
        });
    }
}

function setupNewsFilters() {
    const filterContainer = document.getElementById('news-filters');
    if (!filterContainer) return;

    // 公司勾選框
    let companyFiltersHtml = '<div class="filter-group"><h4>公司</h4><div class="checkbox-group">';
    COMPANIES.forEach(comp => {
        companyFiltersHtml += `
            <label class="checkbox-label">
                <input type="checkbox" class="company-filter" value="${comp.id}" checked>
                <span class="custom-checkbox" style="border-color:${comp.color}"></span>
                ${comp.name}
            </label>
        `;
    });
    companyFiltersHtml += '</div></div>';

    // 類別下拉選單
    let categoryHtml = '<div class="filter-group"><h4>類別</h4><select id="category-filter"><option value="all">所有類別</option>';
    CATEGORIES.forEach(cat => {
        categoryHtml += `<option value="${cat}">${cat}</option>`;
    });
    categoryHtml += '</select></div>';

    // 關鍵字搜尋
    let searchHtml = `
        <div class="filter-group search-group">
            <input type="text" id="keyword-search" placeholder="搜尋標題或內容...">
            <button id="search-btn"><i class="fas fa-search"></i> 搜尋</button>
        </div>
    `;

    filterContainer.innerHTML = companyFiltersHtml + categoryHtml + searchHtml;

    // 綁定過濾事件
    document.querySelectorAll('.company-filter').forEach(cb => {
        cb.addEventListener('change', applyNewsFilters);
    });
    document.getElementById('category-filter').addEventListener('change', applyNewsFilters);
    document.getElementById('search-btn').addEventListener('click', applyNewsFilters);
    document.getElementById('keyword-search').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyNewsFilters();
    });
}

function applyNewsFilters() {
    // 取得選取的公司
    const selectedCompanies = Array.from(document.querySelectorAll('.company-filter:checked')).map(cb => cb.value);
    
    // 取得選取的類別
    const selectedCategory = document.getElementById('category-filter').value;
    
    // 取得搜尋關鍵字
    const keyword = document.getElementById('keyword-search').value.toLowerCase();

    // 過濾資料
    filteredNews = PRESS_RELEASES.filter(news => {
        const matchCompany = selectedCompanies.includes(news.companyId);
        const matchCategory = selectedCategory === 'all' || news.category === selectedCategory;
        const matchKeyword = keyword === '' || 
                             news.title.toLowerCase().includes(keyword) || 
                             news.excerpt.toLowerCase().includes(keyword);
        
        return matchCompany && matchCategory && matchKeyword;
    });

    currentNewsPage = 1;
    renderNews(false);
}

function renderNews(append = false) {
    const container = document.getElementById('news-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!container) return;

    if (!append) {
        container.innerHTML = '';
    }

    const startIndex = (currentNewsPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    const newsToShow = filteredNews.slice(startIndex, endIndex);

    if (filteredNews.length === 0) {
        container.innerHTML = '<div class="no-results">找不到符合條件的新聞稿。</div>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    newsToShow.forEach(news => {
        const card = document.createElement('div');
        card.className = 'news-card animate-on-scroll';
        
        card.innerHTML = `
            <div class="news-header">
                <span class="news-company-badge" style="background-color: ${news.companyColor}20; color: ${news.companyColor}">
                    ${news.companyName}
                </span>
                <span class="news-date">${news.date}</span>
            </div>
            <h4 class="news-title">${news.title}</h4>
            <p class="news-excerpt">${news.excerpt}</p>
            <div class="news-footer">
                <span class="news-category">${news.category}</span>
                <span class="news-source"><i class="fas fa-newspaper"></i> ${news.source}</span>
            </div>
        `;
        container.appendChild(card);
    });

    // 觸發新加入元素的動畫
    if (typeof initScrollAnimations === 'function') {
        // 小延遲確保 DOM 更新
        setTimeout(initScrollAnimations, 50);
    }

    // 處理載入更多按鈕顯示
    if (loadMoreBtn) {
        if (endIndex >= filteredNews.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
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
