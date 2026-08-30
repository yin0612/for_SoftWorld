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
