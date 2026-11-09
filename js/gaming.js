/* Shared, evidence-based gaming taxonomy. Run generate_gaming_rules.mjs after changing rules. */
(function (root) {
    'use strict';
    const version = '2026-11-09-gaming-v2';
    const products = [
        ['RO仙境傳說：口袋戰記', ['RO仙境傳說：口袋戰記', 'RO仙境傳說口袋戰記', 'RO 仙境傳說：口袋戰記']],
        ['RO仙境傳說城堡', ['RO仙境傳說城堡', 'RO 仙境傳說 城堡', 'RO仙境傳說：城堡', 'RAGNAROK CASTLE']],
        ['RAGLAND', ['RAGLAND']], ['RO PlayZone', ['RO PlayZone', 'RO Play Zone']],
        ['無職轉生～迴響編年史', ['無職轉生～到了異世界就拿出真本事～迴響編年史', '無職轉生 迴響編年史', '迴響編年史', '回响编年史']],
        ['我在三國當村長', ['我在三國當村長', '我在三国当村长']],
        ['天翼之鍊MOBILE', ['天翼之鍊MOBILE', '天翼之鍊 MOBILE', '天翼之鏈MOBILE', 'TalesWeaver MOBILE']],
        ['源初之結', ['源初之結', '源初之结']], ['詭秘之主：愚者', ['詭秘之主：愚者', '诡秘之主：愚者']],
        ['龍之谷：覺醒', ['龍之谷：覺醒', '龙之谷：觉醒']], ['真仙錄', ['真仙錄', '真仙录']],
        ['熱血江湖：重啟', ['熱血江湖：重啟', '热血江湖：重启']], ['3對3街籃', ['3對3街籃', '3对3街篮']],
        ['不可卷卷書店', ['不可卷卷書店', '不可卷卷书店']], ['誅仙：歸來', ['誅仙：歸來', '诛仙：归来']],
        ['武林外傳之七俠重遊', ['武林外傳之七俠重遊', '武林外传之七侠重游']],
        ['拇指人領主', ['拇指人領主', '拇指人领主']], ['鬥羅大陸：第十魂環', ['鬥羅大陸：第十魂環', '斗罗大陆：第十魂环']],
        ['閒田悠悠', ['閒田悠悠', '闲田悠悠']], ['奧丁：神叛', ['奧丁：神叛', '奥丁：神叛']],
        ['美職籃瞬息', ['美職籃瞬息', '美职篮瞬息']], ['戰爭前線：突圍', ['戰爭前線：突圍', '战争前线：突围']]
    ];
    const companies = ['Gravity', 'Nexon', 'ASOBIMO', '紅心辣椒', '昱泉國際', '洲越網絡', '洲越网络', 'LYTO', 'Game Max', 'Game Tech', '字節跳動', '字节跳动', '遊戲精釀', '游戏精酿', '米哈遊', '米哈游', 'miHoYo', 'HoYoverse', '祖龍娛樂', '祖龙娱乐', '愷英網絡', '恺英网络', '暢遊', '畅游', '騰訊遊戲', '腾讯游戏', '網易遊戲', '网易游戏', 'Kakao Games', '三七互娛', '三七互娱', '游族網絡', '游族网络'];
    const gameContext = ['手機遊戲', '手机游戏', '手遊', '手游', 'MMORPG', 'RPG', '遊戲新作', '游戏新作', '遊戲平台', '游戏平台'];
    const stages = {
        announce: ['新作公開', '公開新作', '首度曝光', '首次曝光', '首次公開', '新作發表', '新作发表', '公開', '發表', '发布', '揭露', 'announce', 'reveal'],
        preorder: ['事前預約', '事前登錄', '預先註冊', '預註冊', '预约', '预注册', 'pre-registration'],
        recruit: ['測試報名', '測試招募', '測試申請', '测试报名', '测试招募'],
        test: ['封測', '內測', '封闭测试', '內部測試', 'CBT', 'beta test'],
        beta: ['公測', '公测', 'OBT'], launch: ['正式上市', '正式上線', '正式上线', '正式推出', '全平台上市', '開服', '开服', 'launch', 'release'],
        planned: ['預計', '預定', '预计', '预定', '即將', '即将', '將於', '将于'], delay: ['延期', '延後', '延后'],
        shutdown: ['停運', '停运', '結束營運', '終止營運', '终止运营', '關服', '关服'],
        license: ['代理', '授權', '授权', '發行權', '營運權', '發行合作', 'licensing', 'publishing rights'],
        trademark: ['商標', '商标', 'trademark'], ugc: ['UGC', '玩家創作', '玩家创作', '無程式碼', '免寫程式', '正版素材', '創作者工具', 'no-code'],
        fees: ['抽成', '佣金', '手續費', '手续费', '服務費', '服务费', 'commission', 'service fee'],
        payment: ['第三方支付', '替代支付', '外部付款', '外部支付', '外部連結', '外部链接', 'App內購', 'App内购', 'IAP'],
        enforcement: ['裁罰', '裁罚', '罰款', '罚款', '反壟斷', '反垄断', '改善命令', '改善要求', '上訴', '异议', '異議'],
        money: ['分潤', '分润', '收益分享', '營收分成', '獎勵式廣告', '奖励式广告', '插頁廣告', '片頭廣告', '內容販售', '虛擬禮物', '動態禮物'],
        finance: ['營收', '营收', '財報', '财报', '併購', '并购', '收購', '收购', '投資', '投资', '裁員', '裁员'],
        metrics: ['暢銷榜', '畅销榜', '暢銷排名', '排行榜', 'grossing', 'DAU', 'MAU', '觸及', '活躍用戶', '觀看時間']
    };
    const flatProducts = products.flatMap(([, terms]) => terms);
    const services = ['RAGLAND', 'RO PlayZone'];
    const gameProducts = products.filter(([label]) => !services.includes(label)).flatMap(([, terms]) => terms);
    const productEvents = [...stages.announce, ...stages.preorder, ...stages.recruit, ...stages.test, ...stages.beta, ...stages.launch, ...stages.planned, ...stages.delay, ...stages.shutdown];
    const ipContext = ['RO仙境傳說', 'RO 仙境傳說', '仙境傳說', 'Ragnarok Online', 'RO FESTA', ...flatProducts, ...companies];
    const rule = (id, label, groups, folder = 'folder_4') => ({ id, folder_id: folder, display_name: label, scope: 'title_or_lead', required_any_groups: groups, exclude_any: [] });
    const rules = [
        rule('industry-game-release', '產業新聞 市場新遊與發行', [[...gameContext.filter(term => !['遊戲平台','游戏平台'].includes(term)), ...gameProducts], productEvents]),
        rule('industry-game-product', '產業新聞 重點新遊與服務', [flatProducts]),
        rule('competitor-game-event', '競業新聞 遊戲公司事件', [companies, [...productEvents, ...stages.trademark, ...stages.license, ...stages.finance, 'RO FESTA']], 'folder_3'),
        rule('industry-game-ip', '產業新聞 遊戲IP與商標', [ipContext, [...stages.trademark, ...stages.license, 'IP延伸', 'IP新計畫', 'IP新计划', 'IP改編', 'IP改编']]),
        rule('industry-game-store-policy', '產業新聞 商店抽成與支付規範', [['App Store', 'Google Play', '應用商店', '应用商店', 'App內', 'App内', '應用程式內購', '应用内支付'], [...stages.fees, ...stages.payment, ...stages.enforcement]]),
        rule('industry-game-instant', '產業新聞 即玩與網頁服務', [['Playables', '遊戲角落', 'RO PlayZone', 'RO Play Zone']]),
        rule('industry-game-cloud', '產業新聞 即玩與雲端遊戲', [['遊戲', '游戏'], ['免下載', '免安裝', '免下载', '免安装', 'H5', 'HTML5', '雲端遊戲', '云游戏', '網頁遊戲', '网页游戏']]),
        rule('industry-game-ugc', '產業新聞 玩家創作平台', [['遊戲', '游戏', ...ipContext], stages.ugc]),
        rule('industry-game-monetization', '產業新聞 遊戲平台變現', [['Playables', '遊戲角落', 'RAGLAND', 'RO PlayZone', '遊戲平台', '游戏平台', '遊戲直播', '游戏直播'], stages.money]),
        rule('industry-game-business', '產業新聞 遊戲市場與營運', [gameContext, [...stages.finance, ...stages.metrics]])
    ];
    const parentRules = {
        softworld: ['softworld-brand', 'softworld-games', 'softworld-ip'],
        competitor: ['competitor-tw-game', 'competitor-global-game', 'competitor-game-event'],
        mobile: ['mobile-top-grossing-games', 'mobile-game-watchlist', 'mobile-game-context-watchlist'],
        platform: ['industry-game-platform', 'industry-game-store-policy', 'industry-game-instant', 'industry-game-cloud', 'industry-game-ugc', 'industry-game-monetization'],
        approval: ['industry-cn-game-approval']
    };
    const allRuleIds = [...new Set([...Object.values(parentRules).flat(), ...rules.map(item => item.id)])];
    const topics = {
        all: [['new', '市場新遊'], ['license', '代理與授權'], ['ip', 'IP與商標'], ['service', '平台新服務'], ['policy', '商店政策'], ['business', '市場與公司營運'], ['general', '一般遊戲內容']],
        softworld: [['business', '集團與公司營運'], ['new', '旗下遊戲新作'], ['operation', '既有遊戲營運'], ['license', '代理與授權合作'], ['ip', 'IP延伸'], ['mycard', 'MyCard遊戲通路與服務'], ['other', '其他集團消息']],
        competitor: [['tw', '台灣遊戲同業'], ['global', '國際遊戲同業'], ['new', '新作與發行'], ['license', '代理與營運合作'], ['ip', 'IP授權與商標'], ['business', '營收與公司營運'], ['corporate', '併購投資與重大異動']],
        mobile: [['new', '新作與地區發行'], ['operation', '重大改版與營運'], ['activity', 'IP聯動與活動'], ['metrics', '榜單與商業表現'], ['shutdown', '停運與重大異動']],
        platform: [['store', '遊戲商店與發行通路'], ['console', '主機與PC平台'], ['esports', '電競聯賽與賽事'], ['instant', '即玩／網頁／雲端遊戲'], ['ugc', 'UGC與創作平台'], ['policy', '抽成與支付政策'], ['money', '廣告分潤與平台變現'], ['tech', '遊戲技術與服務']],
        approval: [['domestic', '國產遊戲新增'], ['import', '進口遊戲新增'], ['change', '審批變更'], ['revoke', '審批撤銷']]
    };
    const eventLabels = { announce: '新作公開', preorder: '事前預約', recruit: '測試招募', test: '封測／內測', beta: '公測', launch: '正式上市', planned: '預計推出', delay: '延期', shutdown: '停運', license: '代理／授權', trademark: '商標消息', ugc: '玩家創作', fees: '費率調整', payment: '支付方式', enforcement: '監管／異議', money: '平台變現', finance: '公司營運', metrics: '數據觀察' };
    function normalize(value = '') { return String(value).normalize('NFKC').toLowerCase().replace(/[\s：:～~·・]/g, ''); }
    function has(text, terms) { return terms.some(term => /^[a-z0-9]+$/i.test(term) ? new RegExp(`(^|[^a-z0-9])${term}([^a-z0-9]|$)`, 'i').test(text) : normalize(text).includes(normalize(term))); }
    function ids(article) { return Array.isArray(article.ruleIds) ? article.ruleIds : String(article.rule_ids || '').split(','); }
    function textFor(article) { return [article.title || '', article.sourceKind === 'google_news_rss' || article.source_kind === 'google_news_rss' ? '' : article.excerpt || ''].join('\n'); }
    const cache = new WeakMap();
    function classify(article) {
        if (cache.has(article)) return cache.get(article);
        const text = textFor(article), title = article.title || '', ruleIds = ids(article);
        const events = Object.keys(stages).filter(key => has(text, stages[key]));
        if (events.includes('planned') && !has(title, stages.launch.filter(term => !['launch', 'release'].includes(term)))) {
            const index = events.indexOf('launch'); if (index >= 0) events.splice(index, 1);
        }
        // A projected release is never presented as completed, even if the headline says 正式上市.
        if (has(title, stages.planned) && has(title, stages.launch)) { const index = events.indexOf('launch'); if (index >= 0) events.splice(index, 1); }
        const parents = Object.keys(parentRules).filter(key => ruleIds.some(id => parentRules[key].includes(id)));
        const foundProducts = products.filter(([, aliases]) => has(text, aliases)).map(([label]) => label);
        const serviceOnly = (foundProducts.some(label => services.includes(label)) || has(text, ['Playables', '遊戲角落'])) && !foundProducts.some(label => !services.includes(label));
        if (serviceOnly && events.includes('announce')) { events.splice(events.indexOf('announce'),1); events.push('serviceAnnounce'); }
        const player = has(title, ['攻略', '序號', '序号', '抽卡', '玩家趣聞', '玩家趣闻', '懷舊', '神曲', '論戰', '明信片']);
        const operation = has(text, ['改版', '更新', '聯動', '联动', '合作活動', '週年', '周年', '簽到', '儲值優惠']);
        const significant = events.some(key => !['announce', 'planned'].includes(key)) || has(title, ['新作', '全新手遊', '新遊', '新游']);
        const content = player && !events.some(key => ['shutdown', 'fees', 'payment', 'enforcement', 'trademark'].includes(key)) ? 'player' : significant ? 'industry' : operation ? 'operation' : 'unclassified';
        const tags = new Set();
        if (!serviceOnly && events.some(key => ['announce', 'preorder', 'recruit', 'test', 'beta', 'launch', 'planned', 'delay'].includes(key)) && (foundProducts.length || has(text, [...gameContext, ...companies, '新作', '新遊']))) tags.add('new');
        if (events.includes('license')) tags.add('license');
        if (events.includes('trademark') || has(text, ['IP延伸', 'IP改編', 'IP新計畫'])) tags.add('ip');
        if (events.some(key => ['fees', 'payment', 'enforcement'].includes(key)) && has(text, ['App Store', 'Google Play', 'App內', 'App内', '應用商店', '应用商店'])) tags.add('policy');
        if (has(text, ['App Store', 'Google Play', 'Steam', 'Epic Games Store', '發行通路'])) tags.add('store');
        if (has(text, ['Playables', '遊戲角落', 'H5', 'HTML5', '免下載', '免安裝', '雲端遊戲', '云游戏', '網頁遊戲', '网页游戏', 'RO PlayZone', 'RO Play Zone'])) tags.add('instant');
        if (events.includes('ugc') || has(text, ['RAGLAND'])) tags.add('ugc');
        if (tags.has('ugc') || tags.has('instant') || has(text, ['新平台', '新服務', '新服务', '試營運', '试运营'])) tags.add('service');
        if (events.includes('money')) tags.add('money');
        if (events.some(key => ['finance', 'metrics', 'shutdown'].includes(key))) tags.add('business');
        if (events.includes('metrics') || events.includes('finance')) tags.add('metrics');
        if (events.includes('shutdown')) tags.add('shutdown');
        if (has(text, ['併購', '并购', '收購', '收购', '投資', '投资', '裁員', '裁员', ...stages.shutdown])) tags.add('corporate');
        if (operation) tags.add('operation');
        if (has(text, ['聯動', '联动', '活動', '活动', '週年', '周年'])) tags.add('activity');
        if (has(text, ['MyCard', 'My Card'])) tags.add('mycard');
        if (has(text, ['PS5', 'PS4', 'PlayStation', 'Xbox', 'Switch', 'Steam', '主機', '主机', 'PC平台'])) tags.add('console');
        if (has(text, ['電競', '电竞', '聯賽', '联赛', 'esports'])) tags.add('esports');
        if (has(text, ['VR', 'AR', '美術外包', '美術代工', '遊戲引擎', '游戏引擎', '遊戲技術'])) tags.add('tech');
        if (has(text, companies.filter(term => !['紅心辣椒', '昱泉國際'].includes(term))) || ruleIds.includes('competitor-global-game')) tags.add('global');
        if (has(text, ['紅心辣椒', '昱泉', '遊戲橘子', '宇峻奧汀', '網銀國際', '傳奇網路']) || ruleIds.includes('competitor-tw-game')) tags.add('tw');
        if (parents.includes('approval')) {
            if (has(text, ['國產', '国产'])) tags.add('domestic');
            if (has(text, ['進口', '进口'])) tags.add('import');
            if (has(text, ['變更', '变更'])) tags.add('change');
            if (has(text, ['撤銷', '撤销'])) tags.add('revoke');
        }
        if (content === 'player' || content === 'operation') tags.add('general');
        if (!tags.size) tags.add('other');
        const markets = [['台港澳', ['台港澳', '臺港澳']], ['台灣', ['台灣', '臺灣', '台湾']], ['日本', ['日本']], ['韓國', ['韓國', '韩国']], ['中國', ['中國', '中国']], ['東南亞', ['東南亞', '东南亚', '泰國', '印尼']], ['全球', ['全球']]].filter(([, aliases]) => has(text, aliases)).map(([label]) => label);
        const platforms = [['手機', ['手遊', '手游', '手機', '手机', 'MOBILE', 'iOS', 'Android']], ['PC', ['PC', '端遊', '端游', '客戶端', '客户端']], ['主機', ['主機', '主机', 'PS5', 'Xbox', 'Switch']], ['網頁', ['網頁', '网页', 'H5', 'HTML5', 'PlayZone']], ['跨平台', ['跨平台', '全平台']]].filter(([, aliases]) => has(text, aliases)).map(([label]) => label);
        const result = { parents, topics: [...tags], events, products: foundProducts, markets, platforms, content };
        cache.set(article, result); return result;
    }
    function matches(article, filter = {}) {
        const item = classify(article);
        return (!filter.mode || filter.mode === 'all' || item.parents.includes(filter.mode)) && (!filter.topic || item.topics.includes(filter.topic)) && (!filter.event || item.events.includes(filter.event)) && (!filter.market || item.markets.includes(filter.market)) && (!filter.platform || item.platforms.includes(filter.platform)) && (!filter.content || item.content === filter.content);
    }
    function isIndex(article) { return /^(?:標籤\s*[:：]|标签\s*[:：]|討論牆\s*[|｜]|搜尋結果|搜索结果)/i.test(article.title || ''); }
    function groupArticles(articles) {
        const groups = new Map();
        for (const article of articles) {
            const headline = String(article.title || '').replace(/[-－–]\s*遊戲新聞\s*$/, '').normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '');
            const key = headline.length >= 16 ? `${headline}|${article.date || article.publishedAt?.slice(0,10) || article.published_at?.slice(0,10)}` : article.url || article.id;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(article);
        }
        return [...groups.values()].map(rows => {
            if (rows.length === 1) return rows[0];
            const main = rows.find(row => (row.sourceKind || row.source_kind) === 'official_rss') || rows[0];
            return { ...main, ruleIds: [...new Set(rows.flatMap(ids))], matchedTerms: [...new Set(rows.flatMap(row => row.matchedTerms || []))], relatedReports: rows.filter(row => row.url !== main.url) };
        });
    }
    eventLabels.serviceAnnounce = '新服務公開';
    const model = { version, products, companies, stages, rules, parentRules, allRuleIds, topics, eventLabels, classify, matches, ids, isIndex, groupArticles };
    root.GamingMonitoring = model;
    if (typeof module !== 'undefined') module.exports = model;
})(typeof globalThis !== 'undefined' ? globalThis : window);
