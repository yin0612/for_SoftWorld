document.addEventListener('DOMContentLoaded', () => {
    // 確保資料已載入
    if (typeof COMPANIES === 'undefined') {
        console.error('Company data not loaded. Make sure data.js is included before app.js');
        return;
    }

    renderCompanyCards();
    initStatsOverview();
    initNewsSection();
    initFintechMonitoringPage();
    initGamingMonitoringPage();
    initTrendControls();
    renderRealTrends();
    initNavbar();
    initHashRouter();
    initBackToTop();
    initSkipLink();
});

// 1. Hash SPA 獨立切頁路由器 (點選目錄只顯示該項獨立頁面)
function initHashRouter() {
    const pages = ['companies', 'news', 'gaming', 'fintech', 'analytics', 'compare', 'trends', 'methodology'];

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
            const isActive = href.includes(targetPage);
            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
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
            if (targetPage === 'trends' && typeof renderRealTrends === 'function') {
                renderRealTrends();
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
    
    let currentIndustry = '';

    COMPANIES.forEach((company) => {
        const industry = company.industry || '遊戲與數位娛樂';
        if (industry !== currentIndustry) {
            currentIndustry = industry;
            const groupHeading = document.createElement('div');
            groupHeading.className = 'company-grid-heading';
            groupHeading.innerHTML = `<span class="company-grid-heading-icon">${industry === '金融支付' ? '💳' : '🎮'}</span><div><strong>${industry}${industry === '金融支付' ? '（大型業者）' : ''}</strong><span>以官方網站與即時監測新聞作為查核入口</span></div>`;
            container.appendChild(groupHeading);
        }

        const card = document.createElement('div');
        card.className = 'company-card animate-on-scroll is-visible';
        card.style.setProperty('--card-brand-color', company.brandColor || company.color);
        
        const productsList = company.products || company.keyProducts || [];
        const tagsHtml = productsList.map(p => `<span class="tag">${p}</span>`).join('');
        const newsText = company.latestNews || company.recentNews || '';
        const eventSourceUrl = safeHttpUrl(company.eventSourceUrl || company.newsUrl || company.mopsUrl);
        const eventSourceLabel = company.eventSourceLabel || (company.newsUrl ? '官方新聞專區' : 'MOPS 公開資訊觀測站');
        const metaItems = [company.enName || company.englishName];
        if (company.founded || company.foundingYear) metaItems.push(`成立 ${company.founded || company.foundingYear} 年`);
        metaItems.push(industry);
        const metaHtml = metaItems.filter(Boolean).map(item => `<span>${item}</span>`).join(' <span aria-hidden="true">•</span> ');
        const productLabel = company.productLabel || (industry === '金融支付' ? '主要支付服務：' : '核心代表作品：');
        const eventSummaryHtml = newsText ? `
            <div class="company-event-summary" style="border-left-color: ${company.brandColor || company.color};">
                <div class="company-event-heading">
                    <span style="font-weight: 700; color: ${company.brandColor || company.color};">近期重要事件</span>
                    <span class="data-type-badge data-type-curated">✎ 人工整理・待查核</span>
                </div>
                <span style="color: #475569; line-height: 1.5; display: block;">${newsText}</span>
                <span class="company-event-source">來源入口：<a href="${eventSourceUrl}" target="_blank" rel="noopener">${eventSourceLabel} ↗</a>｜最後查核：待補</span>
            </div>` : '';
        
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
                        ${metaHtml}
                    </div>
                </div>
                <span class="company-stock">${company.stock || company.stockTicker}</span>
            </div>
            <p class="company-desc">${company.description || company.desc}</p>
            <div style="margin-bottom: var(--spacing-sm);">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">${productLabel}</div>
                <div class="company-tags">${tagsHtml}</div>
            </div>
            ${eventSummaryHtml}
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
    const eventSourceUrl = safeHttpUrl(company.eventSourceUrl || company.newsUrl || company.mopsUrl);
    const eventSourceLabel = company.eventSourceLabel || (company.newsUrl ? '官方新聞專區' : 'MOPS 公開資訊觀測站');
    const industry = company.industry || '遊戲與數位娛樂';
    const productLabel = company.productLabel || (industry === '金融支付' ? '主要支付服務' : '主要代表作品');
    const newsText = company.latestNews || company.recentNews || '';

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
            <h4 style="font-size: 1rem; margin-bottom: 6px;">${productLabel}</h4>
            <div class="company-tags">${tagsHtml}</div>
        </div>
        ${newsText ? `
        <div class="company-event-summary" style="border-left-color: ${company.brandColor || company.color};">
            <div class="company-event-heading">
                <h4 style="font-size: 0.9rem; color: var(--primary); margin: 0;">近期重要事件</h4>
                <span class="data-type-badge data-type-curated">✎ 人工整理・待查核</span>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-primary);">${newsText}</p>
            <p class="company-event-source">來源入口：<a href="${eventSourceUrl}" target="_blank" rel="noopener">${eventSourceLabel} ↗</a>；請逐筆查核｜最後查核：待補</p>
        </div>` : ''}
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

// 輔助函式：取得各大媒體搜尋該公司新聞的實體 URL 超連結
function getMediaSearchUrl(mediaName, companyName) {
    const encodedName = encodeURIComponent(companyName);
    const searchUrls = {
        '經濟日報': `https://money.udn.com/search/result/1001/${encodedName}`,
        '天下雜誌': `https://www.cw.com.tw/search/doSearch.action?key=${encodedName}`,
        '數位時代': `https://www.bnext.com.tw/search?q=${encodedName}`,
        '鉅亨網': `https://news.cnyes.com/search?q=${encodedName}`,
        '巴哈姆特': `https://gnn.gamer.com.tw/search.php?kw=${encodedName}`,
        '4Gamers': `https://www.4gamers.com.tw/site/search?q=${encodedName}`,
        'Yahoo新聞': `https://news.search.yahoo.com/search?p=${encodedName}`,
        '聯合新聞網': `https://udn.com/search/word/2/${encodedName}`,
        'ETtoday': `https://www.ettoday.net/news_search/unicode_result.php?keyword=${encodedName}`,
        '工商時報': `https://www.ctee.com.tw/search?q=${encodedName}`,
        '社群媒體': `https://www.google.com/search?q=${encodedName}+site:facebook.com+OR+site:instagram.com`
    };
    return searchUrls[mediaName] || `https://www.google.com/search?q=${encodedName}+${encodeURIComponent(mediaName)}`;
}


// 3. 初始化真實監測數據總覽
function initStatsOverview() {
    updateRealStatsOverview([], null);
}

function initSkipLink() {
    const link = document.getElementById('skipToContent');
    if (!link || link.dataset.ready === 'true') return;
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const pages = ['companies', 'news', 'gaming', 'fintech', 'analytics', 'compare', 'trends', 'methodology'];
        const active = pages.map((id) => document.getElementById(id))
            .find((element) => element && window.getComputedStyle(element).display !== 'none');
        const target = active || document.getElementById('hero');
        if (!target) return;
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    link.dataset.ready = 'true';
}

function updateRealStatsOverview(articles = [], status = null) {
    const total = Array.isArray(articles) ? articles.length : 0;
    const official = Array.isArray(articles)
        ? articles.filter((article) => article.sourceKind !== 'google_news_rss').length
        : 0;
    const aggregated = Array.isArray(articles)
        ? articles.filter((article) => article.sourceKind === 'google_news_rss').length
        : 0;
    const statusSources = Number(status?.source_summary?.healthy || 0);
    const sourceCount = statusSources || new Set((articles || []).map((article) => article.source).filter(Boolean)).size;
    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.textContent = Number(value || 0).toLocaleString();
        element.setAttribute('data-target', String(value || 0));
    };
    setValue('statTotalNews', total);
    setValue('totalPressReleases', total);
    setValue('statOfficialRss', official);
    setValue('statAggregatedNews', aggregated);
    setValue('statVerifiedSources', sourceCount);
    const range = status?.article_range || monitoringLoadState?.range || getRollingMonitoringDateRange();
    const methodCompanies = document.getElementById('methodCompanies');
    const methodRange = document.getElementById('methodRange');
    if (methodCompanies) methodCompanies.textContent = String(COMPANIES.length);
    if (methodRange && range?.from && range?.to) methodRange.textContent = `${range.from} — ${range.to}`;
}

function initTrendControls() {
    const scopeControls = document.getElementById('trendScopeControls');
    const rangeControls = document.getElementById('trendRangeControls');
    if (scopeControls && !scopeControls.dataset.bound) {
        scopeControls.dataset.bound = 'true';
        scopeControls.querySelectorAll('[data-trend-scope]').forEach((button) => {
            button.addEventListener('click', () => {
                trendScope = button.dataset.trendScope || 'focus';
                renderRealTrends();
            });
        });
    }
    if (rangeControls && !rangeControls.dataset.bound) {
        rangeControls.dataset.bound = 'true';
        rangeControls.querySelectorAll('[data-trend-range]').forEach((button) => {
            button.addEventListener('click', () => {
                const days = Number(button.dataset.trendRange);
                trendRangeDays = [7, 30, 60].includes(days) ? days : 60;
                renderRealTrends();
            });
        });
    }
    updateTrendControls();
}

function updateTrendControls() {
    document.querySelectorAll('[data-trend-scope]').forEach((button) => {
        const active = button.dataset.trendScope === trendScope;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-trend-range]').forEach((button) => {
        const active = Number(button.dataset.trendRange) === trendRangeDays;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
}

function trendScopeLabel(scope = trendScope) {
    return ({
        focus: '遊戲與金融支付焦點',
        gaming: '遊戲焦點',
        payments: '金融支付焦點',
        stablecoin: '穩定幣焦點'
    })[scope] || '焦點事件';
}

function trendDateRange(articles) {
    const dates = articles.map((article) => String(article?.date || ''))
        .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
    const to = monitoringLoadState?.range?.to || dates[dates.length - 1] || '';
    if (!to) return { from: '', to: '' };
    const [year, month, day] = to.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, day));
    start.setUTCDate(start.getUTCDate() - trendRangeDays + 1);
    return { from: start.toISOString().slice(0, 10), to };
}

function trendArticleInScope(article, scope) {
    const folders = getMonitoringFoldersForArticle(article);
    const isGaming = articleHasAnyMonitoringRule(article, GAMING_RULE_IDS);
    const isPayment = folders.includes('folder_2') || folders.includes('folder_5');
    const isStablecoin = folders.includes('folder_6') || articleHasStablecoinRule(article);
    if (scope === 'gaming') return isGaming;
    if (scope === 'payments') return isPayment && !isStablecoin;
    if (scope === 'stablecoin') return isStablecoin;
    // 預設焦點不把穩定幣新聞混入支付事件；穩定幣有獨立範圍可閱讀。
    return isGaming || (isPayment && !isStablecoin);
}

function trendArticleDomain(article, scope = trendScope) {
    const folders = getMonitoringFoldersForArticle(article);
    const isStablecoin = folders.includes('folder_6') || articleHasStablecoinRule(article);
    const isGaming = articleHasAnyMonitoringRule(article, GAMING_RULE_IDS);
    const isPayment = folders.includes('folder_2') || folders.includes('folder_5');
    if (scope === 'stablecoin') return isStablecoin ? 'stablecoin' : '';
    if (scope === 'gaming') return isGaming ? 'gaming' : '';
    if (scope === 'payments') return isPayment ? 'payments' : '';
    if (isGaming) return 'gaming';
    if (isStablecoin) return 'stablecoin';
    if (isPayment) return 'payments';
    return '';
}

function trendTitleHasTerm(title, term) {
    const text = String(title || '');
    const query = String(term || '').trim();
    if (!text || !query) return false;
    // 英文品牌以完整單字／片語比對，避免 Block 命中 Blockchain、Stablecoin 命中 Stablecoins。
    if (/^[A-Za-z0-9][A-Za-z0-9 .&/:_-]*$/.test(query)) {
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(text);
    }
    return text.toLowerCase().includes(query.toLowerCase());
}

function trendMatchingTerms(article, terms) {
    // 焦點事件必須在標題直接點出監測對象，不能只因摘要深處的一句話就佔據焦點版面。
    const matches = [];
    [...new Set(terms.filter(Boolean))].forEach((term) => {
        if (!trendTitleHasTerm(article?.title, term)) return;
        const duplicateOfLongerMatch = matches.some((matched) => String(matched).toLowerCase().includes(String(term).toLowerCase()));
        if (!duplicateOfLongerMatch) matches.push(term);
    });
    return matches.slice(0, 3);
}

function trendGamingRuleTerms(article) {
    if (!Array.isArray(monitoringManifest?.rules)) return [];
    const ignored = new Set(['遊戲', '玩家', 'ip', 'ip授權', '成長', 'line', 'google', 'ar', '放置', '任務', '競技']);
    const ruleIds = new Set(getMonitoringRuleIdsForArticle(article));
    return [...new Set(monitoringManifest.rules
        .filter((rule) => ruleIds.has(rule.id) && GAMING_RULE_IDS.has(rule.id))
        .flatMap((rule) => (rule.required_any_groups || []).flat())
        .map((term) => String(term || '').trim())
        .filter((term) => term.length > 1 && !ignored.has(term.toLowerCase())))];
}

function trendEventType(title) {
    // 「招募資訊」含有「募資」字面，先排除招聘語境以免誤判為融資事件。
    const value = String(title || '').replace(/(?:人才)?招募資訊|招募職缺|徵才(?:資訊|職缺)?/gi, '');
    const types = [
        { label: '風險／資安', score: 34, pattern: /資安|外洩|駭客|攻擊|中斷|異常|停業|清算|倒閉|詐騙|洗錢|裁罰|罰款|fraud|breach|outage|hack/i },
        { label: '監理／法規', score: 32, pattern: /金管會|金融監督|央行|中央銀行|主管機關|監理|監管|法規|修法|牌照|執照|核准|\bsec\b|\bocc\b|regulat|license|approval|\bact\b/i },
        { label: '投資／併購', score: 30, pattern: /併購|收購|入股|投資|募資|融資|增資|股權|併入|acquir|funding|raises?\b|investment/i },
        { label: '財務／營運', score: 26, pattern: /財報|營收|獲利|虧損|法說|掛牌|上櫃|營運|銷售|\b(?:revenue|earnings|profit|ipo)\b/i },
        { label: '市場／排行', score: 18, pattern: /排行|排名|營收榜|下載量|下載(?:突破|破|達|逾|超|數)|玩家數|市占|market share|ranking|downloads?\s*(?:surpass|million|billion|reaches?|tops?)/i },
        { label: '策略／合作', score: 22, pattern: /策略合作|結盟|簽署|攜手|partner(ship)?|alliance/i },
        { label: '產品／上線', score: 15, pattern: /正式上線|上線|推出|發表|開賣|上市|改版|更新|release|launch|rollout/i }
    ];
    return types.find((type) => type.pattern.test(value)) || null;
}

function trendLowSignalTitle(title) {
    return /免費|不用花錢|贈品|贈送|好禮|回饋|優惠|折扣|最高折|折\d|抽獎|刷卡禮|慶典|活動上線|聯名合作|預先下載|預下載|事前預約|預約活動|開服活動|週年活動|直播|聯動|舉辦.*(?:大會|論壇|研討)|備份方法|功能關閉|攻略|試玩|評測|開箱/i.test(String(title || ''));
}

function trendRoundupTitle(title) {
    return /科技早餐|今晨國際頭條|一次看|早報|晨報|懶人包/i.test(String(title || ''));
}

function trendRoutineGameTitle(title) {
    return /改版|演唱會|見面會|\b(?:GO\s*)?Fest\b|週年|周年|票價|座位圖|合作活動|限定活動|特別活動|主線|劇情|終章/i.test(String(title || ''));
}

function trendHasStablecoinTitleReference(title) {
    const value = String(title || '');
    return /穩定幣|奧丁丁|\b(?:stablecoins?|owlpay|tether|usdt|usdc|pyusd|rlusd)\b/i.test(value);
}

function trendEntityLabels(article, domain) {
    const paymentTerms = ['藍新科技', '藍新金流', 'NewebPay', 'LINE Pay Money', 'LINE Pay', 'LINE Bank', '彈性付', '街口支付', '街口電子支付', '全支付', '全盈支付', '綠界', 'ECPay', '紅陽', 'SunPay', '台灣Pay', '悠遊付', 'iPASS MONEY', '聯卡中心', '財金公司', '金管會', '中央銀行', '央行', 'TWQR', 'Visa', 'Mastercard', 'PayPal', 'Stripe', 'Block', 'Square', 'Adyen'];
    const gameTerms = ['智冠', '中華網龍', '網龍', 'MyCard', '遊戲新幹線', '大宇', '橘子', 'Gamania', '華義', '鈊象', '宇峻', '歐買尬', '傳奇', '網銀國際', 'Wanin', 'Garena', 'NEXON', '騰訊', '網易', '任天堂', 'Steam', 'PlayStation', 'Xbox', '天堂M', '星城', '神魔之塔', '傳說對決', 'Kingshot', 'Roblox', '皮克敏', 'Fate'];
    const stablecoinTerms = ['奧丁丁', 'OwlPay', 'Tether', 'USDT', 'USDC', 'PYUSD', 'RLUSD', '穩定幣', 'Stablecoin'];
    const terms = domain === 'gaming'
        ? [...gameTerms, ...trendGamingRuleTerms(article)]
        : domain === 'payments' ? paymentTerms : stablecoinTerms;
    const matches = trendMatchingTerms(article, terms);
    if (matches.length) return matches;
    const ruleIds = getMonitoringRuleIdsForArticle(article);
    if (domain === 'gaming') {
        if (ruleIds.some((id) => ['mobile-top-grossing-games', 'mobile-game-watchlist', 'mobile-game-context-watchlist'].includes(id))) return ['重點手遊'];
        if (ruleIds.some((id) => ['softworld-brand', 'softworld-games', 'softworld-ip'].includes(id))) return ['智冠集團'];
        if (ruleIds.some((id) => id.startsWith('competitor-'))) return ['遊戲競業'];
        return ['遊戲產業'];
    }
    if (domain === 'payments') return getMonitoringFoldersForArticle(article).includes('folder_2') ? ['台灣支付'] : ['國際支付'];
    return ['穩定幣'];
}

function trendCandidate(article, rangeEnd, scope = trendScope) {
    const domain = trendArticleDomain(article, scope);
    if (!domain) return null;
    const title = String(article.title || '');
    const event = trendEventType(title);
    const entities = trendEntityLabels(article, domain);
    const ruleIds = getMonitoringRuleIdsForArticle(article);
    const genericGamingEntities = new Set(['遊戲競業', '遊戲產業', '重點手遊', '智冠集團', 'Steam', 'PlayStation', 'Xbox']);
    const hasDirectGamingEntity = entities.some((entity) => !genericGamingEntities.has(entity));
    const hasTargetGamingRule = ruleIds.some((id) => [
        'softworld-brand', 'softworld-games', 'softworld-ip', 'competitor-brand',
        'competitor-tw-game', 'competitor-global-game', 'mobile-top-grossing-games',
        'mobile-game-watchlist', 'mobile-game-context-watchlist'
    ].includes(id));
    const isPriorityGaming = ruleIds.some((id) => [
        'softworld-brand', 'softworld-games', 'softworld-ip', 'mobile-top-grossing-games',
        'mobile-game-watchlist'
    ].includes(id));
    const isDirectGaming = hasDirectGamingEntity && hasTargetGamingRule;
    const isDomesticPayment = getMonitoringFoldersForArticle(article).includes('folder_2');
    const isDirectPayment = domain === 'payments' && (entities[0] !== '台灣支付' && entities[0] !== '國際支付');
    const isPaymentAuthority = domain === 'payments' && ['金管會', '中央銀行', '央行', '聯卡中心', '財金公司'].some((term) => entities.includes(term));
    const isSpecificStablecoin = domain === 'stablecoin' && entities.some((entity) => !['穩定幣', 'Stablecoin'].includes(entity));
    const isOwlPayPriority = domain === 'stablecoin' && isOwlPayPriorityArticle(article);
    const routineGame = domain === 'gaming' && trendRoutineGameTitle(title);
    const isOfficialRss = article.sourceKind !== 'google_news_rss';
    let score = event ? event.score : 0;
    if (domain === 'gaming') score += isPriorityGaming && isDirectGaming ? 26 : isDirectGaming ? 16 : 8;
    if (domain === 'payments') score += isDirectPayment ? 26 : isDomesticPayment ? 20 : 12;
    if (domain === 'stablecoin') score += isSpecificStablecoin ? 20 : 14;
    if (isDomesticPayment) score += 6;
    if (isOwlPayPriority) score += 40;
    if (isOfficialRss) score += 6;
    if (ruleIds.length > 1) score += 3;
    const published = String(article.date || '');
    const daysOld = rangeEnd && published ? Math.max(0, Math.round((Date.parse(`${rangeEnd}T00:00:00Z`) - Date.parse(`${published}T00:00:00Z`)) / 86400000)) : 60;
    score += Math.max(0, 10 - Math.floor(daysOld / 7));
    const lowSignal = trendLowSignalTitle(title);
    if (lowSignal) score -= 34;
    if (routineGame) score -= 34;
    if (trendRoundupTitle(title)) score -= 38;
    if (domain === 'gaming' && event?.label === '產品／上線' && !(isPriorityGaming && isDirectGaming)) score -= 12;
    if (domain === 'payments' && !isDomesticPayment && !isDirectPayment) score -= 8;
    const threshold = domain === 'stablecoin' ? 48 : 46;
    const hasDirectTarget = domain === 'gaming'
        ? isDirectGaming
        : domain === 'payments'
            ? (isDirectPayment || isPaymentAuthority)
            : (trendHasStablecoinTitleReference(title) && (isSpecificStablecoin || event?.label === '監理／法規'));
    return {
        article,
        domain,
        event,
        entities,
        score,
        lowSignal,
        focal: Boolean(event) && hasDirectTarget && !lowSignal && !routineGame && !trendRoundupTitle(title) && score >= threshold
    };
}

function normalizedTrendTitle(value) {
    return String(value || '').toLowerCase()
        .replace(/\s*[|｜]\s*[^|｜]+$/, '')
        .replace(/\s+-\s+[^-]+$/, '')
        .replace(/[^\p{L}\p{N}]+/gu, '');
}

function trendTitlesSimilar(left, right) {
    const a = normalizedTrendTitle(left);
    const b = normalizedTrendTitle(right);
    if (!a || !b) return false;
    if (a === b || a.includes(b) || b.includes(a)) return true;
    let prefix = 0;
    while (prefix < Math.min(a.length, b.length) && a[prefix] === b[prefix]) prefix += 1;
    if (prefix >= 12) return true;
    const grams = (value) => {
        const set = new Set();
        for (let index = 0; index < value.length - 1; index += 1) set.add(value.slice(index, index + 2));
        return set;
    };
    const aGrams = grams(a);
    const bGrams = grams(b);
    const overlap = [...aGrams].filter((term) => bGrams.has(term)).length;
    const union = new Set([...aGrams, ...bGrams]).size;
    return union > 0 && overlap / union >= 0.62;
}

function trendDatesClose(left, right) {
    const leftTime = Date.parse(`${String(left || '')}T00:00:00Z`);
    const rightTime = Date.parse(`${String(right || '')}T00:00:00Z`);
    return Number.isFinite(leftTime) && Number.isFinite(rightTime) && Math.abs(leftTime - rightTime) <= 3 * 86400000;
}

function trendCandidateSort(left, right, order = 'score') {
    const leftDate = String(left.article.date || '');
    const rightDate = String(right.article.date || '');
    if (order === 'recent') {
        return rightDate.localeCompare(leftDate) || right.score - left.score;
    }
    return right.score - left.score || rightDate.localeCompare(leftDate);
}

function trendArticleKey(article) {
    return String(article?.url || `${article?.source || ''}|${article?.date || ''}|${article?.title || ''}`);
}

function trendSpecificEntityKeys(candidate) {
    const generic = new Set(['台灣支付', '國際支付', '遊戲競業', '遊戲產業', '重點手遊', '智冠集團', '穩定幣', 'stablecoin']);
    return new Set((candidate?.entities || [])
        .map((entity) => String(entity || '').trim())
        .filter((entity) => entity && !generic.has(entity.toLowerCase()))
        .map((entity) => entity.toLowerCase()));
}

function trendCandidatesDescribeSameEvent(left, right) {
    if (left.domain !== right.domain || !trendDatesClose(left.article.date, right.article.date)) return false;
    if (trendTitlesSimilar(left.article.title, right.article.title)) return true;
    if (!left.event?.label || left.event.label !== right.event?.label) return false;
    const leftEntities = trendSpecificEntityKeys(left);
    const rightEntities = trendSpecificEntityKeys(right);
    return [...leftEntities].some((entity) => rightEntities.has(entity));
}

function clusterTrendCandidates(candidates, order = 'score') {
    const clusters = [];
    [...candidates].sort((left, right) => trendCandidateSort(left, right, order))
        .slice(0, 120).forEach((candidate) => {
            const cluster = clusters.find((item) => trendCandidatesDescribeSameEvent(item.primary, candidate));
            if (cluster) {
                cluster.items.push(candidate);
                if (trendCandidateSort(candidate, cluster.primary, order) < 0) cluster.primary = candidate;
                return;
            }
            clusters.push({ domain: candidate.domain, primary: candidate, items: [candidate] });
        });
    return clusters.map((cluster) => ({
        ...cluster,
        sourceCount: new Set(cluster.items.map((item) => item.article.source).filter(Boolean)).size,
        articleIds: new Set(cluster.items.map((item) => trendArticleKey(item.article)))
    })).sort((left, right) => trendCandidateSort(left.primary, right.primary, order));
}

function trendClusterIsDomesticPayment(cluster) {
    return cluster?.domain === 'payments' && getMonitoringFoldersForArticle(cluster.primary.article).includes('folder_2');
}

function selectDiverseTrendClusters(clusters, limit, { domesticQuota = 0 } = {}) {
    const ordered = [...clusters].sort((left, right) => trendCandidateSort(left.primary, right.primary));
    const selected = [];
    const selectedKeys = new Set();
    const selectedArticles = new Set();
    const add = (cluster, allowRepeatedEntity = false) => {
        if (selected.length >= limit || selectedArticles.has(trendArticleKey(cluster.primary.article))) return false;
        const entityKeys = trendSpecificEntityKeys(cluster.primary);
        if (!allowRepeatedEntity && [...entityKeys].some((key) => selectedKeys.has(key))) return false;
        selected.push(cluster);
        selectedArticles.add(trendArticleKey(cluster.primary.article));
        entityKeys.forEach((key) => selectedKeys.add(key));
        return true;
    };
    if (domesticQuota > 0) {
        ordered.filter(trendClusterIsDomesticPayment).forEach((cluster) => {
            if (selected.filter(trendClusterIsDomesticPayment).length < domesticQuota) add(cluster);
        });
    }
    ordered.forEach((cluster) => add(cluster));
    return selected;
}

function selectTrendClusters(clusters, scope) {
    if (scope === 'gaming' || scope === 'stablecoin') return selectDiverseTrendClusters(clusters, 8);
    if (scope === 'payments') return selectDiverseTrendClusters(clusters, 8, { domesticQuota: 2 });
    const gaming = selectDiverseTrendClusters(clusters.filter((cluster) => cluster.domain === 'gaming'), 4);
    const payments = selectDiverseTrendClusters(clusters.filter((cluster) => cluster.domain === 'payments'), 4, { domesticQuota: 2 });
    return [...gaming, ...payments].sort((left, right) => right.primary.score - left.primary.score
        || String(right.primary.article.date || '').localeCompare(String(left.primary.article.date || ''))).slice(0, 8);
}

function trendDomainLabel(domain) {
    return ({ gaming: '遊戲', payments: '金融支付', stablecoin: '穩定幣' })[domain] || '焦點';
}

function trendReason(candidate, sourceCount) {
    const parts = [trendDomainLabel(candidate.domain)];
    if (candidate.entities.length) parts.push(candidate.entities.join('、'));
    if (candidate.event?.label) parts.push(candidate.event.label);
    if (sourceCount > 1) parts.push(`${sourceCount} 個來源`);
    return parts.join('｜');
}

function renderTrendSummary(summary, clusters, articles, range) {
    const countByDomain = (domain) => clusters.filter((cluster) => cluster.domain === domain).length;
    const cards = trendScope === 'focus'
        ? [
            ['🎮', '遊戲焦點', countByDomain('gaming'), '符合具名遊戲／作品與事件條件'],
            ['💳', '金融支付', countByDomain('payments'), '符合支付業者、監理或商業事件條件'],
            ['🗓️', '資料期間', `${trendRangeDays} 日`, range.from && range.to ? `${range.from} 至 ${range.to}` : '依真實資料更新']
        ]
        : [
            ['🎯', trendScopeLabel(), clusters.length, '符合焦點事件條件'],
            ['📰', '相關快訊', Math.max(0, articles.length - clusters.reduce((total, cluster) => total + cluster.items.length, 0)), '不與焦點事件混排'],
            ['🗓️', '資料期間', `${trendRangeDays} 日`, range.from && range.to ? `${range.from} 至 ${range.to}` : '依真實資料更新']
        ];
    summary.innerHTML = cards.map(([icon, title, value, detail]) => `
        <article class="trend-card trend-summary-card">
            <div class="trend-card-icon" aria-hidden="true">${icon}</div>
            <h4 class="trend-card-title">${escapeHtml(String(title))}</h4>
            <p class="trend-summary-value">${escapeHtml(String(value))}</p>
            <p class="trend-card-desc">${escapeHtml(String(detail))}</p>
        </article>
    `).join('');
}

function renderTrendEventItem(cluster) {
    const candidate = cluster.primary;
    const article = candidate.article;
    const tags = candidate.entities.map((entity) => `<span class="trend-event-tag">${escapeHtml(entity)}</span>`).join('');
    const sourceNote = cluster.sourceCount > 1 ? `｜同題材 ${cluster.sourceCount} 個來源` : '';
    return `
        <article class="trend-event-item" data-trend-domain="${escapeHtml(candidate.domain)}">
            <div class="trend-event-topline">
                <span class="trend-domain-badge">${escapeHtml(trendDomainLabel(candidate.domain))}</span>
                <span class="trend-type-badge">${escapeHtml(candidate.event?.label || '重要動態')}</span>
                <time class="trend-event-date" datetime="${escapeHtml(article.date || '')}">${escapeHtml(article.date || '日期待確認')}</time>
            </div>
            <h4><a href="${escapeHtml(safeHttpUrl(article.url))}" target="_blank" rel="noopener">${escapeHtml(article.title || '未命名新聞')} ↗</a></h4>
            <p class="trend-event-reason"><strong>入選依據：</strong>${escapeHtml(trendReason(candidate, cluster.sourceCount))}</p>
            ${tags ? `<div class="trend-event-tags">${tags}</div>` : ''}
            <p class="trend-event-source">${escapeHtml(article.source || '來源待確認')}｜${escapeHtml(article.verificationLabel || '已驗證監測')}${sourceNote}</p>
        </article>
    `;
}

function renderTrendRelatedItem(cluster) {
    const candidate = cluster.primary;
    const article = candidate.article;
    const sourceNote = cluster.sourceCount > 1 ? `｜同題材 ${cluster.sourceCount} 個來源` : '';
    const signal = [trendDomainLabel(candidate.domain), candidate.event?.label].filter(Boolean).join('｜');
    return `
        <div class="event-item trend-related-item">
            <div class="event-date">${escapeHtml(article.date || '日期待確認')}</div>
            <div class="event-content">
                <h4><a href="${escapeHtml(safeHttpUrl(article.url))}" target="_blank" rel="noopener">${escapeHtml(article.title || '未命名新聞')} ↗</a></h4>
                <p>${escapeHtml(article.source || '來源待確認')}｜${escapeHtml(article.verificationLabel || '已驗證監測')}｜${escapeHtml(signal)}${escapeHtml(sourceNote)}</p>
            </div>
        </div>
    `;
}

function renderRealTrends() {
    const summary = document.getElementById('trendsSummary');
    const timeline = document.getElementById('trendsTimeline');
    const related = document.getElementById('trendsRelated');
    const relatedSummary = document.getElementById('trendsRelatedSummary');
    const relatedList = document.getElementById('trendsRelatedList');
    const note = document.getElementById('trendsFocusNote');
    const title = document.getElementById('trendsTimelineTitle');
    const meta = document.getElementById('trendsTimelineMeta');
    if (!summary || !timeline) return;
    updateTrendControls();
    const articles = typeof monitoringNews !== 'undefined' && Array.isArray(monitoringNews) ? monitoringNews : [];
    if (!articles.length) {
        const waiting = monitoringDataMode === 'loading';
        if (note) note.textContent = waiting ? '正在讀取已驗證的真實新聞資料。' : '資料服務暫時無法驗證，頁面不會以展示資料替代。';
        summary.innerHTML = `<p class="method-muted">${waiting ? '正在整理遊戲與金融支付焦點。' : '目前沒有可公開的真實新聞資料。'}</p>`;
        timeline.innerHTML = `<p class="method-muted">${waiting ? '資料載入完成後，將只顯示符合焦點條件的事件。' : '請稍後重新整理，或確認資料服務狀態。'}</p>`;
        if (related) related.hidden = true;
        return;
    }
    const range = trendDateRange(articles);
    const inRange = articles.filter((article) => !range.from || (String(article.date || '') >= range.from && String(article.date || '') <= range.to));
    const scopedArticles = inRange.filter((article) => trendArticleInScope(article, trendScope));
    const candidates = scopedArticles.map((article) => trendCandidate(article, range.to, trendScope)).filter(Boolean);
    const focalCandidates = candidates.filter((candidate) => candidate.focal);
    const allClusters = clusterTrendCandidates(focalCandidates);
    const selectedClusters = selectTrendClusters(allClusters, trendScope);
    const selectedArticleIds = new Set(selectedClusters.flatMap((cluster) => [...cluster.articleIds]));
    const relatedClusters = clusterTrendCandidates(
        candidates.filter((candidate) => !selectedArticleIds.has(trendArticleKey(candidate.article))),
        'recent'
    ).slice(0, 8);
    renderTrendSummary(summary, allClusters, scopedArticles, range);
    if (note) note.textContent = '焦點僅採用具名監測對象與事件類型（監理、投資／併購、財務、合作、上線、風險等）；一般快訊已收合，穩定幣可切換至獨立範圍。';
    if (title) title.textContent = trendScopeLabel();
    if (meta) meta.textContent = `${selectedClusters.length} 則焦點事件｜${range.from} 至 ${range.to}`;
    timeline.innerHTML = selectedClusters.length
        ? selectedClusters.map(renderTrendEventItem).join('')
        : '<p class="method-muted">這段期間尚無符合焦點條件的事件；相關監測快訊仍可展開閱讀。</p>';
    if (related && relatedSummary && relatedList) {
        related.hidden = relatedClusters.length === 0;
        relatedSummary.textContent = `相關快訊（${relatedClusters.length} 則，已收合）`;
        relatedList.innerHTML = relatedClusters.map(renderTrendRelatedItem).join('');
    }
}

// 4. 新聞發布區塊與過濾邏輯
let currentNewsPage = 1;
const NEWS_PER_PAGE = 8;
let filteredNews = [];
// 真實監測資料與 data.js 的既有展示/分析資料分離，避免互相污染。
let monitoringNews = [];
let currentHuikeFolderId = '';
let activeHuikeKeyword = '';
let monitoringManifest = null;
let monitoringRuntimeStatus = null;
let monitoringLoadState = null;
let monitoringDataMode = 'loading';
// 趨勢頁的預設焦點只涵蓋遊戲與金融支付；穩定幣保留獨立範圍，避免大量加密新聞淹沒支付事件。
let trendScope = 'focus';
let trendRangeDays = 60;
// 國內支付是此頁主要監測目的；首次進入與清除篩選都回到台灣支付視圖。
let fintechMode = 'taiwan';
let fintechPage = 1;
const FINTECH_PER_PAGE = 12;
const FINTECH_FOLDER_IDS = new Set(['folder_2', 'folder_5', 'folder_6']);
const SOFTWORLD_FINTECH_RULE_IDS = new Set(['softworld-fintech-services']);
const TAIWAN_PAYMENT_PEER_RULE_IDS = new Set(['taiwan-payment-peer-oen']);
let gamingMode = 'all';
let gamingPage = 1;
const GAMING_PER_PAGE = 12;
const GAMING_MODE_RULE_IDS = {
    softworld: new Set(['softworld-brand', 'softworld-games', 'softworld-ip']),
    competitor: new Set(['competitor-tw-game', 'competitor-global-game']),
    mobile: new Set(['mobile-top-grossing-games', 'mobile-game-watchlist', 'mobile-game-context-watchlist']),
    platform: new Set(['industry-game-platform'])
};
const GAMING_RULE_IDS = new Set([
    ...GAMING_MODE_RULE_IDS.softworld,
    ...GAMING_MODE_RULE_IDS.competitor,
    ...GAMING_MODE_RULE_IDS.mobile,
    ...GAMING_MODE_RULE_IDS.platform
]);
const STABLECOIN_RULE_IDS = new Set(['stablecoin-core', 'stablecoin-settlement', 'stablecoin-brand']);
const STABLECOIN_PRIORITY_TERMS = ['奧丁丁', 'OwlPay'];
const STABLECOIN_TERM_GROUPS = [
    { label: '穩定幣類別', terms: ['穩定幣', 'stablecoin', 'stable coin'] },
    { label: '穩定幣資產', terms: ['USDT', 'USDC', 'USDe', 'PYUSD', 'RLUSD', 'FDUSD', 'EURC', 'USDG', 'GUSD'] },
    { label: '發行與結算', terms: ['Tether', '鏈上結算', '鏈上支付', '代幣化存款', '代幣化貨幣', 'tokenized deposit', 'tokenized deposits', 'stablecoin settlement', 'stablecoin payment', 'stablecoin payments'] },
    { label: '奧丁丁／OwlPay 優先', terms: STABLECOIN_PRIORITY_TERMS }
];

function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
}

function safeHttpUrl(value) {
    try {
        const url = new URL(value);
        return /^https?:$/.test(url.protocol) ? url.toString() : '#';
    } catch (_) {
        return '#';
    }
}

function safeCssColor(value) {
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value || '')) ? value : '#0f766e';
}

function setNewsDataMode(mode) {
    monitoringDataMode = mode;
    const resultEl = document.getElementById('filterResultCount');
    if (resultEl) resultEl.dataset.dataMode = mode;
    renderGlobalDataStatusBar();
}

function formatMonitoringTimestamp(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date).replace(/\//g, '-');
}

function renderGlobalDataStatusBar() {
    const statusText = document.getElementById('siteDataStatusText');
    if (!statusText) return;
    const range = monitoringLoadState?.range || getRollingMonitoringDateRange();
    const lastRun = formatMonitoringTimestamp(monitoringRuntimeStatus?.latest_run?.finished_at);
    const sources = Number(monitoringRuntimeStatus?.source_summary?.healthy || 0);
    const enabledSources = Array.isArray(monitoringRuntimeStatus?.enabled_sources)
        ? monitoringRuntimeStatus.enabled_sources
        : [];
    const healthyTaiwanNames = enabledSources
        .filter((source) => source?.region === 'TW' && source?.health_status === 'healthy')
        .map((source) => source.name)
        .filter(Boolean);
    const liveSourceNames = Array.isArray(monitoringRuntimeStatus?.live_fallback_sources)
        ? monitoringRuntimeStatus.live_fallback_sources
        : [];
    const enabledSourceNames = new Set(enabledSources.map((source) => source?.name).filter(Boolean));
    const taiwanSources = new Set([
        ...healthyTaiwanNames,
        ...liveSourceNames.filter((name) => !enabledSourceNames.has(name))
    ]).size;
    const liveSourceCount = Number(monitoringRuntimeStatus?.live_fallback_source_count || liveSourceNames.length || 0);
    const liveFallback = Number(monitoringLoadState?.officialLiveFallbackCount || 0);
    const aggregatedSourceCount = Number(monitoringRuntimeStatus?.aggregated_source_count || 0);
    const aggregatedCount = Number(monitoringLoadState?.aggregatedCount || 0);
    if (monitoringDataMode === 'verified') {
        const updated = lastRun ? `最後成功更新 ${lastRun}（台北時間）` : '最後成功更新時間待服務回報';
        const liveSourceText = liveSourceCount ? `；台灣即時補位來源設定 ${liveSourceCount} 個` : '';
        const liveText = liveFallback ? `；新增台灣來源即時補位 ${liveFallback} 篇` : '';
        const aggregatedText = aggregatedSourceCount ? `；Google News RSS 聚合來源 ${aggregatedSourceCount} 個、目前 ${aggregatedCount} 篇` : '';
        statusText.textContent = `真實新聞：${range.from} 至 ${range.to}｜官方 RSS ${sources} 個（台灣 ${taiwanSources} 個）｜${updated}${liveSourceText}${aggregatedText}${liveText}`;
    } else if (monitoringDataMode === 'loading') {
        statusText.textContent = '真實新聞：正在確認官方 RSS、Google News RSS 聚合來源與近兩個月資料。';
    } else {
        statusText.textContent = '真實新聞服務目前無法驗證；頁面不會以其他資料補足結果。';
    }
}

function setVerifiedNewsTotal(total) {
    ['totalPressReleases', 'statTotalNews'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = Number(total || 0).toLocaleString();
            element.setAttribute('data-target', total || 0);
        }
    });
}

function setVerifiedMonitoringSourceTotal(status) {
    const element = document.getElementById('totalChannels');
    if (!element) return;
    const healthySources = Number(status?.source_summary?.healthy || 0);
    const configuredLiveNames = Array.isArray(status?.live_fallback_sources) ? status.live_fallback_sources : [];
    const configuredNames = new Set((status?.enabled_sources || []).map((source) => source?.name).filter(Boolean));
    const unseededLiveSources = configuredLiveNames.filter((name) => !configuredNames.has(name)).length;
    const visibleSources = healthySources + unseededLiveSources;
    element.textContent = visibleSources.toLocaleString();
    element.setAttribute('data-target', visibleSources);
    const overviewSource = document.getElementById('statVerifiedSources');
    if (overviewSource) {
        overviewSource.textContent = visibleSources.toLocaleString();
        overviewSource.setAttribute('data-target', String(visibleSources));
    }
}

function hydrateMonitoringManifest(manifest) {
    if (!manifest || !Array.isArray(manifest.rules) || !Array.isArray(manifest.folders)) return;
    monitoringManifest = manifest;
    const ruleGroups = document.getElementById('totalRuleGroups');
    if (ruleGroups) {
        ruleGroups.textContent = manifest.folders.length.toLocaleString();
        ruleGroups.setAttribute('data-target', manifest.folders.length);
    }
    const rulesByFolder = new Map();
    manifest.rules.forEach((rule) => {
        const terms = (rule.required_any_groups || []).flat();
        const existing = rulesByFolder.get(rule.folder_id) || [];
        rulesByFolder.set(rule.folder_id, [...existing, ...terms]);
    });

    HUIKE_2025_STRUCTURE.forEach((folder, index) => {
        const sourceFolder = manifest.folders.find((entry) => entry.id === folder.id);
        const exactKeywords = [...new Set(rulesByFolder.get(folder.id) || [])];
        const ruleCount = manifest.rules.filter((rule) => rule.folder_id === folder.id).length;
        const originalQuickKeywords = folder.suggestedKeywords || folder.keywords || [];
        const canonicalKeywords = new Map();
        exactKeywords.forEach((keyword) => {
            const normalized = normalizeMonitoringKeyword(keyword);
            if (normalized && !canonicalKeywords.has(normalized)) canonicalKeywords.set(normalized, keyword);
        });
        const quickKeywords = originalQuickKeywords
            .map((keyword) => {
                const canonicalKeyword = canonicalKeywords.get(normalizeMonitoringKeyword(keyword));
                // 若配置本身已有此拼寫，保留資料清單較易讀的大小寫與標點。
                return canonicalKeyword ? (exactKeywords.includes(keyword) ? keyword : canonicalKeyword) : '';
            })
            .filter(Boolean);

        // 保留 data.js 的人工排序做為快速篩選，同時以 manifest 的實際詞彙補足。
        // 不直接覆寫 keywords，完整清單仍可精確對照監測規則。
        folder.suggestedKeywords = [...originalQuickKeywords];
        folder.quickKeywords = [...new Set([...quickKeywords, ...exactKeywords])].slice(0, 24);
        folder.allKeywords = exactKeywords;
        folder.ruleCount = ruleCount;
        folder.baseDesc = folder.baseDesc || folder.desc;
        if (sourceFolder) {
            folder.folderName = `${index + 1}. ${sourceFolder.name}`;
        }
        const description = sourceFolder?.description || folder.baseDesc || '';
        folder.desc = `${description}。完整規則 ${ruleCount} 組、條件詞 ${exactKeywords.length} 個`;
    });
    renderMonitoringTransparency();
    renderHuikeChips();
}

function normalizeMonitoringKeyword(value) {
    return String(value || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\s:：/／]+/g, '');
}

function getManifestRulesForFolder(folderId) {
    if (!Array.isArray(monitoringManifest?.rules)) return [];
    return monitoringManifest.rules.filter((rule) => rule.folder_id === folderId);
}

function getRuleTerms(rules) {
    return [...new Set(rules.flatMap((rule) => (rule.required_any_groups || []).flat()).filter(Boolean))];
}

function renderMonitoringTransparency() {
    const panel = document.getElementById('monitoringTransparency');
    if (!panel) return;
    const previousDisclosure = panel.querySelector('details[data-monitoring-disclosure]');
    const wasOpen = Boolean(previousDisclosure?.open);
    panel.innerHTML = '';

    const disclosure = document.createElement('details');
    disclosure.dataset.monitoringDisclosure = 'true';
    disclosure.open = wasOpen;
    const disclosureToggle = document.createElement('summary');
    disclosureToggle.className = 'monitoring-disclosure-toggle';
    disclosureToggle.textContent = '資料來源與監測狀態';
    const disclosureContent = document.createElement('div');
    disclosureContent.className = 'monitoring-disclosure-content';
    disclosure.append(disclosureToggle, disclosureContent);
    panel.appendChild(disclosure);

    const summary = document.createElement('p');
    summary.style.cssText = 'margin:0; font-size:0.86rem; line-height:1.6; color:#334155;';
    const sources = monitoringRuntimeStatus?.source_summary || {};
    const articles = monitoringRuntimeStatus?.article_summary || {};
    const catalog = monitoringRuntimeStatus?.media_catalog_summary || {};
    const loadText = monitoringLoadState && !monitoringLoadState.complete
        ? ` 公開結果目前僅完整載入 ${monitoringLoadState.loaded}/${monitoringLoadState.total} 篇，請重新整理後再確認。`
        : '';
    const liveFallbackText = monitoringLoadState?.officialLiveFallbackCount
        ? ` 本次另有 ${monitoringLoadState.officialLiveFallbackCount} 篇由官方 RSS 即時唯讀補位取得；排程成功後會自動去重並寫入資料庫。`
        : '';
    const aggregatedText = monitoringLoadState?.aggregatedCount
        ? ` 其中 ${monitoringLoadState.aggregatedCount} 篇為 Google News RSS 聚合（非媒體官方 RSS），僅保留標題、發布時間與原文跳轉連結。`
        : '';
    const pendingConfigMessages = [
        monitoringRuntimeStatus?.domestic_config?.pending
            ? '台灣支付規則／來源尚有設定待同步，期間由唯讀即時補位維持資料可見。'
            : '',
        monitoringRuntimeStatus?.stablecoin_config?.pending
            ? '穩定幣（含奧丁丁／OwlPay）規則尚有設定待同步，期間由即時 RSS 補位維持資料可見。'
            : ''
    ].filter(Boolean);
    const configSyncText = pendingConfigMessages.length ? ' ' + pendingConfigMessages.join(' ') : '';
    const statusText = monitoringRuntimeStatus
        ? `已啟用 ${sources.enabled || 0} 個官方 RSS 管道（健康 ${sources.healthy || 0} 個；台灣來源 ${Array.isArray(monitoringRuntimeStatus.enabled_sources) ? monitoringRuntimeStatus.enabled_sources.filter((source) => source?.region === 'TW' && source?.health_status === 'healthy').length : 0} 個）；另有 ${monitoringRuntimeStatus.live_fallback_source_count || 0} 個官方 RSS 即時唯讀補位來源與 ${monitoringRuntimeStatus.aggregated_source_count || 0} 個 Google News RSS 聚合來源；文件媒體清單 ${catalog.total || 0} 家，其中 ${catalog.verified_rss || 0} 家已完成 RSS 驗證；已公開 ${articles.approved || 0} 篇資料庫文章，${articles.pending || 0} 篇寬鬆規則命中資料待覆核。`
        : '正在讀取來源健康與收錄狀態。';
    summary.textContent = `真實性原則：官方 RSS 與 Google News RSS 聚合來源分開標示；兩者都必須命中年度監測規則且附可開啟的原文跳轉連結，不顯示展示資料。${statusText}${loadText}${liveFallbackText}${aggregatedText}${configSyncText}`;
    disclosureContent.appendChild(summary);

    if (!monitoringManifest) {
        renderGlobalDataStatusBar();
        return;
    }
    if (monitoringManifest.automatic_publication_note) {
        const note = document.createElement('p');
        note.style.cssText = 'margin:8px 0 0; font-size:0.82rem; line-height:1.55; color:#0f766e;';
        note.textContent = `發布保護：${monitoringManifest.automatic_publication_note}`;
        disclosureContent.appendChild(note);
    }
    const rulesNote = document.createElement('p');
    rulesNote.style.cssText = 'margin:8px 0 0; font-size:0.78rem; line-height:1.5; color:#0f766e;';
    rulesNote.textContent = '完整關鍵字與組合規則已放在下方分類導航；選擇分類後即可展開核對。';
    disclosureContent.appendChild(rulesNote);
    renderGlobalDataStatusBar();
}

function getRollingMonitoringDateRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = new Date(today);
    from.setMonth(from.getMonth() - 2);
    const asDateInput = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    return { from: asDateInput(from), to: asDateInput(today) };
}

function constrainMonitoringDateInputs(dateFromInput, dateToInput) {
    const range = getRollingMonitoringDateRange();
    const inputs = [
        [dateFromInput, range.from],
        [dateToInput, range.to]
    ];

    inputs.forEach(([input, fallback]) => {
        if (!input) return;
        input.min = range.from;
        input.max = range.to;
        if (!input.value || input.value < range.from || input.value > range.to) {
            input.value = fallback;
        }
    });

    // 日期範圍不得顛倒；若使用者調整起始日超過結束日，保留起始日並同步結束日。
    if (dateFromInput && dateToInput && dateFromInput.value > dateToInput.value) {
        dateToInput.value = dateFromInput.value;
    }
    return range;
}

function initNewsSection() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    initHuikeNav();
    setupNewsFilters();
    // 公開新聞頁絕不回退到展示資料，避免未驗證內容被當作真實新聞。
    monitoringNews = [];
    monitoringRuntimeStatus = null;
    monitoringLoadState = null;
    setVerifiedNewsTotal(0);
    setVerifiedMonitoringSourceTotal(null);
    setNewsDataMode('loading');
    renderHuikeTabs();
    renderHuikeChips();
    applyNewsFilters();
    renderFintechMonitoring();
    renderGamingMonitoring();

    const configured = Boolean(window.MONITORING_API_BASE && typeof loadVerifiedMonitoringArticles === 'function');
    const companyFilter = document.getElementById('companyFilterSection');
    if (configured && companyFilter) companyFilter.hidden = true;
    if (configured) refreshVerifiedSourceOptions([], []);
    renderMonitoringTransparency();
    if (!configured) {
        setNewsDataMode('unavailable');
        applyNewsFilters();
        renderFintechMonitoring();
        renderGamingMonitoring();
        return;
    }

    const manifestPromise = typeof loadMonitoringManifest === 'function'
        ? loadMonitoringManifest().catch((error) => { console.warn('Monitoring manifest unavailable.', error); return null; })
        : Promise.resolve(null);
    const statusPromise = typeof loadMonitoringStatus === 'function'
        ? loadMonitoringStatus().catch((error) => { console.warn('Monitoring status unavailable.', error); return null; })
        : Promise.resolve(null);

    // 規則檔為同站靜態資料；即使即時新聞服務短暫不可用，仍須可核對關鍵字。
    manifestPromise.then((manifest) => {
        if (manifest) hydrateMonitoringManifest(manifest);
    });

    Promise.all([loadVerifiedMonitoringArticles(), manifestPromise, statusPromise]).then(([result, manifest, status]) => {
        if (!result.loaded) throw new Error('Monitoring API is not configured.');
        monitoringRuntimeStatus = status;
        setVerifiedMonitoringSourceTotal(status);
        if (manifest && monitoringManifest !== manifest) hydrateMonitoringManifest(manifest);
        monitoringNews = result.articles;
        monitoringLoadState = {
            total: result.total ?? monitoringNews.length,
            loaded: monitoringNews.length,
            complete: result.complete !== false,
            range: result.range || getRollingMonitoringDateRange(),
            liveFallbackCount: result.liveFallbackCount || 0,
            officialLiveFallbackCount: result.officialLiveFallbackCount || 0,
            aggregatedCount: result.aggregatedCount || 0,
            officialRssCount: result.officialRssCount || 0
        };
        updateRealStatsOverview(monitoringNews, status);
        setVerifiedNewsTotal(monitoringLoadState.total);
        setNewsDataMode('verified');
        refreshVerifiedSourceOptions(result.articles, [
            ...(status?.enabled_sources || []),
            ...(status?.aggregated_sources || [])
        ]);
        renderMonitoringTransparency();
        renderHuikeTabs();
        renderHuikeChips();
        applyNewsFilters();
        renderFintechMonitoring();
        renderGamingMonitoring();
        renderRealTrends();
        if (window.location.hash.includes('analytics') && typeof renderAnalyticsCharts === 'function') {
            renderAnalyticsCharts();
        }
        if (window.location.hash.includes('compare') && typeof forceResizeCompareCharts === 'function') {
            forceResizeCompareCharts();
        }
    }).catch((error) => {
        console.warn('Verified monitoring API unavailable; no unverified content is shown.', error);
        monitoringNews = [];
        monitoringLoadState = null;
        setVerifiedNewsTotal(0);
        setVerifiedMonitoringSourceTotal(null);
        updateRealStatsOverview([], null);
        setNewsDataMode('unavailable');
        renderMonitoringTransparency();
        applyNewsFilters();
        renderFintechMonitoring();
        renderGamingMonitoring();
        renderRealTrends();
    });

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentNewsPage++;
            renderNews(true);
        });
    }
}

function refreshVerifiedSourceOptions(articles, sourceDetails) {
    const sourceSelect = document.getElementById('filterSource');
    if (!sourceSelect) return;
    const previous = sourceSelect.value;
    sourceSelect.replaceChildren();
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '全部真實新聞來源';
    sourceSelect.appendChild(allOption);

    const details = Array.isArray(sourceDetails) && sourceDetails.length
        ? sourceDetails
        : [...new Set(articles.map((article) => article.source).filter(Boolean))].map((name) => ({ name }));
    const seen = new Set();
    details.sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh-Hant')).forEach((source) => {
        if (!source?.name || seen.has(source.name)) return;
        seen.add(source.name);
        const option = document.createElement('option');
        option.value = source.name;
        const isAggregated = source.source_kind === 'aggregated' || source.access_mode === 'google_news_rss'
            || articles.some((article) => article.source === source.name && article.sourceKind === 'google_news_rss');
        const health = source.health_status === 'healthy' ? '健康' : source.health_status ? '待確認' : '';
        option.textContent = `📰 ${source.name}${isAggregated ? '（Google News 聚合）' : ''}${health ? `（${health}）` : ''}`;
        sourceSelect.appendChild(option);
    });
    if ([...sourceSelect.options].some((option) => option.value === previous)) sourceSelect.value = previous;
}

function getMonitoringFoldersForArticle(news) {
    const folders = Array.isArray(news?.huikeFolders)
        ? news.huikeFolders
        : [news?.huikeFolder];
    return folders.filter(Boolean);
}

function articleHasMonitoringFolder(news, folderId) {
    return getMonitoringFoldersForArticle(news).includes(folderId);
}

function getMonitoringRuleIdsForArticle(news) {
    const ruleIds = Array.isArray(news?.ruleIds)
        ? news.ruleIds
        : String(news?.ruleIds || '').split(',');
    return ruleIds.map((ruleId) => String(ruleId || '').trim()).filter(Boolean);
}

function articleHasMonitoringRule(news, ruleId) {
    return getMonitoringRuleIdsForArticle(news).includes(ruleId);
}

function articleHasAnyMonitoringRule(news, ruleIds) {
    if (!ruleIds || typeof ruleIds.has !== 'function') return false;
    return getMonitoringRuleIdsForArticle(news).some((ruleId) => ruleIds.has(ruleId));
}

function stablecoinSearchText(news) {
    return [
        news?.title,
        news?.excerpt,
        ...(news?.matchedTerms || []),
        ...(news?.ruleIds || [])
    ].filter(Boolean).join(' ');
}

function matchesStablecoinTerm(target, term) {
    const text = String(target || '');
    const query = String(term || '');
    if (!text || !query) return false;
    if (/^[A-Za-z0-9]+$/.test(query)) {
        return new RegExp('(^|[^a-z0-9])' + query.toLowerCase() + '($|[^a-z0-9])', 'i').test(text);
    }
    return text.toLowerCase().includes(query.toLowerCase());
}

function articleHasStablecoinRule(news) {
    return articleHasAnyMonitoringRule(news, STABLECOIN_RULE_IDS);
}

function hasStablecoinContext(news) {
    if (articleHasMonitoringFolder(news, 'folder_6') || articleHasStablecoinRule(news)) return true;
    const target = stablecoinSearchText(news);
    return STABLECOIN_TERM_GROUPS
        .slice(0, -1)
        .some((group) => group.terms.some((term) => matchesStablecoinTerm(target, term)));
}

function isOwlPayPriorityArticle(news) {
    if (!hasStablecoinContext(news)) return false;
    const target = stablecoinSearchText(news);
    return STABLECOIN_PRIORITY_TERMS.some((term) => matchesStablecoinTerm(target, term));
}

function getStablecoinTermMatches(news) {
    const target = stablecoinSearchText(news);
    const matches = [];
    const stablecoinContext = hasStablecoinContext(news);
    STABLECOIN_TERM_GROUPS.forEach((group, index) => {
        // 奧丁丁／OwlPay 是穩定幣頁面的優先標籤；只有文章已經命中
        // folder_6、穩定幣規則或明確穩定幣詞時才加入，避免一般品牌新聞被誤標。
        if (index === STABLECOIN_TERM_GROUPS.length - 1 && !stablecoinContext) return;
        group.terms.forEach((term) => {
            if (matchesStablecoinTerm(target, term)) matches.push(term);
        });
    });
    return [...new Set(matches)];
}

function isStablecoinArticle(news) {
    return articleHasMonitoringFolder(news, 'folder_6')
        || articleHasStablecoinRule(news)
        || getStablecoinTermMatches(news).length > 0;
}

function isFintechMonitoringArticle(news) {
    return getMonitoringFoldersForArticle(news).some((folderId) => FINTECH_FOLDER_IDS.has(folderId))
        || isStablecoinArticle(news);
}

function getFintechMonitoringArticles() {
    return monitoringNews
        .filter(isFintechMonitoringArticle)
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

function isSoftworldFintechArticle(news) {
    return articleHasAnyMonitoringRule(news, SOFTWORLD_FINTECH_RULE_IDS);
}

function isTaiwanPaymentPeerArticle(news) {
    return articleHasAnyMonitoringRule(news, TAIWAN_PAYMENT_PEER_RULE_IDS);
}

function getFintechCategoryLabels(news) {
    const labels = [];
    if (isSoftworldFintechArticle(news)) labels.push('智冠金融服務');
    if (isTaiwanPaymentPeerArticle(news)) labels.push('支付同業');
    if (articleHasMonitoringFolder(news, 'folder_2')) labels.push('台灣支付');
    if (articleHasMonitoringFolder(news, 'folder_5')) labels.push('國際金融科技');
    if (isStablecoinArticle(news)) labels.push('穩定幣');
    return labels.length ? labels : ['金融科技'];
}

function plainFintechText(value) {
    const decoder = document.createElement('div');
    decoder.innerHTML = String(value || '');
    return decoder.textContent || '';
}

function truncateFintechText(value, maxLength = 300) {
    const text = plainFintechText(value).replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '…' : text;
}

// 國際金融科技新聞多為英文 RSS。標題上方提供一行中文重點，
// 只翻譯標題本身，並以 sessionStorage 暫存，避免每次切換分類都重複請求。
const INTERNATIONAL_KEY_POINT_CACHE_KEY = 'softworld-intl-key-points-v1';
const internationalKeyPointCache = (() => {
    try {
        const parsed = JSON.parse(window.sessionStorage.getItem(INTERNATIONAL_KEY_POINT_CACHE_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
        return {};
    }
})();
const internationalKeyPointPending = new Map();
const internationalKeyPointQueue = [];
let internationalKeyPointActive = 0;
const INTERNATIONAL_KEY_POINT_CONCURRENCY = 3;

function persistInternationalKeyPointCache() {
    try {
        const entries = Object.entries(internationalKeyPointCache).slice(-160);
        window.sessionStorage.setItem(INTERNATIONAL_KEY_POINT_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
    } catch (_) {
        // 儲存空間或隱私模式不可用時，仍保留本次頁面內的翻譯結果。
    }
}

function isMostlyChineseText(value) {
    const text = String(value || '');
    const chineseCount = (text.match(/[\u3400-\u9fff]/g) || []).length;
    const latinCount = (text.match(/[A-Za-z]/g) || []).length;
    return chineseCount >= 4 && chineseCount >= latinCount * 0.5;
}

function internationalKeyPointFallback(news) {
    const title = truncateFintechText(news.title || '', 120);
    if (title && isMostlyChineseText(title)) return `本則聚焦：${title}`;
    const terms = [...new Set((news.matchedTerms || []).filter(Boolean))].slice(0, 2);
    if (terms.length) return `本則聚焦國際金融科技動態，關鍵詞為「${terms.join('、')}」。`;
    return '本則聚焦國際金融科技與支付產業最新動態；完整內容請以原文為準。';
}

function parseGoogleTranslation(payload) {
    if (!Array.isArray(payload) || !Array.isArray(payload[0])) return '';
    return payload[0]
        .map((segment) => Array.isArray(segment) ? segment[0] : '')
        .filter(Boolean)
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
}

async function requestInternationalTranslation(text) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    try {
        const params = new URLSearchParams({
            client: 'gtx', sl: 'auto', tl: 'zh-TW', dt: 't', q: String(text).slice(0, 500)
        });
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`translation_${response.status}`);
        return parseGoogleTranslation(await response.json());
    } finally {
        window.clearTimeout(timeout);
    }
}

function pumpInternationalKeyPointQueue() {
    while (internationalKeyPointActive < INTERNATIONAL_KEY_POINT_CONCURRENCY && internationalKeyPointQueue.length) {
        const task = internationalKeyPointQueue.shift();
        internationalKeyPointActive += 1;
        requestInternationalTranslation(task.text)
            .then((translated) => task.resolve(translated))
            .catch((error) => task.reject(error))
            .finally(() => {
                internationalKeyPointActive -= 1;
                pumpInternationalKeyPointQueue();
            });
    }
}

function translateInternationalKeyPoint(text) {
    const key = String(text || '').replace(/\s+/g, ' ').trim();
    if (!key) return Promise.resolve('');
    if (internationalKeyPointCache[key]) return Promise.resolve(internationalKeyPointCache[key]);
    if (internationalKeyPointPending.has(key)) return internationalKeyPointPending.get(key);
    const promise = new Promise((resolve, reject) => {
        internationalKeyPointQueue.push({ text: key, resolve, reject });
        pumpInternationalKeyPointQueue();
    });
    internationalKeyPointPending.set(key, promise);
    promise.then((translated) => {
        if (translated) {
            internationalKeyPointCache[key] = translated;
            persistInternationalKeyPointCache();
        }
        internationalKeyPointPending.delete(key);
    }, () => internationalKeyPointPending.delete(key));
    return promise;
}

function isInternationalFintechArticle(news) {
    return articleHasMonitoringFolder(news, 'folder_5');
}

function createInternationalKeyPoint(news) {
    const container = document.createElement('p');
    container.className = 'fintech-card-key-point';
    const label = document.createElement('span');
    label.className = 'fintech-key-point-label';
    label.textContent = '中文重點';
    const text = document.createElement('span');
    text.className = 'fintech-key-point-text';
    text.textContent = '翻譯中…';
    container.append(label, text);

    const title = plainFintechText(news.title || '');
    if (news.keyPointZh || news.key_point_zh) {
        text.textContent = news.keyPointZh || news.key_point_zh;
    } else if (isMostlyChineseText(title)) {
        text.textContent = internationalKeyPointFallback(news);
    } else {
        translateInternationalKeyPoint(title)
            .then((translated) => {
                if (container.isConnected) text.textContent = translated || internationalKeyPointFallback(news);
            })
            .catch(() => {
                if (container.isConnected) text.textContent = internationalKeyPointFallback(news);
            });
    }
    return container;
}

function fintechSearchText(news) {
    return [
        stablecoinSearchText(news),
        ...getStablecoinTermMatches(news),
        ...getFintechCategoryLabels(news)
    ].filter(Boolean).join(' ').toLowerCase();
}

function updateFintechModeButtons() {
    document.querySelectorAll('[data-fintech-mode]').forEach((button) => {
        const isActive = button.getAttribute('data-fintech-mode') === fintechMode;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

function refreshMonitoringSourceOptions(selectId, articles) {
    const sourceSelect = document.getElementById(selectId);
    if (!sourceSelect) return;
    const sources = [...new Set(articles.map((article) => article.source).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b), 'zh-Hant'));
    const signature = sources.join('|');
    if (sourceSelect.dataset.sourceSignature === signature) return;

    const previous = sourceSelect.value;
    sourceSelect.replaceChildren();
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '全部真實新聞來源';
    sourceSelect.appendChild(allOption);
    sources.forEach((source) => {
        const option = document.createElement('option');
        option.value = source;
        const isAggregated = articles.some((article) => article.source === source && article.sourceKind === 'google_news_rss');
        option.textContent = `${source}${isAggregated ? '（Google News 聚合）' : ''}`;
        sourceSelect.appendChild(option);
    });
    if (sources.includes(previous)) sourceSelect.value = previous;
    sourceSelect.dataset.sourceSignature = signature;
}

function refreshFintechSourceOptions(articles) {
    refreshMonitoringSourceOptions('fintechSourceFilter', articles);
}

function renderFintechKeywordPills(articles) {
    const container = document.getElementById('fintechKeywordPills');
    if (!container) return;
    container.replaceChildren();
    const scopes = [
        { label: '智冠金融服務', count: articles.filter(isSoftworldFintechArticle).length },
        { label: '支付同業（應援科技）', count: articles.filter(isTaiwanPaymentPeerArticle).length },
        { label: '台灣支付與藍新科技', count: articles.filter((article) => articleHasMonitoringFolder(article, 'folder_2')).length },
        { label: '國際支付與金融科技', count: articles.filter((article) => articleHasMonitoringFolder(article, 'folder_5')).length },
        { label: '穩定幣與鏈上結算', count: articles.filter(isStablecoinArticle).length },
        { label: '奧丁丁／OwlPay 優先', count: articles.filter(isOwlPayPriorityArticle).length }
    ];
    scopes.forEach((scope) => {
        const pill = document.createElement('span');
        pill.className = 'fintech-scope-pill' + (scope.label.includes('奧丁丁') ? ' fintech-priority-pill' : '');
        pill.textContent = scope.label + ' ' + scope.count + ' 篇';
        container.appendChild(pill);
    });
}

function renderFintechSummary(summary, articles) {
    summary.replaceChildren();
    const range = monitoringLoadState?.range || getRollingMonitoringDateRange();
    const taiwanPaymentCount = articles.filter((article) => articleHasMonitoringFolder(article, 'folder_2')).length;
    const stablecoinCount = articles.filter(isStablecoinArticle).length;
    const owlPayPriorityCount = articles.filter(isOwlPayPriorityArticle).length;
    const sources = new Set(articles.map((article) => article.source).filter(Boolean));
    const taiwanSources = new Set(articles.filter((article) => article.sourceRegion === 'TW').map((article) => article.source).filter(Boolean));

    const contextDetails = document.createElement('details');
    contextDetails.className = 'fintech-summary-details';
    const contextToggle = document.createElement('summary');
    contextToggle.textContent = '資料範圍與監測口徑';
    const contextContent = document.createElement('div');
    contextContent.className = 'fintech-summary-details-content';
    contextDetails.append(contextToggle, contextContent);
    summary.appendChild(contextDetails);
    const state = document.createElement('p');
    state.className = 'fintech-summary-state';
    const aggregatedCount = Number(monitoringLoadState?.aggregatedCount || 0);
    state.textContent = '官方 RSS＋Google News RSS 聚合資料，台灣支付為預設視圖。資料範圍 ' + range.from + ' 至 ' + range.to + '；每則新聞皆保留來源類型、原文跳轉連結與命中證據。' + (aggregatedCount ? ` 本次聚合來源 ${aggregatedCount} 篇，非媒體官方 RSS。` : '');
    contextContent.appendChild(state);
    const priorityNote = document.createElement('p');
    priorityNote.className = 'fintech-priority-note';
    priorityNote.textContent = `穩定幣頁優先：奧丁丁／OwlPay ${owlPayPriorityCount} 篇；僅在同時具穩定幣、鏈上支付、加密資產或金融科技語境時列入。`;
    contextContent.appendChild(priorityNote);

    const grid = document.createElement('div');
    grid.className = 'fintech-stat-grid';
    [
        [String(taiwanPaymentCount), '台灣支付新聞（優先）'],
        [String(articles.length), '全部金融科技新聞'],
        [String(stablecoinCount), '穩定幣相關'],
        [String(sources.size), '真實新聞來源'],
        [String(taiwanSources.size), '台灣來源'],
        [range.from + ' 至 ' + range.to, '資料範圍']
    ].forEach(([value, label]) => {
        const item = document.createElement('div');
        item.className = 'fintech-stat';
        const statValue = document.createElement('strong');
        statValue.className = 'fintech-stat-value';
        statValue.textContent = value;
        const statLabel = document.createElement('span');
        statLabel.className = 'fintech-stat-label';
        statLabel.textContent = label;
        item.append(statValue, statLabel);
        grid.appendChild(item);
    });
    summary.appendChild(grid);
}

function makeFintechEmptyState(icon, title, message) {
    const empty = document.createElement('div');
    empty.className = 'fintech-empty-state';
    const iconEl = document.createElement('div');
    iconEl.className = 'fintech-empty-icon';
    iconEl.textContent = icon;
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    empty.append(iconEl, titleEl, messageEl);
    return empty;
}

function createFintechArticleCard(news, options = {}) {
    const card = document.createElement('article');
    card.className = options.cardClass || 'fintech-news-card';

    const header = document.createElement('div');
    header.className = 'fintech-card-header';
    const badges = document.createElement('div');
    badges.className = 'fintech-card-badges';
    const categoryLabels = options.categoryLabels || getFintechCategoryLabels(news);
    const categoryBadgeClass = options.categoryBadgeClass || 'fintech-category-badge';
    categoryLabels.forEach((label) => {
        const badge = document.createElement('span');
        badge.className = categoryBadgeClass;
        badge.textContent = label;
        badges.appendChild(badge);
    });
    const priorityLabel = Object.prototype.hasOwnProperty.call(options, 'priorityLabel')
        ? options.priorityLabel
        : (isOwlPayPriorityArticle(news) ? '⭐ 奧丁丁優先' : '');
    if (priorityLabel) {
        const priorityBadge = document.createElement('span');
        priorityBadge.className = categoryBadgeClass + ' fintech-priority-badge';
        priorityBadge.textContent = priorityLabel;
        badges.appendChild(priorityBadge);
    }
    const date = document.createElement('time');
    date.className = 'fintech-card-date';
    date.textContent = '📅 ' + (news.date || '日期未提供');
    header.append(badges, date);

    const keyPoint = options.disableKeyPoint
        ? null
        : (isInternationalFintechArticle(news) ? createInternationalKeyPoint(news) : null);
    const title = document.createElement('h3');
    title.className = 'fintech-card-title';
    const displayTitle = plainFintechText(news.title || '未提供標題');
    const directUrl = safeHttpUrl(news.url);
    if (directUrl !== '#') {
        const link = document.createElement('a');
        link.href = directUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = displayTitle;
        title.appendChild(link);
    } else {
        title.textContent = displayTitle;
    }

    const excerpt = document.createElement('p');
    excerpt.className = 'fintech-card-excerpt';
    excerpt.textContent = truncateFintechText(news.excerpt || (news.sourceKind === 'google_news_rss'
        ? 'Google News RSS 聚合僅提供標題與發布時間；請開啟原文閱讀完整內容。'
        : '此文章由已驗證公開 RSS 來源收錄。'));

    const matchedTerms = [...new Set([
        ...(news.matchedTerms || []),
        ...(Array.isArray(options.additionalMatchedTerms) ? options.additionalMatchedTerms : getStablecoinTermMatches(news))
    ].filter(Boolean))].slice(0, 8);
    const evidence = document.createElement('div');
    evidence.className = 'fintech-evidence';
    const evidenceLabel = document.createElement('span');
    evidenceLabel.className = 'fintech-evidence-label';
    evidenceLabel.textContent = '命中詞';
    evidence.appendChild(evidenceLabel);
    if (matchedTerms.length) {
        matchedTerms.forEach((term) => {
            const termEl = document.createElement('span');
            termEl.className = 'fintech-term';
            termEl.textContent = term;
            evidence.appendChild(termEl);
        });
    } else {
        const ruleEl = document.createElement('span');
        ruleEl.className = 'fintech-term';
        ruleEl.textContent = (news.ruleIds || [])[0] || '規則命中';
        evidence.appendChild(ruleEl);
    }

    const footer = document.createElement('div');
    footer.className = 'fintech-card-footer';
    const source = document.createElement('span');
    source.className = 'fintech-card-source';
    const sourcePrefix = news.sourceRegion === 'TW' ? '🇹🇼 台灣來源｜' : '📰 ';
    source.textContent = sourcePrefix + (news.source || '來源未提供') + (news.sourceKind === 'google_news_rss' ? '｜Google News 聚合' : '｜官方 RSS');
    const original = document.createElement('a');
    original.className = 'fintech-original-link';
    if (directUrl !== '#') {
        original.href = directUrl;
        original.target = '_blank';
        original.rel = 'noopener';
        original.textContent = '開啟原文 ↗';
    } else {
        original.removeAttribute('href');
        original.textContent = '原文連結不可用';
    }
    footer.append(source, original);
    const provenanceDetails = document.createElement('details');
    provenanceDetails.className = 'fintech-card-provenance-details';
    const provenanceToggle = document.createElement('summary');
    provenanceToggle.className = 'fintech-provenance-toggle';
    provenanceToggle.textContent = '來源與資料類型';
    const provenance = document.createElement('div');
    provenance.className = 'fintech-card-provenance';
    const provenanceMode = news.sourceKind === 'google_news_rss'
        ? 'Google News RSS 聚合（非媒體官方 RSS）'
        : (news.liveFallback ? '官方 RSS 即時讀取' : `本站收錄：${news.collectedDate || '未提供'}`);
    provenance.textContent = `原文發布：${news.date || '未提供'}｜${provenanceMode}｜覆核狀態：${news.reviewState === 'approved' ? '規則通過' : '待人工覆核'}`;
    const feedUrl = safeHttpUrl(news.sourceFeed);
    if (feedUrl !== '#') {
        const separator = document.createTextNode('｜');
        const feedLink = document.createElement('a');
        feedLink.href = feedUrl;
        feedLink.target = '_blank';
        feedLink.rel = 'noopener';
        feedLink.textContent = news.sourceKind === 'google_news_rss' ? 'Google News RSS 查詢' : 'RSS 來源';
        provenance.append(separator, feedLink);
    }
    provenanceDetails.append(provenanceToggle, provenance);
    card.append(header);
    if (keyPoint) card.appendChild(keyPoint);
    card.append(title, excerpt, evidence, footer, provenanceDetails);
    return card;
}

function renderFintechMonitoring() {
    const summary = document.getElementById('fintechMonitoringSummary');
    const grid = document.getElementById('fintechNewsGrid');
    const resultCount = document.getElementById('fintechResultCount');
    const loadMore = document.getElementById('fintechLoadMore');
    if (!summary || !grid || !resultCount || !loadMore) return;
    updateFintechModeButtons();

    if (monitoringDataMode !== 'verified') {
        const isLoading = monitoringDataMode === 'loading';
        summary.replaceChildren();
        const state = document.createElement('p');
        state.className = 'fintech-summary-state';
        state.textContent = isLoading
            ? '正在讀取官方 RSS 與 Google News RSS 聚合來源、近兩個月資料與關鍵字命中結果。'
            : '真實新聞服務目前無法驗證，頁面不會改以展示資料替代。';
        summary.appendChild(state);
        renderFintechKeywordPills([]);
        grid.replaceChildren();
        grid.appendChild(makeFintechEmptyState(
            isLoading ? '⏳' : '⚠️',
            isLoading ? '正在讀取金融科技新聞' : '真實新聞服務暫時無法驗證',
            isLoading
                ? '系統正在確認來源健康狀態、Google News 聚合結果與兩個月資料窗口。'
                : '為避免未驗證內容被誤認為新聞，請稍後重新整理。'
        ));
        resultCount.textContent = isLoading ? '正在載入金融科技真實新聞' : '真實新聞服務目前無法驗證';
        loadMore.hidden = true;
        return;
    }

    const allArticles = getFintechMonitoringArticles();
    refreshFintechSourceOptions(allArticles);
    renderFintechSummary(summary, allArticles);
    renderFintechKeywordPills(allArticles);

    const selectedSource = document.getElementById('fintechSourceFilter')?.value || '';
    const keyword = document.getElementById('fintechKeywordFilter')?.value.trim().toLowerCase() || '';
    const clearButton = document.getElementById('fintechClearFilters');
    if (clearButton) clearButton.disabled = fintechMode === 'all' && !selectedSource && !keyword;
    const filtered = allArticles.filter((article) => {
        const matchMode = fintechMode === 'all'
            || (fintechMode === 'softworld' && isSoftworldFintechArticle(article))
            || (fintechMode === 'taiwan' && articleHasMonitoringFolder(article, 'folder_2'))
            || (fintechMode === 'international' && articleHasMonitoringFolder(article, 'folder_5'))
            || (fintechMode === 'stablecoin' && isStablecoinArticle(article));
        const matchSource = !selectedSource || article.source === selectedSource;
        const matchKeyword = !keyword || fintechSearchText(article).includes(keyword);
        return matchMode && matchSource && matchKeyword;
    });
    if (fintechMode === 'stablecoin') {
        filtered.sort((a, b) => {
            const priorityDelta = Number(isOwlPayPriorityArticle(b)) - Number(isOwlPayPriorityArticle(a));
            return priorityDelta || String(b.date || '').localeCompare(String(a.date || ''));
        });
    }

    const visible = filtered.slice(0, fintechPage * FINTECH_PER_PAGE);
    const aggregatedVisible = visible.filter((article) => article.sourceKind === 'google_news_rss').length;
    const modeLabel = aggregatedVisible ? `（含 ${aggregatedVisible} 篇 Google News 聚合）` : '';
    resultCount.textContent = '顯示 ' + visible.length + '／' + filtered.length + ' 篇真實新聞' + modeLabel;
    grid.replaceChildren();
    if (!filtered.length) {
        const emptyMessage = !allArticles.length
            ? '近兩個月目前沒有符合金融科技規則的文章；資料服務正常，請稍後重試。'
            : (selectedSource || keyword || fintechMode !== 'all'
                ? '目前篩選條件沒有命中；請調整分類、來源或搜尋文字。'
            : '資料服務已連線，但目前沒有可公開的官方 RSS 或 Google News 聚合文章。');
        grid.appendChild(makeFintechEmptyState(
            '🔍',
            '目前沒有符合條件的真實新聞',
            emptyMessage + ' 頁面不會以展示資料補足結果。'
        ));
    } else {
        visible.forEach((article) => grid.appendChild(createFintechArticleCard(article)));
    }
    loadMore.hidden = visible.length >= filtered.length;
}

function initFintechMonitoringPage() {
    const modeButtons = document.getElementById('fintechModeButtons');
    const sourceFilter = document.getElementById('fintechSourceFilter');
    const keywordFilter = document.getElementById('fintechKeywordFilter');
    const clearButton = document.getElementById('fintechClearFilters');
    const loadMoreButton = document.getElementById('fintechLoadMoreBtn');

    if (modeButtons && !modeButtons.dataset.bound) {
        modeButtons.dataset.bound = 'true';
        modeButtons.querySelectorAll('[data-fintech-mode]').forEach((button) => {
            button.addEventListener('click', () => {
                fintechMode = button.getAttribute('data-fintech-mode') || 'all';
                fintechPage = 1;
                renderFintechMonitoring();
            });
        });
    }
    if (sourceFilter && !sourceFilter.dataset.bound) {
        sourceFilter.dataset.bound = 'true';
        sourceFilter.addEventListener('change', () => {
            fintechPage = 1;
            renderFintechMonitoring();
        });
    }
    if (keywordFilter && !keywordFilter.dataset.bound) {
        keywordFilter.dataset.bound = 'true';
        keywordFilter.addEventListener('input', () => {
            fintechPage = 1;
            renderFintechMonitoring();
        });
    }
    if (clearButton && !clearButton.dataset.bound) {
        clearButton.dataset.bound = 'true';
        clearButton.addEventListener('click', () => {
            fintechMode = 'taiwan';
            fintechPage = 1;
            if (sourceFilter) sourceFilter.value = '';
            if (keywordFilter) keywordFilter.value = '';
            renderFintechMonitoring();
        });
    }
    if (loadMoreButton && !loadMoreButton.dataset.bound) {
        loadMoreButton.dataset.bound = 'true';
        loadMoreButton.addEventListener('click', () => {
            fintechPage++;
            renderFintechMonitoring();
        });
    }
    renderFintechMonitoring();
}

// 遊戲頁只採用可明確對應遊戲內容的規則，避免資料夾中的泛商業、
// 金融或加密貨幣文章因關鍵字過寬而混入遊戲產業新聞。
function isGamingMonitoringArticle(news) {
    return articleHasAnyMonitoringRule(news, GAMING_RULE_IDS);
}

function getGamingMonitoringArticles() {
    return monitoringNews
        .filter(isGamingMonitoringArticle)
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

function getGamingCategoryLabels(news) {
    const labels = [];
    if (articleHasAnyMonitoringRule(news, GAMING_MODE_RULE_IDS.softworld)) labels.push('智冠集團與旗下遊戲');
    if (articleHasAnyMonitoringRule(news, GAMING_MODE_RULE_IDS.competitor)) labels.push('遊戲競業');
    if (articleHasAnyMonitoringRule(news, GAMING_MODE_RULE_IDS.mobile)) labels.push('高營收手遊');
    if (articleHasAnyMonitoringRule(news, GAMING_MODE_RULE_IDS.platform)) labels.push('平台／主機／電競');
    return labels.length ? labels : ['遊戲產業'];
}

function gamingSearchText(news) {
    return [
        news?.title,
        news?.excerpt,
        news?.source,
        ...(news?.matchedTerms || []),
        ...getMonitoringRuleIdsForArticle(news),
        ...getGamingCategoryLabels(news)
    ].filter(Boolean).join(' ').toLowerCase();
}

function updateGamingModeButtons() {
    document.querySelectorAll('[data-gaming-mode]').forEach((button) => {
        const isActive = button.getAttribute('data-gaming-mode') === gamingMode;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

function renderGamingKeywordPills(articles) {
    const container = document.getElementById('gamingKeywordPills');
    if (!container) return;
    container.replaceChildren();
    const scopes = [
        { label: '智冠集團與旗下遊戲', ruleIds: GAMING_MODE_RULE_IDS.softworld },
        { label: '遊戲競業', ruleIds: GAMING_MODE_RULE_IDS.competitor },
        { label: '高營收手遊', ruleIds: GAMING_MODE_RULE_IDS.mobile },
        { label: '平台、主機與電競', ruleIds: GAMING_MODE_RULE_IDS.platform }
    ];
    scopes.forEach((scope) => {
        const pill = document.createElement('span');
        pill.className = 'fintech-scope-pill gaming-scope-pill';
        pill.textContent = `${scope.label} ${articles.filter((article) => articleHasAnyMonitoringRule(article, scope.ruleIds)).length} 篇`;
        container.appendChild(pill);
    });
}

function renderGamingSummary(summary, articles) {
    summary.replaceChildren();
    const range = monitoringLoadState?.range || getRollingMonitoringDateRange();
    const softworldCount = articles.filter((article) => articleHasAnyMonitoringRule(article, GAMING_MODE_RULE_IDS.softworld)).length;
    const competitorCount = articles.filter((article) => articleHasAnyMonitoringRule(article, GAMING_MODE_RULE_IDS.competitor)).length;
    const mobileCount = articles.filter((article) => articleHasAnyMonitoringRule(article, GAMING_MODE_RULE_IDS.mobile)).length;
    const platformCount = articles.filter((article) => articleHasAnyMonitoringRule(article, GAMING_MODE_RULE_IDS.platform)).length;
    const sources = new Set(articles.map((article) => article.source).filter(Boolean));
    const aggregatedCount = articles.filter((article) => article.sourceKind === 'google_news_rss').length;

    const contextDetails = document.createElement('details');
    contextDetails.className = 'fintech-summary-details gaming-summary-details';
    const contextToggle = document.createElement('summary');
    contextToggle.textContent = '資料範圍與監測口徑';
    const contextContent = document.createElement('div');
    contextContent.className = 'fintech-summary-details-content';
    contextDetails.append(contextToggle, contextContent);

    const state = document.createElement('p');
    state.className = 'fintech-summary-state';
    state.textContent = `官方 RSS＋Google News RSS 聚合資料；資料範圍 ${range.from} 至 ${range.to}。只納入智冠集團與旗下遊戲、遊戲競業、高營收手遊／重點手遊、平台／主機／電競等精準規則；手遊僅以直接遊戲名稱或明確別名命中。每則新聞皆保留來源類型、原文連結與命中詞。${sources.size ? ` 可追溯來源 ${sources.size} 個。` : ''}${aggregatedCount ? ` 其中 ${aggregatedCount} 篇為 Google News RSS 聚合，非媒體官方 RSS。` : ''}`;
    contextContent.appendChild(state);
    summary.appendChild(contextDetails);

    const grid = document.createElement('div');
    grid.className = 'fintech-stat-grid gaming-stat-grid';
    [
        [String(articles.length), '全部遊戲新聞'],
        [String(softworldCount), '智冠集團與旗下遊戲'],
        [String(competitorCount), '遊戲競業'],
        [String(mobileCount), '高營收手遊與重點手遊'],
        [String(platformCount), '平台／主機／電競'],
        [range.from + ' 至 ' + range.to, '資料範圍']
    ].forEach(([value, label]) => {
        const item = document.createElement('div');
        item.className = 'fintech-stat gaming-stat';
        const statValue = document.createElement('strong');
        statValue.className = 'fintech-stat-value gaming-stat-value';
        statValue.textContent = value;
        const statLabel = document.createElement('span');
        statLabel.className = 'fintech-stat-label';
        statLabel.textContent = label;
        item.append(statValue, statLabel);
        grid.appendChild(item);
    });
    summary.appendChild(grid);
}

function createGamingArticleCard(news) {
    return createFintechArticleCard(news, {
        cardClass: 'fintech-news-card gaming-news-card',
        categoryLabels: getGamingCategoryLabels(news),
        categoryBadgeClass: 'fintech-category-badge gaming-category-badge',
        priorityLabel: '',
        additionalMatchedTerms: [],
        disableKeyPoint: true
    });
}

function renderGamingMonitoring() {
    const summary = document.getElementById('gamingMonitoringSummary');
    const grid = document.getElementById('gamingNewsGrid');
    const resultCount = document.getElementById('gamingResultCount');
    const loadMore = document.getElementById('gamingLoadMore');
    if (!summary || !grid || !resultCount || !loadMore) return;
    updateGamingModeButtons();

    if (monitoringDataMode !== 'verified') {
        const isLoading = monitoringDataMode === 'loading';
        summary.replaceChildren();
        const state = document.createElement('p');
        state.className = 'fintech-summary-state';
        state.textContent = isLoading
            ? '正在讀取官方 RSS 與 Google News RSS 聚合來源、近兩個月資料與遊戲規則命中結果。'
            : '真實新聞服務目前無法驗證，頁面不會改以展示資料替代。';
        summary.appendChild(state);
        renderGamingKeywordPills([]);
        grid.replaceChildren();
        grid.appendChild(makeFintechEmptyState(
            isLoading ? '⏳' : '⚠️',
            isLoading ? '正在讀取遊戲產業新聞' : '真實新聞服務暫時無法驗證',
            isLoading
                ? '系統正在確認來源健康狀態、Google News 聚合結果與兩個月資料窗口。'
                : '為避免未驗證內容被誤認為新聞，請稍後重新整理。'
        ));
        resultCount.textContent = isLoading ? '正在載入遊戲產業真實新聞' : '真實新聞服務目前無法驗證';
        loadMore.hidden = true;
        return;
    }

    const allArticles = getGamingMonitoringArticles();
    refreshMonitoringSourceOptions('gamingSourceFilter', allArticles);
    renderGamingSummary(summary, allArticles);
    renderGamingKeywordPills(allArticles);

    const selectedSource = document.getElementById('gamingSourceFilter')?.value || '';
    const keyword = document.getElementById('gamingKeywordFilter')?.value.trim().toLowerCase() || '';
    const clearButton = document.getElementById('gamingClearFilters');
    if (clearButton) clearButton.disabled = gamingMode === 'all' && !selectedSource && !keyword;
    const selectedRuleIds = GAMING_MODE_RULE_IDS[gamingMode] || new Set();
    const filtered = allArticles.filter((article) => {
        const matchMode = gamingMode === 'all' || articleHasAnyMonitoringRule(article, selectedRuleIds);
        const matchSource = !selectedSource || article.source === selectedSource;
        const matchKeyword = !keyword || gamingSearchText(article).includes(keyword);
        return matchMode && matchSource && matchKeyword;
    });

    const visible = filtered.slice(0, gamingPage * GAMING_PER_PAGE);
    const aggregatedVisible = visible.filter((article) => article.sourceKind === 'google_news_rss').length;
    const aggregationLabel = aggregatedVisible ? `（含 ${aggregatedVisible} 篇 Google News 聚合）` : '';
    resultCount.textContent = `顯示 ${visible.length}／${filtered.length} 篇真實新聞${aggregationLabel}`;
    grid.replaceChildren();
    if (!filtered.length) {
        const emptyMessage = !allArticles.length
            ? '近兩個月目前沒有符合遊戲核心規則的文章；資料服務正常，請稍後重試。'
            : (selectedSource || keyword || gamingMode !== 'all'
                ? '目前篩選條件沒有命中；請調整分類、來源或搜尋文字。'
                : '資料服務已連線，但目前沒有可公開的官方 RSS 或 Google News 聚合文章。');
        grid.appendChild(makeFintechEmptyState(
            '🔍',
            '目前沒有符合條件的真實新聞',
            emptyMessage + ' 頁面不會以展示資料補足結果。'
        ));
    } else {
        visible.forEach((article) => grid.appendChild(createGamingArticleCard(article)));
    }
    loadMore.hidden = visible.length >= filtered.length;
}

function initGamingMonitoringPage() {
    const modeButtons = document.getElementById('gamingModeButtons');
    const sourceFilter = document.getElementById('gamingSourceFilter');
    const keywordFilter = document.getElementById('gamingKeywordFilter');
    const clearButton = document.getElementById('gamingClearFilters');
    const loadMoreButton = document.getElementById('gamingLoadMoreBtn');

    if (modeButtons && !modeButtons.dataset.bound) {
        modeButtons.dataset.bound = 'true';
        modeButtons.querySelectorAll('[data-gaming-mode]').forEach((button) => {
            button.addEventListener('click', () => {
                gamingMode = button.getAttribute('data-gaming-mode') || 'all';
                gamingPage = 1;
                renderGamingMonitoring();
            });
        });
    }
    if (sourceFilter && !sourceFilter.dataset.bound) {
        sourceFilter.dataset.bound = 'true';
        sourceFilter.addEventListener('change', () => {
            gamingPage = 1;
            renderGamingMonitoring();
        });
    }
    if (keywordFilter && !keywordFilter.dataset.bound) {
        keywordFilter.dataset.bound = 'true';
        keywordFilter.addEventListener('input', () => {
            gamingPage = 1;
            renderGamingMonitoring();
        });
    }
    if (clearButton && !clearButton.dataset.bound) {
        clearButton.dataset.bound = 'true';
        clearButton.addEventListener('click', () => {
            gamingMode = 'all';
            gamingPage = 1;
            if (sourceFilter) sourceFilter.value = '';
            if (keywordFilter) keywordFilter.value = '';
            renderGamingMonitoring();
        });
    }
    if (loadMoreButton && !loadMoreButton.dataset.bound) {
        loadMoreButton.dataset.bound = 'true';
        loadMoreButton.addEventListener('click', () => {
            gamingPage++;
            renderGamingMonitoring();
        });
    }
    renderGamingMonitoring();
}

// 初始化 2025 智冠慧科五大監測分類導航
function initHuikeNav() {
    const tabsContainer = document.getElementById('huikeFolderTabs');
    const chipsContainer = document.getElementById('huikeKeywordChips');
    const clearBtn = document.getElementById('clearHuikeFilterBtn');
    if (!tabsContainer || typeof HUIKE_2025_STRUCTURE === 'undefined') return;

    renderHuikeTabs();
    renderHuikeChips();

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            activeHuikeKeyword = '';
            const kwInput = document.getElementById('filterKeyword');
            if (kwInput) kwInput.value = '';
            clearBtn.style.display = 'none';
            renderHuikeChips();
            applyNewsFilters();
        });
    }
}

function getFolderNewsCount(folderId) {
    return monitoringNews.filter((news) => (news.huikeFolders || [news.huikeFolder]).includes(folderId)).length;
}

function getKeywordNewsCount(keyword) {
    if (!keyword) return 0;
    const kw = keyword.toLowerCase().trim();
    return monitoringNews.filter(n =>
        (n.huikeKeyword && n.huikeKeyword.toLowerCase().includes(kw)) ||
        (n.matchedTerms && n.matchedTerms.some((term) => term.toLowerCase().includes(kw))) ||
        (n.title && n.title.toLowerCase().includes(kw)) ||
        (n.excerpt && n.excerpt.toLowerCase().includes(kw))
    ).length;
}

function renderHuikeTabs() {
    const tabsContainer = document.getElementById('huikeFolderTabs');
    if (!tabsContainer || typeof HUIKE_2025_STRUCTURE === 'undefined') return;

    tabsContainer.innerHTML = '';
    const allTab = document.createElement('button');
    const allActive = !currentHuikeFolderId;
    allTab.className = `btn btn-sm ${allActive ? 'btn-primary' : 'btn-ghost'}`;
    allTab.style.cssText = 'font-size: 0.85rem; padding: 6px 14px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;';
    allTab.textContent = `全部分類（${monitoringNews.length}）`;
    allTab.addEventListener('click', () => {
        currentHuikeFolderId = '';
        activeHuikeKeyword = '';
        const keywordInput = document.getElementById('filterKeyword');
        if (keywordInput) keywordInput.value = '';
        renderHuikeTabs();
        renderHuikeChips();
        applyNewsFilters();
    });
    tabsContainer.appendChild(allTab);
    HUIKE_2025_STRUCTURE.forEach(folder => {
        const count = getFolderNewsCount(folder.id);
        const tabBtn = document.createElement('button');
        const isActive = (folder.id === currentHuikeFolderId);
        tabBtn.className = `btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`;
        tabBtn.style.cssText = 'font-size: 0.85rem; padding: 6px 14px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;';
        tabBtn.innerHTML = `<span>${folder.icon}</span> <strong>${folder.folderName}</strong> <span style="background:${isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0'}; color:${isActive ? '#fff' : '#475569'}; font-size:0.75rem; padding:1px 6px; border-radius:10px; font-weight:700;">${count}</span>`;
        
        tabBtn.addEventListener('click', () => {
            currentHuikeFolderId = folder.id;
            activeHuikeKeyword = '';
            const keywordInput = document.getElementById('filterKeyword');
            if (keywordInput) keywordInput.value = '';
            renderHuikeTabs();
            renderHuikeChips();
            applyNewsFilters();
        });

        tabsContainer.appendChild(tabBtn);
    });
}

function renderHuikeFullKeywordDisclosure(currentFolder) {
    const details = document.getElementById('huikeFullKeywordDetails');
    const summary = document.getElementById('huikeFullKeywordSummary');
    const content = document.getElementById('huikeFullKeywordContent');
    if (!details || !summary || !content) return;

    const rules = currentFolder ? getManifestRulesForFolder(currentFolder.id) : [];
    if (!currentFolder || !rules.length) {
        details.hidden = true;
        summary.textContent = '完整關鍵字與監測規則';
        content.replaceChildren();
        return;
    }

    const allKeywords = currentFolder.allKeywords || getRuleTerms(rules);
    details.hidden = false;
    summary.textContent = `完整關鍵字與監測規則（${allKeywords.length} 個條件詞）`;
    content.replaceChildren();

    const intro = document.createElement('p');
    intro.className = 'huike-full-keywords-intro';
    intro.textContent = '以下依實際新聞監測規則分組；標示為 A、B 的群組必須各至少命中一個詞，才會列入新聞結果。這些詞僅供核對規則，不會個別套用成過度寬鬆的篩選。';
    content.appendChild(intro);

    rules.forEach((rule) => {
        const ruleCard = document.createElement('article');
        ruleCard.className = 'huike-rule-card';

        const header = document.createElement('div');
        header.className = 'huike-rule-header';
        const title = document.createElement('h4');
        title.className = 'huike-rule-title';
        title.textContent = rule.display_name || '監測規則';
        header.appendChild(title);
        if (rule.scope_note) {
            const scope = document.createElement('p');
            scope.className = 'huike-rule-note';
            scope.textContent = rule.scope_note;
            header.appendChild(scope);
        }
        ruleCard.appendChild(header);

        const groups = (rule.required_any_groups || []).filter((group) => Array.isArray(group) && group.length);
        const logic = document.createElement('p');
        logic.className = 'huike-rule-logic';
        logic.textContent = groups.length > 1
            ? `命中條件：下列 ${groups.length} 組條件必須同時成立；每一組任一詞命中即可。`
            : '命中條件：下列任一關鍵字命中即可。';
        ruleCard.appendChild(logic);

        const groupsContainer = document.createElement('div');
        groupsContainer.className = 'huike-rule-groups';
        groups.forEach((group, groupIndex) => {
            const groupSection = document.createElement('section');
            groupSection.className = 'huike-rule-group';
            const groupTitle = document.createElement('h5');
            const groupLetter = String.fromCharCode(65 + groupIndex);
            groupTitle.textContent = groups.length > 1 ? `條件 ${groupLetter}（任一）` : '關鍵字（任一）';
            groupSection.appendChild(groupTitle);

            const termList = document.createElement('div');
            termList.className = 'huike-rule-term-list';
            group.forEach((term) => {
                const termTag = document.createElement('span');
                termTag.className = 'huike-rule-term';
                termTag.textContent = term;
                termList.appendChild(termTag);
            });
            groupSection.appendChild(termList);
            groupsContainer.appendChild(groupSection);
        });
        ruleCard.appendChild(groupsContainer);

        if (Array.isArray(rule.exclude_any) && rule.exclude_any.length) {
            const exclusions = document.createElement('p');
            exclusions.className = 'huike-rule-exclusions';
            exclusions.textContent = `排除詞：${rule.exclude_any.join('、')}`;
            ruleCard.appendChild(exclusions);
        }
        content.appendChild(ruleCard);
    });
}

function renderHuikeChips() {
    const chipsContainer = document.getElementById('huikeKeywordChips');
    const descEl = document.getElementById('huikeFolderDesc');
    const clearBtn = document.getElementById('clearHuikeFilterBtn');
    if (!chipsContainer || typeof HUIKE_2025_STRUCTURE === 'undefined') return;

    const currentFolder = HUIKE_2025_STRUCTURE.find(f => f.id === currentHuikeFolderId);
    if (!currentFolder) {
        if (descEl) descEl.textContent = '全部五大監測分類：選擇一個資料夾可使用其精選關鍵字快速篩選。';
        chipsContainer.innerHTML = '';
        if (clearBtn) clearBtn.style.display = 'none';
        renderHuikeFullKeywordDisclosure(null);
        return;
    }

    const quickKeywords = currentFolder.quickKeywords || currentFolder.keywords || [];
    const keywordCount = (currentFolder.allKeywords || quickKeywords).length;
    if (descEl) {
        descEl.textContent = `${currentFolder.icon} ${currentFolder.desc}。精選 ${quickKeywords.length} 個快速篩選；完整 ${keywordCount} 個條件詞與組合規則已收合於下方。`;
    }

    chipsContainer.innerHTML = '';

    quickKeywords.forEach(kw => {
        const count = getKeywordNewsCount(kw);
        const chip = document.createElement('button');
        const isActive = (activeHuikeKeyword === kw);
        chip.className = 'huike-chip';
        chip.style.cssText = `
            border: 1px solid ${isActive ? '#e76f51' : (count > 0 ? '#fb923c' : '#cbd5e1')};
            background: ${isActive ? '#e76f51' : (count > 0 ? '#fff7ed' : '#ffffff')};
            color: ${isActive ? '#ffffff' : (count > 0 ? '#c2410c' : '#334155')};
            font-size: 0.8rem;
            padding: 4px 10px;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: ${isActive || count > 0 ? '700' : '500'};
            display: inline-flex;
            align-items: center;
            gap: 4px;
        `;
        
        const countBadge = count > 0 
            ? `<span style="background:${isActive ? '#ffffff' : '#f97316'}; color:${isActive ? '#e76f51' : '#ffffff'}; font-size:0.7rem; padding:1px 5px; border-radius:10px; font-weight:800;">${count}</span>` 
            : '';
        chip.innerHTML = `${kw} ${countBadge}`;

        chip.addEventListener('click', () => {
            if (activeHuikeKeyword === kw) {
                activeHuikeKeyword = '';
                const kwInput = document.getElementById('filterKeyword');
                if (kwInput) kwInput.value = '';
                if (clearBtn) clearBtn.style.display = 'none';
            } else {
                activeHuikeKeyword = kw;
                const kwInput = document.getElementById('filterKeyword');
                if (kwInput) kwInput.value = kw;
                if (clearBtn) clearBtn.style.display = 'inline-block';
            }
            renderHuikeChips();
            applyNewsFilters();
        });

        chipsContainer.appendChild(chip);
    });
    renderHuikeFullKeywordDisclosure(currentFolder);
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

    // 網站與 API 均只保留「今天往前兩個月」的監測窗口。
    constrainMonitoringDateInputs(dateFromInput, dateToInput);

    if (categorySelect) categorySelect.addEventListener('change', applyNewsFilters);
    if (sourceSelect) sourceSelect.addEventListener('change', applyNewsFilters);
    if (keywordInput) keywordInput.addEventListener('input', applyNewsFilters);
    const onDateRangeChange = () => {
        constrainMonitoringDateInputs(dateFromInput, dateToInput);
        applyNewsFilters();
    };
    if (dateFromInput) dateFromInput.addEventListener('change', onDateRangeChange);
    if (dateToInput) dateToInput.addEventListener('change', onDateRangeChange);

    const sortToggleBtn = document.getElementById('sortToggle');
    if (sortToggleBtn && !sortToggleBtn.dataset.bound) {
        sortToggleBtn.dataset.bound = 'true';
        sortToggleBtn.addEventListener('click', () => {
            const currentSort = sortToggleBtn.getAttribute('data-sort') || 'desc';
            const newSort = currentSort === 'desc' ? 'asc' : 'desc';
            sortToggleBtn.setAttribute('data-sort', newSort);
            const span = sortToggleBtn.querySelector('span');
            if (span) {
                span.textContent = newSort === 'desc' ? '發布時間：最新優先' : '發布時間：最舊優先';
            }
            applyNewsFilters();
        });
    }
}

function applyNewsFilters() {
    const activeCompBtns = document.querySelectorAll('.company-toggle-btn.active');
    const selectedCompanies = Array.from(activeCompBtns).map(btn => btn.getAttribute('data-id'));

    const selectedCategory = document.getElementById('filterCategory')?.value || '';
    const selectedSource = document.getElementById('filterSource')?.value || '';
    const keyword = document.getElementById('filterKeyword')?.value.toLowerCase().trim() || '';
    const dateFromInput = document.getElementById('filterDateFrom');
    const dateToInput = document.getElementById('filterDateTo');
    constrainMonitoringDateInputs(dateFromInput, dateToInput);
    const dateFrom = dateFromInput?.value || '';
    const dateTo = dateToInput?.value || '';

    filteredNews = monitoringNews.filter(news => {
        const newsFolders = news.huikeFolders || [news.huikeFolder];
        const matchCompany = news.companyId === 'monitoring' || selectedCompanies.includes(news.companyId);
        const matchFolder = !currentHuikeFolderId || newsFolders.includes(currentHuikeFolderId);
        const matchCategory = !selectedCategory || news.category === selectedCategory;
        const matchSource = !selectedSource || 
                            news.source === selectedSource || 
                            (news.source && news.source.includes(selectedSource)) ||
                            (news.source && selectedSource.includes(news.source));
        const searchable = [
            news.title, news.excerpt, news.companyName, news.huikeKeyword,
            ...(news.matchedTerms || []), ...(news.ruleIds || [])
        ].filter(Boolean).join(' ').toLowerCase();
        const matchKeyword = !keyword || searchable.includes(keyword);
        
        let matchDate = true;
        if (dateFrom && news.date < dateFrom) matchDate = false;
        if (dateTo && news.date > dateTo) matchDate = false;

        return matchCompany && matchFolder && matchCategory && matchSource && matchKeyword && matchDate;
    });

    // 依發布日期排序 (預設最新優先)
    const sortOrder = document.getElementById('sortToggle')?.getAttribute('data-sort') || 'desc';
    filteredNews.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return sortOrder === 'asc' 
            ? a.date.localeCompare(b.date) 
            : b.date.localeCompare(a.date);
    });

    currentNewsPage = 1;
    renderNews(false);
}

function highlightKeyword(text, keyword) {
    const safeText = escapeHtml(text || '');
    if (!text || !keyword) return safeText;
    const cleanKw = keyword.trim();
    if (!cleanKw) return safeText;
    try {
        const regex = new RegExp(`(${cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return safeText.replace(regex, '<mark style="background:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">$1</mark>');
    } catch (e) {
        return safeText;
    }
}

function isMostlyEnglishText(value) {
    const text = String(value || '');
    const latinCount = (text.match(/[A-Za-z]/g) || []).length;
    const chineseCount = (text.match(/[\u3400-\u9fff]/g) || []).length;
    return latinCount >= 24 && latinCount > chineseCount * 2;
}

function getTimelineDisplayExcerpt(news) {
    const rawExcerpt = String(news?.excerpt || '');
    if (!isMostlyEnglishText(rawExcerpt)) return rawExcerpt;

    // 國際英文 RSS 常把全文摘要放在同一欄。先取第一段，再採金融科技
    // 卡片相同的 300 字摘要上限，避免時間軸被長篇英文占滿。
    const firstParagraph = plainFintechText(rawExcerpt)
        .replace(/\r\n?/g, '\n')
        .split(/\n\s*\n/)[0]
        .replace(/\s+/g, ' ')
        .trim();
    return truncateFintechText(firstParagraph, 300);
}

function renderNews(append = false) {
    const container = document.getElementById('timelineContainer');
    const loadMoreBtn = document.getElementById('timelineLoadMore');
    const countEl = document.getElementById('filterResultCount');
    const currentKeyword = document.getElementById('filterKeyword')?.value.trim() || activeHuikeKeyword;
    const dataMode = countEl?.dataset.dataMode || 'unavailable';

    if (!container) return;

    if (!append) {
        container.innerHTML = '';
    }

    if (countEl) {
        const modes = {
            loading: '正在載入真實新聞',
            verified: '官方 RSS＋Google News 聚合真實新聞',
            unavailable: '真實新聞服務目前無法驗證'
        };
        const mode = modes[dataMode] || modes.unavailable;
        countEl.textContent = `共 ${filteredNews.length} 則符合條件｜${mode}`;
    }

    const startIndex = (currentNewsPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    const newsToShow = filteredNews.slice(startIndex, endIndex);

    if (filteredNews.length === 0) {
        const emptyState = {
            loading: {
                icon: '⏳', title: '正在讀取真實新聞',
                message: '系統正在確認來源健康狀態、近兩個月日期範圍與關鍵字命中結果。', reset: false
            },
            unavailable: {
                icon: '⚠️', title: '真實新聞服務暫時無法驗證',
                message: '為避免未驗證內容被誤認為新聞，頁面不會改顯示展示資料。請稍後重新整理。', reset: false
            },
            verified: {
                icon: '🔍', title: '目前沒有可顯示的真實新聞',
                message: '頁面只顯示官方 RSS 或 Google News RSS 聚合來源且命中規則的文章。請確認上方來源狀態，或調整資料夾與關鍵字條件。', reset: true
            }
        }[dataMode] || null;
        const state = emptyState || {
            icon: '⚠️', title: '真實新聞服務暫時無法驗證',
            message: '為避免未驗證內容被誤認為新聞，頁面不會改顯示展示資料。請稍後重新整理。', reset: false
        };
        container.innerHTML = `
            <div style="text-align:center; padding: 48px 20px; color: var(--text-muted); background: #f8fafc; border-radius: 12px; border: 1px dashed var(--border-color);">
                <div style="font-size: 2rem; margin-bottom: 8px;">${state.icon}</div>
                <h4 style="font-size: 1.1rem; color: #334155; margin-bottom: 6px;">${state.title}</h4>
                <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 16px;">${state.message}</p>
                ${state.reset ? '<button class="btn btn-primary btn-sm" id="resetNewsFiltersBtn" style="padding: 6px 18px; border-radius: 20px;">↻ 一鍵重設為近兩個月全部新聞</button>' : ''}
            </div>
        `;
        const resetBtn = document.getElementById('resetNewsFiltersBtn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                const kwInput = document.getElementById('filterKeyword');
                const catSelect = document.getElementById('filterCategory');
                const srcSelect = document.getElementById('filterSource');
                const fromInput = document.getElementById('filterDateFrom');
                const toInput = document.getElementById('filterDateTo');
                if (kwInput) kwInput.value = '';
                if (catSelect) catSelect.value = '';
                if (srcSelect) srcSelect.value = '';
                const rollingRange = getRollingMonitoringDateRange();
                if (fromInput) fromInput.value = rollingRange.from;
                if (toInput) toInput.value = rollingRange.to;
                currentHuikeFolderId = '';
                activeHuikeKeyword = '';
                const clearBtn = document.getElementById('clearHuikeFilterBtn');
                if (clearBtn) clearBtn.style.display = 'none';
                renderHuikeTabs();
                renderHuikeChips();
                applyNewsFilters();
            };
        }
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    newsToShow.forEach(news => {
        const item = document.createElement('div');
        item.className = 'timeline-item animate-on-scroll is-visible';
        const brandColor = safeCssColor(news.companyColor);
        const companyId = escapeHtml(news.companyId || 'monitoring');
        const companyName = escapeHtml(news.companyName || '真實新聞監測');
        const category = escapeHtml(news.category || '關鍵字監測');
        const source = escapeHtml(news.source || '來源未提供');
        const date = escapeHtml(news.date || '日期未提供');
        const collectedDate = escapeHtml(news.collectedDate || '未提供');
        const reviewLabel = news.reviewState === 'approved' ? '自動通過' : '待人工覆核';
        const huikeKeyword = escapeHtml(news.huikeKeyword || '');
        item.style.setProperty('--item-brand-color', brandColor);
        
        const verifiedBadge = news.sourceKind === 'google_news_rss'
            ? '<span style="background:#e0f2fe;color:#075985;font-size:0.7rem;padding:2px 7px;border-radius:20px;font-weight:700;margin-left:8px;vertical-align:middle;">↗ Google News 聚合</span>'
            : (news.verifiedMonitoring
                ? '<span style="background:#dcfce7;color:#166534;font-size:0.7rem;padding:2px 7px;border-radius:20px;font-weight:700;margin-left:8px;vertical-align:middle;">✓ 已驗證官方 RSS</span>'
                : '');

        const huikeBadge = huikeKeyword
            ? `<span class="tag-huike-chip" data-kw="${huikeKeyword}" style="background:#fff1ee; color:#c84b31; border:1px solid #ffd8d0; font-size:0.75rem; padding:2px 8px; border-radius:12px; font-weight:700; margin-left:6px; vertical-align:middle; cursor:pointer;" title="點擊以此關鍵字篩選">📌 ${huikeKeyword}</span>`
            : '';

        const directUrl = safeHttpUrl(news.url);
        const targetUrl = escapeHtml(directUrl);
        const hasOriginalLink = directUrl !== '#';

        const displayTitle = highlightKeyword(news.title, currentKeyword);
        const displayExcerpt = highlightKeyword(getTimelineDisplayExcerpt(news), currentKeyword);
        const titleContent = hasOriginalLink
            ? `<a href="${targetUrl}" target="_blank" rel="noopener" style="color: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" onmouseover="this.style.color='${brandColor}'" onmouseout="this.style.color='inherit'">${displayTitle} <span style="font-size:0.85rem;">↗</span></a>`
            : `<span style="color:inherit;">${displayTitle}</span>`;
        const originalLink = hasOriginalLink
            ? `<a href="${targetUrl}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: underline; font-weight: 600; font-size:0.82rem;">開啟完整新聞 ↗</a>`
            : '<span style="color:#64748b; font-size:0.82rem;">原文連結不可用</span>';

        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="timeline-card-header">
                    <div>
                        <span class="timeline-company-badge" data-comp-id="${companyId}" style="background: ${brandColor}18; color: ${brandColor}; cursor:pointer;" title="${news.sourceKind === 'google_news_rss' ? 'Google News RSS 聚合監測' : '官方 RSS 監測'}">
                            ${companyName}
                        </span>
                        ${huikeBadge}
                    </div>
                    <span class="timeline-date">📅 ${date}</span>
                </div>
                <h4 class="timeline-title">
                    ${titleContent}
                    ${verifiedBadge}
                </h4>
                <p class="timeline-excerpt">${displayExcerpt}</p>
                <div class="timeline-footer" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; gap:8px; align-items:center;">
                        <span class="timeline-category" data-cat="${category}" style="cursor:pointer;" title="點擊篩選該類別">🏷️ ${category}</span>
                        <span class="timeline-source-badge" data-src="${source}" style="background:#f1f5f9; color:#475569; font-size:0.75rem; padding:3px 8px; border-radius:6px; cursor:pointer; font-weight:600;" title="點擊篩選此媒體">📰 ${source}</span>
                    </div>
                    ${originalLink}
                </div>
                <details class="timeline-provenance-details">
                    <summary class="timeline-provenance-toggle">來源與資料類型</summary>
                    <div class="timeline-provenance">原文發布：${date}｜本站收錄：${collectedDate}｜覆核狀態：${reviewLabel}</div>
                </details>
            </div>
        `;

        const matchedTerms = [...new Set((news.matchedTerms || []).filter(Boolean))];
        const ruleIds = [...new Set((news.ruleIds || []).filter(Boolean))];
        if (matchedTerms.length || ruleIds.length) {
            const evidence = document.createElement('div');
            evidence.style.cssText = 'margin:10px 0; padding:8px 10px; background:#f8fafc; border-left:3px solid #0f766e; border-radius:4px; font-size:0.78rem; color:#475569; line-height:1.55;';
            const label = document.createElement('strong');
            label.textContent = '規則命中證據：';
            evidence.appendChild(label);
            if (matchedTerms.length) {
                const terms = document.createElement('span');
                terms.textContent = ` 關鍵字 ${matchedTerms.join('、')}`;
                evidence.appendChild(terms);
            }
            if (ruleIds.length) {
                const rules = document.createElement('span');
                rules.style.marginLeft = '8px';
                rules.textContent = `規則 ${ruleIds.join('、')}`;
                evidence.appendChild(rules);
            }
            item.querySelector('.timeline-footer')?.before(evidence);
        }

        // 綁定卡片內標籤點選一鍵過濾事件
        const chipEl = item.querySelector('.tag-huike-chip');
        if (chipEl) {
            chipEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const kw = chipEl.getAttribute('data-kw');
                if (kw) {
                    activeHuikeKeyword = kw;
                    const kwInput = document.getElementById('filterKeyword');
                    if (kwInput) kwInput.value = kw;
                    const clearBtn = document.getElementById('clearHuikeFilterBtn');
                    if (clearBtn) clearBtn.style.display = 'inline-block';
                    renderHuikeChips();
                    applyNewsFilters();
                }
            });
        }

        const catEl = item.querySelector('.timeline-category');
        if (catEl) {
            catEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const cat = catEl.getAttribute('data-cat');
                const catSelect = document.getElementById('filterCategory');
                if (catSelect && cat) {
                    catSelect.value = cat;
                    applyNewsFilters();
                }
            });
        }

        const srcEl = item.querySelector('.timeline-source-badge');
        if (srcEl) {
            srcEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const src = srcEl.getAttribute('data-src');
                const srcSelect = document.getElementById('filterSource');
                if (srcSelect && src) {
                    srcSelect.value = src;
                    applyNewsFilters();
                }
            });
        }

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
