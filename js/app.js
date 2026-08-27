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
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    // 捲動時改變導覽列背景透明度
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Scroll spy
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
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
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 點擊連結平滑捲動
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active'); // 關閉手機選單
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
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
    const container = document.getElementById('company-cards-container');
    if (!container) return;

    container.innerHTML = '';
    
    COMPANIES.forEach((company, index) => {
        const card = document.createElement('div');
        card.className = 'company-card animate-on-scroll stagger-item';
        card.style.borderTopColor = company.color;
        
        const tagsHtml = company.products.map(p => `<span class="product-tag">${p}</span>`).join('');
        
        card.innerHTML = `
            <div class="company-header">
                <div class="company-title">
                    <h3 style="color: ${company.color}">${company.name}</h3>
                    <span class="stock-badge">${company.stock}</span>
                </div>
                <p class="en-name">${company.enName}</p>
            </div>
            <div class="company-body">
                <div class="info-row">
                    <span class="info-label">成立年份</span>
                    <span class="info-value">${company.founded}</span>
                </div>
                <p class="company-desc">${company.description}</p>
                <div class="products-container">
                    ${tagsHtml}
                </div>
                <div class="latest-news">
                    <strong>最新動態：</strong>
                    <p>${company.latestNews}</p>
                </div>
            </div>
            <div class="company-footer">
                <a href="${company.website}" target="_blank" class="btn-outline" style="border-color: ${company.color}; color: ${company.color}">官方網站</a>
                <button class="btn-primary view-details-btn" data-id="${company.id}" style="background-color: ${company.color}">詳細數據</button>
            </div>
        `;
        
        container.appendChild(card);
    });

    // 綁定詳細數據按鈕事件 (此處僅示意，實際可連結至Modal或展開內容)
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const companyId = e.target.getAttribute('data-id');
            const comp = COMPANIES.find(c => c.id === companyId);
            alert(`載入 ${comp.name} 詳細分析數據模組... (功能擴充點)`);
        });
    });
}

// 3. 初始化數據總覽
function initStatsOverview() {
    const totalCompanies = COMPANIES.length;
    const totalPressReleases = PRESS_RELEASES.length;
    let totalMediaCoverage = 0;

    Object.values(MONTHLY_STATS).forEach(companyStats => {
        companyStats.forEach(stat => {
            totalMediaCoverage += stat.mediaCoverage;
        });
    });

    const elCompanies = document.getElementById('stat-total-companies');
    const elPR = document.getElementById('stat-total-pr');
    const elMedia = document.getElementById('stat-total-media');

    if (elCompanies) elCompanies.setAttribute('data-target', totalCompanies);
    if (elPR) elPR.setAttribute('data-target', totalPressReleases);
    if (elMedia) elMedia.setAttribute('data-target', totalMediaCoverage);
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
