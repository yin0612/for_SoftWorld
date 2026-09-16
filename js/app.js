document.addEventListener('DOMContentLoaded', () => {
    // 確保資料已載入
    if (typeof COMPANIES === 'undefined' || typeof PRESS_RELEASES === 'undefined') {
        console.error('Data not loaded. Make sure data.js is included before app.js');
        return;
    }

    renderCompanyCards();
    initStatsOverview();
    initNewsSection();
    initFintechMonitoringPage();
    initNavbar();
    initHashRouter();
    initBackToTop();
});

// 1. Hash SPA 獨立切頁路由器 (點選目錄只顯示該項獨立頁面)
function initHashRouter() {
    const pages = ['companies', 'news', 'fintech', 'analytics', 'compare', 'trends', 'methodology'];

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
        const eventSourceUrl = safeHttpUrl(company.eventSourceUrl || company.newsUrl || company.mopsUrl);
        const eventSourceLabel = company.eventSourceLabel || (company.newsUrl ? '官方新聞專區' : 'MOPS 公開資訊觀測站');
        
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
            <div class="company-event-summary" style="border-left-color: ${company.brandColor || company.color};">
                <div class="company-event-heading">
                    <span style="font-weight: 700; color: ${company.brandColor || company.color};">近期重要事件</span>
                    <span class="data-type-badge data-type-curated">✎ 人工整理・待查核</span>
                </div>
                <span style="color: #475569; line-height: 1.5; display: block;">${newsText}</span>
                <span class="company-event-source">來源入口：<a href="${eventSourceUrl}" target="_blank" rel="noopener">${eventSourceLabel} ↗</a>｜最後查核：待補</span>
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
    const eventSourceUrl = safeHttpUrl(company.eventSourceUrl || company.newsUrl || company.mopsUrl);
    const eventSourceLabel = company.eventSourceLabel || (company.newsUrl ? '官方新聞專區' : 'MOPS 公開資訊觀測站');

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
        <div class="company-event-summary" style="border-left-color: ${company.brandColor || company.color};">
            <div class="company-event-heading">
                <h4 style="font-size: 0.9rem; color: var(--primary); margin: 0;">近期重要事件</h4>
                <span class="data-type-badge data-type-curated">✎ 人工整理・待查核</span>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-primary);">${company.latestNews || company.recentNews || '資料彙整中'}</p>
            <p class="company-event-source">來源入口：<a href="${eventSourceUrl}" target="_blank" rel="noopener">${eventSourceLabel} ↗</a>；請逐筆查核｜最後查核：待補</p>
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

// 彈出下鑽溯源 Modal 視窗 (Provenance Modal)
function showProvenanceModal(companyNameOrId, month, docs) {
    const modal = document.getElementById('companyModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    // 1. 查找公司物件
    let company = COMPANIES.find(c => c.name === companyNameOrId || c.id === companyNameOrId);
    if (!company && typeof companyNameOrId === 'string') {
        company = COMPANIES.find(c => c.name.includes(companyNameOrId) || companyNameOrId.includes(c.name));
    }
    const compName = company ? company.name : companyNameOrId;
    const compId = company ? company.id : 'soft-world';
    const brandColor = company ? company.brandColor : '#e76f51';

    // 2. 查找該月份之統計數據 (包含全網媒體報導曝光總數量)
    let monthStat = null;
    if (typeof MONTHLY_STATS !== 'undefined' && MONTHLY_STATS[compId]) {
        monthStat = MONTHLY_STATS[compId].find(s => s.month === month);
    }
    const totalCoverage = monthStat ? monthStat.mediaCoverage : (docs ? docs.length : 0);
    const prCount = monthStat ? monthStat.pressReleaseCount : 1;

    // 3. 渲染精選重點新聞稿清單 (包含實體文章超連結)
    const items = Array.isArray(docs) ? docs : (docs?.items || []);
    let curatedHtml = '';
    if (items.length > 0) {
        curatedHtml = items.map(d => {
            const targetUrl = (d.url && d.url.startsWith('http')) 
                ? d.url 
                : getMediaSearchUrl(d.source_domain, compName);
            const syntheticTag = d.synthetic 
                ? `<span style="background:#fef3c7; color:#92400e; font-size:0.75rem; padding:2px 7px; border-radius:12px; font-weight:700; margin-left:6px;">🤖 模擬資料</span>` 
                : '';

            return `
                <li style="margin-bottom: 12px; padding: 12px 14px; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; list-style: none; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                    <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 6px;">
                        <a href="${targetUrl}" target="_blank" rel="noopener" style="color: ${brandColor}; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                            📌 ${d.title} ${syntheticTag} <span style="font-size:0.85rem; margin-left:2px;">↗</span>
                        </a>
                    </div>
                    ${d.excerpt ? `<p style="font-size: 0.85rem; color: #475569; margin: 4px 0 8px 0; line-height: 1.5;">${d.excerpt}</p>` : ''}
                    <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
                        <span>📅 發布日期：${d.published_at}</span>
                        <span>📰 來源：<strong>${d.source_domain}</strong></span>
                        ${d.category ? `<span style="background:${brandColor}15; color:${brandColor}; padding:2px 8px; border-radius:12px; font-weight:600; font-size:0.75rem;">🏷️ ${d.category}</span>` : ''}
                        <a href="${targetUrl}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: underline; font-weight: 600; margin-left: auto;">開啟新聞原文 ↗</a>
                    </div>
                </li>
            `;
        }).join('');
    } else {
        const fallbackUrl = company ? (company.newsUrl || company.website) : 'https://www.google.com';
        curatedHtml = `
            <div style="text-align:center; padding: 20px; color: var(--text-muted); background: #f8fafc; border-radius: 8px; border: 1px dashed var(--border-color);">
                該月份暫無登記之精選新聞稿紀錄。<br>
                <a href="${fallbackUrl}" target="_blank" rel="noopener" style="color:${brandColor}; font-weight:700; text-decoration:underline; display:inline-block; margin-top:8px;">
                    → 前往 ${compName} 官方新聞專區 ↗
                </a>
            </div>
        `;
    }

    // 4. 渲染 10 大觀測媒體通路之篇數估算與直達報導檢索連結
    let channelsHtml = '';
    const channelMix = (typeof MEDIA_CHANNELS !== 'undefined' && MEDIA_CHANNELS[compId]) ? MEDIA_CHANNELS[compId] : {};
    const channelEntries = Object.entries(channelMix);

    if (channelEntries.length > 0) {
        channelsHtml = channelEntries.map(([channelName, pct]) => {
            const estCount = Math.max(1, Math.round((totalCoverage * pct) / 100));
            const searchUrl = getMediaSearchUrl(channelName, compName);
            return `
                <a href="${searchUrl}" target="_blank" rel="noopener" 
                   style="display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; text-decoration: none; color: #334155; font-size: 0.85rem; font-weight: 500; transition: all 0.2s ease;"
                   onmouseover="this.style.borderColor='${brandColor}'; this.style.backgroundColor='${brandColor}08'; this.style.color='${brandColor}';" 
                   onmouseout="this.style.borderColor='#e2e8f0'; this.style.backgroundColor='#ffffff'; this.style.color='#334155';">
                    <span>📰 ${channelName}</span>
                    <span style="font-weight: 700; color: ${brandColor}; font-size: 0.8rem;">約 ${estCount} 則報導 ↗</span>
                </a>
            `;
        }).join('');
    }

    // 5. 組裝完整 Modal HTML
    modalBody.innerHTML = `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <span class="section-tag" style="background: ${brandColor}15; color: ${brandColor}; border: 1px solid ${brandColor}30; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.8rem;">
                    🔍 數據下鑽溯源 (Data Provenance)
                </span>
                <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">觀測月份：${month}</span>
            </div>
            <h2 style="font-size: 1.4rem; color: #1e293b; margin: 6px 0 12px 0; font-weight: 700;">
                ${compName} · ${month} 媒體聲量數據與報導連結
            </h2>
            
            <!-- 數據總覽統計卡 -->
            <div style="background: linear-gradient(135deg, ${brandColor}0D, ${brandColor}1A); border: 1px solid ${brandColor}35; padding: 16px 20px; border-radius: 12px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
                <div>
                    <div style="font-size: 0.85rem; color: #475569; font-weight: 600;">📈 全網估算媒體報導總聲量</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: ${brandColor}; line-height: 1.2;">
                        ${totalCoverage.toLocaleString()} <span style="font-size: 0.95rem; font-weight: 600;">則報導曝光</span>
                    </div>
                </div>
                <div style="text-align: right; font-size: 0.85rem; color: #475569; line-height: 1.6;">
                    <div>公關新聞稿發布：<strong style="color:#1e293b;">${prCount} 篇</strong></div>
                    <div>涵蓋觀測頻道：<strong style="color:#1e293b;">10 大媒體通路</strong></div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <!-- 區塊一：精選重點新聞 -->
            <h4 style="font-size: 0.95rem; color: #1e293b; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>📌 本月精選重點新聞與報導原文</span>
                <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">(點擊標題直接開啟報導網頁)</span>
            </h4>
            <ul style="padding: 0; margin: 0 0 20px 0; max-height: 220px; overflow-y: auto;">
                ${curatedHtml}
            </ul>

            <!-- 區塊二：10 大媒體頻道檢索 -->
            <h4 style="font-size: 0.95rem; color: #1e293b; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>🌐 全網 10 大觀測媒體聲量分佈與即時報導檢索</span>
                <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">(點擊各媒體開啟即時搜尋超連結)</span>
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; margin-bottom: 16px; max-height: 180px; overflow-y: auto;">
                ${channelsHtml}
            </div>
        </div>

        <!-- 數據說明敘述 -->
        <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.8rem; color: #64748b; line-height: 1.5; border: 1px solid #e2e8f0;">
            <strong>💡 數據來源與檢索說明：</strong>
            本月媒體報導總聲量（${totalCoverage} 則）包含官方新聞稿發布、各大科技財經媒體報導及全網曝光追蹤。上方精選新聞提供發布原文直接連結；其他觀測頻道報導亦可點擊對應媒體按鈕進行即時關鍵字報導檢索。
        </div>

        <!-- 底部快捷按鈕 -->
        <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${company && company.newsUrl ? `<a href="${company.newsUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="font-size: 0.85rem;">📰 官方新聞發布專區 ↗</a>` : ''}
                <a href="${company && company.mopsUrl ? company.mopsUrl : 'https://mops.twse.com.tw/mops/#/web/home'}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="font-size: 0.85rem;">🏛️ MOPS 公開資訊觀測站 ↗</a>
            </div>
            <button class="btn btn-primary btn-sm" id="provenanceCloseBtn" style="padding: 6px 20px;">關閉視窗</button>
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

    const elNews = document.getElementById('statTotalNews');
    const elCoverage = document.getElementById('statTotalCoverage');
    const elSocial = document.getElementById('statTotalSocial');
    const elKol = document.getElementById('statTotalKol');

    if (elNews) { elNews.textContent = totalPR.toLocaleString(); elNews.setAttribute('data-target', totalPR); }
    if (elCoverage) { elCoverage.textContent = totalCoverage.toLocaleString(); elCoverage.setAttribute('data-target', totalCoverage); }
    if (elSocial) { elSocial.textContent = totalSocial.toLocaleString(); elSocial.setAttribute('data-target', totalSocial); }
    if (elKol) { elKol.textContent = totalKol.toLocaleString(); elKol.setAttribute('data-target', totalKol); }

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
// 國內支付是此頁主要監測目的；首次進入與清除篩選都回到台灣支付視圖。
let fintechMode = 'taiwan';
let fintechPage = 1;
const FINTECH_PER_PAGE = 12;
const FINTECH_FOLDER_IDS = new Set(['folder_2', 'folder_5', 'folder_6']);
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
    const liveFallback = Number(monitoringLoadState?.liveFallbackCount || 0);
    if (monitoringDataMode === 'verified') {
        const updated = lastRun ? `最後成功更新 ${lastRun}（台北時間）` : '最後成功更新時間待服務回報';
        const liveSourceText = liveSourceCount ? `；台灣即時補位來源設定 ${liveSourceCount} 個` : '';
        const liveText = liveFallback ? `；新增台灣來源即時補位 ${liveFallback} 篇` : '';
        statusText.textContent = `真實新聞：${range.from} 至 ${range.to}｜健康 RSS ${sources} 個（台灣 ${taiwanSources} 個）｜${updated}${liveSourceText}${liveText}；模擬圖表僅供教學比較。`;
    } else if (monitoringDataMode === 'loading') {
        statusText.textContent = '真實新聞：正在確認 RSS 來源與近兩個月資料；模擬圖表僅供教學比較。';
    } else {
        statusText.textContent = '真實新聞服務目前無法驗證；頁面不會以模擬內容補足。模擬圖表仍標示為教學資料。';
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
        const quickKeywords = folder.keywords.filter((keyword) => exactKeywords.includes(keyword));
        folder.keywords = (quickKeywords.length ? quickKeywords : exactKeywords).slice(0, 24);
        folder.allKeywords = exactKeywords;
        folder.ruleCount = ruleCount;
        if (sourceFolder) {
            folder.folderName = `${index + 1}. ${sourceFolder.name}`;
            folder.desc = sourceFolder.description;
        }
        folder.desc = `${folder.desc}。完整規則 ${ruleCount} 組、別名詞 ${exactKeywords.length} 個`;
    });
    renderMonitoringTransparency();
}

function renderMonitoringTransparency() {
    const panel = document.getElementById('monitoringTransparency');
    if (!panel) return;
    panel.innerHTML = '';

    const summary = document.createElement('p');
    summary.style.cssText = 'margin:0; font-size:0.86rem; line-height:1.6; color:#334155;';
    const sources = monitoringRuntimeStatus?.source_summary || {};
    const articles = monitoringRuntimeStatus?.article_summary || {};
    const catalog = monitoringRuntimeStatus?.media_catalog_summary || {};
    const loadText = monitoringLoadState && !monitoringLoadState.complete
        ? ` 公開結果目前僅完整載入 ${monitoringLoadState.loaded}/${monitoringLoadState.total} 篇，請重新整理後再確認。`
        : '';
    const liveFallbackText = monitoringLoadState?.liveFallbackCount
        ? ` 本次另有 ${monitoringLoadState.liveFallbackCount} 篇由新增台灣 RSS 即時唯讀補位，排程成功後會自動去重並寫入資料庫。`
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
        ? `已啟用 ${sources.enabled || 0} 個官方 RSS 管道（健康 ${sources.healthy || 0} 個；台灣來源 ${Array.isArray(monitoringRuntimeStatus.enabled_sources) ? monitoringRuntimeStatus.enabled_sources.filter((source) => source?.region === 'TW' && source?.health_status === 'healthy').length : 0} 個）；另有 ${monitoringRuntimeStatus.live_fallback_source_count || 0} 個台灣來源提供唯讀即時補位；文件媒體清單 ${catalog.total || 0} 家，其中 ${catalog.verified_rss || 0} 家已完成 RSS 驗證；已公開 ${articles.approved || 0} 篇真實文章，${articles.pending || 0} 篇寬鬆規則命中資料待覆核。`
        : '正在讀取來源健康與收錄狀態。';
    summary.textContent = `真實性原則：僅顯示已驗證公開 RSS 來源、命中年度監測規則且附原文連結的文章；不顯示展示資料。${statusText}${loadText}${liveFallbackText}${configSyncText}`;
    panel.appendChild(summary);

    if (!monitoringManifest) return;
    if (monitoringManifest.automatic_publication_note) {
        const note = document.createElement('p');
        note.style.cssText = 'margin:8px 0 0; font-size:0.82rem; line-height:1.55; color:#0f766e;';
        note.textContent = `發布保護：${monitoringManifest.automatic_publication_note}`;
        panel.appendChild(note);
    }
    const details = document.createElement('details');
    details.style.marginTop = '10px';
    const title = document.createElement('summary');
    title.textContent = '查看監測文件完整規則與關鍵字';
    title.style.cssText = 'cursor:pointer; font-weight:700; color:#0f766e;';
    details.appendChild(title);

    monitoringManifest.folders.forEach((folder) => {
        const section = document.createElement('div');
        section.style.cssText = 'margin-top:10px; padding-top:10px; border-top:1px solid #e2e8f0;';
        const heading = document.createElement('strong');
        heading.textContent = `${folder.name}｜來源區域：${(folder.region_scope || []).join('、')}`;
        section.appendChild(heading);
        const list = document.createElement('ul');
        list.style.cssText = 'margin:6px 0 0 18px; padding:0; font-size:0.82rem; color:#475569;';
        monitoringManifest.rules.filter((rule) => rule.folder_id === folder.id).forEach((rule) => {
            const item = document.createElement('li');
            const groups = (rule.required_any_groups || []).map((group) => group.join('、')).join(' ＋ ');
            item.textContent = `${rule.display_name}（${rule.scope_note}）：${groups}`;
            list.appendChild(item);
        });
        section.appendChild(list);
        details.appendChild(section);
    });
    panel.appendChild(details);
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

    const configured = Boolean(window.MONITORING_API_BASE && typeof loadVerifiedMonitoringArticles === 'function');
    const companyFilter = document.getElementById('companyFilterSection');
    if (configured && companyFilter) companyFilter.hidden = true;
    if (configured) refreshVerifiedSourceOptions([], []);
    renderMonitoringTransparency();
    if (!configured) {
        setNewsDataMode('unavailable');
        applyNewsFilters();
        renderFintechMonitoring();
        return;
    }

    const manifestPromise = typeof loadMonitoringManifest === 'function'
        ? loadMonitoringManifest().catch((error) => { console.warn('Monitoring manifest unavailable.', error); return null; })
        : Promise.resolve(null);
    const statusPromise = typeof loadMonitoringStatus === 'function'
        ? loadMonitoringStatus().catch((error) => { console.warn('Monitoring status unavailable.', error); return null; })
        : Promise.resolve(null);

    Promise.all([loadVerifiedMonitoringArticles(), manifestPromise, statusPromise]).then(([result, manifest, status]) => {
        if (!result.loaded) throw new Error('Monitoring API is not configured.');
        monitoringRuntimeStatus = status;
        setVerifiedMonitoringSourceTotal(status);
        if (manifest) hydrateMonitoringManifest(manifest);
        monitoringNews = result.articles;
        monitoringLoadState = {
            total: result.total ?? monitoringNews.length,
            loaded: monitoringNews.length,
            complete: result.complete !== false,
            range: result.range || getRollingMonitoringDateRange(),
            liveFallbackCount: result.liveFallbackCount || 0
        };
        setVerifiedNewsTotal(monitoringLoadState.total);
        setNewsDataMode('verified');
        refreshVerifiedSourceOptions(result.articles, status?.enabled_sources || []);
        renderMonitoringTransparency();
        renderHuikeTabs();
        renderHuikeChips();
        applyNewsFilters();
        renderFintechMonitoring();
    }).catch((error) => {
        console.warn('Verified monitoring API unavailable; no unverified content is shown.', error);
        monitoringNews = [];
        monitoringLoadState = null;
        setVerifiedNewsTotal(0);
        setVerifiedMonitoringSourceTotal(null);
        setNewsDataMode('unavailable');
        renderMonitoringTransparency();
        applyNewsFilters();
        renderFintechMonitoring();
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
    allOption.textContent = '全部已驗證 RSS 來源';
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
        const health = source.health_status === 'healthy' ? '健康' : source.health_status ? '待確認' : '';
        option.textContent = `📰 ${source.name}${health ? `（${health}）` : ''}`;
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
    const ruleIds = Array.isArray(news?.ruleIds)
        ? news.ruleIds
        : String(news?.ruleIds || '').split(',');
    return ruleIds.some((ruleId) => STABLECOIN_RULE_IDS.has(String(ruleId || '').trim()));
}

function isOwlPayPriorityArticle(news) {
    const hasStablecoinContext = articleHasMonitoringFolder(news, 'folder_6') || articleHasStablecoinRule(news);
    if (!hasStablecoinContext) return false;
    const target = stablecoinSearchText(news);
    return STABLECOIN_PRIORITY_TERMS.some((term) => matchesStablecoinTerm(target, term));
}

function getStablecoinTermMatches(news) {
    const target = stablecoinSearchText(news);
    const matches = [];
    const hasStablecoinContext = articleHasMonitoringFolder(news, 'folder_6') || articleHasStablecoinRule(news);
    STABLECOIN_TERM_GROUPS.forEach((group, index) => {
        // 奧丁丁／OwlPay 是穩定幣頁面的優先標籤；只有文章已經命中
        // folder_6 或穩定幣規則時才加入，避免台灣支付頁的一般品牌新聞被誤標。
        if (index === STABLECOIN_TERM_GROUPS.length - 1 && !hasStablecoinContext) return;
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

function getFintechCategoryLabels(news) {
    const labels = [];
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

function refreshFintechSourceOptions(articles) {
    const sourceSelect = document.getElementById('fintechSourceFilter');
    if (!sourceSelect) return;
    const sources = [...new Set(articles.map((article) => article.source).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b), 'zh-Hant'));
    const signature = sources.join('|');
    if (sourceSelect.dataset.sourceSignature === signature) return;

    const previous = sourceSelect.value;
    sourceSelect.replaceChildren();
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '全部已驗證 RSS 來源';
    sourceSelect.appendChild(allOption);
    sources.forEach((source) => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        sourceSelect.appendChild(option);
    });
    if (sources.includes(previous)) sourceSelect.value = previous;
    sourceSelect.dataset.sourceSignature = signature;
}

function renderFintechKeywordPills(articles) {
    const container = document.getElementById('fintechKeywordPills');
    if (!container) return;
    container.replaceChildren();
    const scopes = [
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

    const state = document.createElement('p');
    state.className = 'fintech-summary-state';
    state.textContent = '已驗證 RSS 資料，台灣支付為預設視圖。資料範圍 ' + range.from + ' 至 ' + range.to + '；每則新聞皆保留原文連結與命中證據。';
    summary.appendChild(state);
    const priorityNote = document.createElement('p');
    priorityNote.className = 'fintech-priority-note';
    priorityNote.textContent = `穩定幣頁優先：奧丁丁／OwlPay ${owlPayPriorityCount} 篇；僅在同時具穩定幣、鏈上支付、加密資產或金融科技語境時列入。`;
    summary.appendChild(priorityNote);

    const grid = document.createElement('div');
    grid.className = 'fintech-stat-grid';
    [
        [String(taiwanPaymentCount), '台灣支付新聞（優先）'],
        [String(articles.length), '全部金融科技新聞'],
        [String(stablecoinCount), '穩定幣相關'],
        [String(sources.size), '已驗證來源'],
        [String(taiwanSources.size), '台灣 RSS 來源'],
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

function createFintechArticleCard(news) {
    const card = document.createElement('article');
    card.className = 'fintech-news-card';

    const header = document.createElement('div');
    header.className = 'fintech-card-header';
    const badges = document.createElement('div');
    badges.className = 'fintech-card-badges';
    getFintechCategoryLabels(news).forEach((label) => {
        const badge = document.createElement('span');
        badge.className = 'fintech-category-badge';
        badge.textContent = label;
        badges.appendChild(badge);
    });
    if (isOwlPayPriorityArticle(news)) {
        const priorityBadge = document.createElement('span');
        priorityBadge.className = 'fintech-category-badge fintech-priority-badge';
        priorityBadge.textContent = '⭐ 奧丁丁優先';
        badges.appendChild(priorityBadge);
    }
    const date = document.createElement('time');
    date.className = 'fintech-card-date';
    date.textContent = '📅 ' + (news.date || '日期未提供');
    header.append(badges, date);

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
    excerpt.textContent = truncateFintechText(news.excerpt || '此文章由已驗證公開 RSS 來源收錄。');

    const matchedTerms = [...new Set([
        ...(news.matchedTerms || []),
        ...getStablecoinTermMatches(news)
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
    source.textContent = (news.sourceRegion === 'TW' ? '🇹🇼 台灣來源｜' : '📰 ') + (news.source || '來源未提供');
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
    const provenance = document.createElement('div');
    provenance.className = 'fintech-card-provenance';
    provenance.textContent = `原文發布：${news.date || '未提供'}｜${news.liveFallback ? '即時 RSS 讀取' : `本站收錄：${news.collectedDate || '未提供'}`}｜覆核狀態：${news.reviewState === 'approved' ? '自動通過' : '待人工覆核'}`;
    const feedUrl = safeHttpUrl(news.sourceFeed);
    if (feedUrl !== '#') {
        const separator = document.createTextNode('｜');
        const feedLink = document.createElement('a');
        feedLink.href = feedUrl;
        feedLink.target = '_blank';
        feedLink.rel = 'noopener';
        feedLink.textContent = 'RSS 來源';
        provenance.append(separator, feedLink);
    }
    card.append(header, title, excerpt, evidence, footer, provenance);
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
            ? '正在讀取已驗證 RSS 來源、近兩個月資料與關鍵字命中結果。'
            : '真實新聞服務目前無法驗證，頁面不會改以展示資料替代。';
        summary.appendChild(state);
        renderFintechKeywordPills([]);
        grid.replaceChildren();
        grid.appendChild(makeFintechEmptyState(
            isLoading ? '⏳' : '⚠️',
            isLoading ? '正在讀取金融科技新聞' : '真實新聞服務暫時無法驗證',
            isLoading
                ? '系統正在確認來源健康狀態與兩個月資料窗口。'
                : '為避免未驗證內容被誤認為新聞，請稍後重新整理。'
        ));
        resultCount.textContent = isLoading ? '正在載入已驗證 RSS 新聞' : '真實新聞服務目前無法驗證';
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
    resultCount.textContent = '顯示 ' + visible.length + '／' + filtered.length + ' 篇已驗證 RSS 新聞';
    grid.replaceChildren();
    if (!filtered.length) {
        const emptyMessage = !allArticles.length
            ? '近兩個月目前沒有符合金融科技規則的文章；資料服務正常，請稍後再查看。'
            : (selectedSource || keyword || fintechMode !== 'all'
                ? '目前篩選條件沒有命中；請調整分類、來源或搜尋文字。'
                : '資料服務已連線，但目前沒有可公開的已驗證文章。');
        grid.appendChild(makeFintechEmptyState(
            '🔍',
            '目前沒有符合條件的已驗證新聞',
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
        return;
    }
    if (descEl) {
        descEl.innerHTML = `<strong>${currentFolder.icon} ${currentFolder.desc}</strong>（以下為精選快速篩選；完整條件請展開上方規則清單）：`;
    }

    chipsContainer.innerHTML = '';

    currentFolder.keywords.forEach(kw => {
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
            loading: '正在載入已驗證 RSS 新聞',
            verified: '已驗證 RSS 真實新聞',
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
                icon: '⏳', title: '正在讀取已驗證 RSS 新聞',
                message: '系統正在確認來源健康狀態、近兩個月日期範圍與關鍵字命中結果。', reset: false
            },
            unavailable: {
                icon: '⚠️', title: '真實新聞服務暫時無法驗證',
                message: '為避免未驗證內容被誤認為新聞，頁面不會改顯示展示資料。請稍後重新整理。', reset: false
            },
            verified: {
                icon: '🔍', title: '目前沒有可顯示的已驗證 RSS 新聞',
                message: '頁面只顯示已驗證公開 RSS 來源且命中規則的文章。請查看上方來源狀態，或調整資料夾與關鍵字條件。', reset: true
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
        const companyName = escapeHtml(news.companyName || '已驗證 RSS 監測');
        const category = escapeHtml(news.category || '關鍵字監測');
        const source = escapeHtml(news.source || '來源未提供');
        const date = escapeHtml(news.date || '日期未提供');
        const collectedDate = escapeHtml(news.collectedDate || '未提供');
        const reviewLabel = news.reviewState === 'approved' ? '自動通過' : '待人工覆核';
        const huikeKeyword = escapeHtml(news.huikeKeyword || '');
        item.style.setProperty('--item-brand-color', brandColor);
        
        const syntheticBadge = news.synthetic
            ? '<span style="background:#fef3c7;color:#92400e;font-size:0.7rem;padding:2px 7px;border-radius:20px;font-weight:700;margin-left:8px;vertical-align:middle;">🤖 模擬資料</span>'
            : '';

        const verifiedBadge = news.verifiedMonitoring
            ? '<span style="background:#dcfce7;color:#166534;font-size:0.7rem;padding:2px 7px;border-radius:20px;font-weight:700;margin-left:8px;vertical-align:middle;">✓ 已驗證 RSS</span>'
            : '';

        const huikeBadge = huikeKeyword
            ? `<span class="tag-huike-chip" data-kw="${huikeKeyword}" style="background:#fff1ee; color:#c84b31; border:1px solid #ffd8d0; font-size:0.75rem; padding:2px 8px; border-radius:12px; font-weight:700; margin-left:6px; vertical-align:middle; cursor:pointer;" title="點擊以此關鍵字篩選">📌 ${huikeKeyword}</span>`
            : '';

        const directUrl = safeHttpUrl(news.url);
        const targetUrl = escapeHtml(directUrl);
        const hasOriginalLink = directUrl !== '#';

        const displayTitle = highlightKeyword(news.title, currentKeyword);
        const displayExcerpt = highlightKeyword(news.excerpt, currentKeyword);
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
                        <span class="timeline-company-badge" data-comp-id="${companyId}" style="background: ${brandColor}18; color: ${brandColor}; cursor:pointer;" title="已驗證 RSS 監測">
                            ${companyName}
                        </span>
                        ${huikeBadge}
                    </div>
                    <span class="timeline-date">📅 ${date}</span>
                </div>
                <h4 class="timeline-title">
                    ${titleContent}
                    ${syntheticBadge}
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
                <div class="timeline-provenance">原文發布：${date}｜本站收錄：${collectedDate}｜覆核狀態：${reviewLabel}</div>
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
