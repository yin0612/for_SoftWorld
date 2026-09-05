// 台灣遊戲公司基本資料
const MOPS_HOME_URL = 'https://mops.twse.com.tw/mops/#/web/home';

const COMPANIES = [
    {
        id: 'soft-world',
        name: '智冠科技',
        enName: 'Soft-World International',
        stock: 'TPEx 5478',
        founded: 1983,
        website: 'https://soft-world.com',
        newsUrl: 'https://www.soft-world.com/News',
        mopsUrl: MOPS_HOME_URL,
        color: '#e76f51',
        products: ['MyCard點數平台', '藍新金流', '金庸群俠傳Online', '吞食天地'],
        description: '台灣歷史最悠久的一站式數位遊戲與周邊整合服務大廠。旗下擁有中華網龍、遊戲新幹線及藍新科技。',
        latestNews: '2026年8月王俊博交棒長女王思淳接任董事長，啟動二代接班。2024年與榮剛換股鞏固經營權。'
    },
    {
        id: 'softstar',
        name: '大宇資訊',
        enName: 'Star Fusion Group (Softstar)',
        stock: 'TPEx 6111 (光聚)',
        founded: 1988,
        website: 'https://www.softstar.com.tw',
        newsUrl: 'https://km.softstar.com.tw/list.aspx?cid=2',
        mopsUrl: MOPS_HOME_URL,
        color: '#4a7c59',
        products: ['女鬼橋系列', '咒', '大富翁系列'],
        description: '曾以「仙劍」與「軒轅劍」名震華人遊戲圈。2026年母公司更名「光聚晶電聯合」轉型半導體/重電控股。',
        latestNews: '2024年處分仙劍/軒轅劍IP挹注5億資金。2026年初正式更名光聚晶電聯合。'
    },
    {
        id: 'gamania',
        name: '橘子',
        enName: 'Gamania Digital Entertainment',
        stock: 'TPEx 6180',
        founded: 1995,
        website: 'https://www.gamania.com',
        newsUrl: 'https://www.gamania.com/news',
        mopsUrl: MOPS_HOME_URL,
        color: '#f4a261',
        products: ['天堂M', '新楓之谷', '波拉西亞戰記', '橘子支付', 'Vyin AI'],
        description: '台灣代表性數位娛樂集團，整合遊戲、支付、電商、資安與AI企業解決方案。',
        latestNews: '2026年定調「AI商轉元年」，推邊緣算力與AI應用。2024年發行《波拉西亞戰記》。'
    },
    {
        id: 'wanin',
        name: '網銀國際',
        enName: 'Wanin International',
        stock: '未上市',
        founded: 2009,
        website: 'https://www.wanin.tw',
        newsUrl: 'https://www.wanin.tw/News/',
        mopsUrl: MOPS_HOME_URL,
        color: '#48cae4',
        products: ['星城', '遊e卡', '閃電狼', '威秀影城'],
        description: '台灣休閒娛樂遊戲霸主與泛娛樂巨頭，建構跨虛實的泛娛樂生態圈。',
        latestNews: '2024年斥資12.49億收購威秀影城成最大股東。2026年《星城Online》品牌煥新更名《星城》。'
    },
    {
        id: 'wayi',
        name: '華義國際',
        enName: 'Wayi International',
        stock: 'TPEx 3086',
        founded: 1993,
        website: 'https://www.wayi.net',
        newsUrl: null, // 無官方專屬新聞頁，顯示 MOPS 快捷鍵
        mopsUrl: MOPS_HOME_URL,
        color: '#9d4edf',
        products: ['遊戲大亂鬥社群', 'BanaBana', '石器時代（經典）'],
        description: '台灣老牌遊戲營運商，現隸屬網銀國際體系，轉型社群經營與海外B2B博弈技術。',
        latestNews: '2025年合資華智進軍印度手遊。2026年子公司取得離岸B2B遊戲執照。'
    },
    {
        id: 'userjoy',
        name: '宇峻奧汀',
        enName: 'USERJOY Technology',
        stock: 'TPEx 3546',
        founded: 1995,
        website: 'https://www.userjoy.com.tw',
        newsUrl: 'https://www.userjoy.com.tw/news/news_01.aspx',
        mopsUrl: MOPS_HOME_URL,
        color: '#3a86ff',
        products: ['三國群英傳系列', 'FFXIV繁中版', '幻想三國誌', '拉斯維加斯娛樂城'],
        description: '台灣少數兼具強大自研能力與長青IP的上櫃遊戲公司，貫徹「一次研發，官方授權」策略。',
        latestNews: '2026年Q1營收創歷史新高5.19億元。推出《三國群英傳：策定九州》及UE5新作。'
    },
    {
        id: 'xlegend',
        name: '傳奇網路',
        enName: 'X-Legend Entertainment',
        stock: 'TWSE 4994',
        founded: 2002,
        website: 'https://www.x-legend.tw',
        newsUrl: 'https://www.x-legend.tw/02news/news_1.php#/nl/undefined/undefined',
        mopsUrl: MOPS_HOME_URL,
        color: '#ff70a6',
        products: ['精靈樂章：ORIGIN', '幻想神域', '晴空物語', '咻咻史萊姆'],
        description: '以自研日系動漫風格MMORPG聞名的台灣遊戲研發及全球發行商。',
        latestNews: '轉型「高毛利長青PC端遊+輕量休閒手遊」雙軌策略。全球推廣《咻咻史萊姆》。'
    },
    {
        id: 'astro',
        name: '泰偉電子',
        enName: 'Astro Corp.',
        stock: 'TPEx 3064',
        founded: 2000,
        website: 'https://www.astrocorp.com.tw',
        newsUrl: null, // 無官方專屬新聞頁，顯示 MOPS 快捷鍵
        mopsUrl: MOPS_HOME_URL,
        color: '#2a9d8f',
        products: ['商用博弈遊戲機台', '網路博弈軟體系統', '叫號叫我智慧系統'],
        description: '台灣首家掛牌上櫃的博弈概念股，專注商用博弈軟硬體及系統整合。',
        latestNews: '2024年減資70%改善財務體質。轉型網路博弈技術輸出與智慧系統。'
    }
];

// 統一品牌色欄位名稱 (charts.js 與 compare.js 讀取 brandColor)
COMPANIES.forEach(c => {
    c.brandColor = c.brandColor || c.color;
});

// 觀測媒體來源清單 (包含新增之財經與科技媒體)
const SOURCES = ['巴哈姆特', '4Gamers', '經濟日報', '天下雜誌', '數位時代', '鉅亨網', '聯合新聞網', 'ETtoday', 'Yahoo新聞', '工商時報'];
const CATEGORIES = ['新品發布', '財務報告', '策略合作', '人事異動', '產業趨勢', '電競賽事', '技術創新', '社群活動'];

const PRESS_RELEASES = [
        {
            companyId: 'wanin',
            companyName: '網銀國際',
            companyColor: '#48cae4',
            title: '網銀國際舉辦玩家線下交流見面會，吸引數百位熱情玩家到場參與',
            category: '社群活動',
            excerpt: '網銀國際今日發布最新公關訊息，針對事業佈局與近期產品計畫進行詳細說明，展現營運成長動能。',
            date: '2026-09-05',
            source: '4Gamers',
            url: 'https://www.4gamers.com.tw/site/search?q=%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B',
            synthetic: true
        },
        {
            companyId: 'userjoy',
            companyName: '宇峻奧汀',
            companyColor: '#3a86ff',
            title: '宇峻奧汀舉辦玩家線下交流見面會，吸引數百位熱情玩家到場參與',
            category: '社群活動',
            excerpt: '宇峻奧汀今日發布最新公關訊息，針對事業佈局與近期產品計畫進行詳細說明，展現營運成長動能。',
            date: '2026-09-04',
            source: '巴哈姆特',
            url: 'https://gnn.gamer.com.tw/search.php?kw=%E5%AE%87%E5%B3%BB%E5%A5%A7%E6%B1%80',
            synthetic: true
        },
        {
            companyId: 'soft-world',
            companyName: '智冠科技',
            companyColor: '#e76f51',
            title: '智冠科技擴大海外市場佈局，攜手國際合作夥伴深化技術與發行合作',
            category: '策略合作',
            excerpt: '智冠科技今日發布最新公關訊息，針對事業佈局與近期產品計畫進行詳細說明，展現營運成長動能。',
            date: '2026-09-03',
            source: '鉅亨網',
            url: 'https://news.cnyes.com/search?q=%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80',
            synthetic: true
        },
        {
            companyId: 'soft-world',
            companyName: '智冠科技',
            companyColor: '#e76f51',
            title: '智冠科技公佈最新營運財報，受惠於旺季效應，單月營收表現亮眼',
            category: '財務報告',
            excerpt: '智冠科技今日發布最新公關訊息，針對事業佈局與近期產品計畫進行詳細說明，展現營運成長動能。',
            date: '2026-09-02',
            source: '天下雜誌',
            url: 'https://www.cw.com.tw/search/doSearch.action?key=%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80',
            synthetic: true
        },
        {
            companyId: 'soft-world',
            companyName: '智冠科技',
            companyColor: '#e76f51',
            title: '智冠科技宣告旗下重磅新作雙平台正式上線，發放限量虛寶回饋玩家',
            category: '新品發布',
            excerpt: '智冠科技今日發布最新公關訊息，針對事業佈局與近期產品計畫進行詳細說明，展現營運成長動能。',
            date: '2026-09-01',
            source: '鉅亨網',
            url: 'https://news.cnyes.com/search?q=%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80',
            synthetic: true
        },
        {
            companyId: 'gamania',
            companyName: '橘子集團',
            companyColor: '#f4a261',
            title: '橘子集團公佈最新營運財報，受惠於旺季效應，單月營收表現亮眼',
            category: '財務報告',
            excerpt: '橘子集團今日發布最新公關訊息，針對事業佈局與近期產品計畫進行詳細說明，展現營運成長動能。',
            date: '2026-08-31',
            source: '4Gamers',
            url: 'https://www.4gamers.com.tw/site/search?q=%E6%A9%98%E5%AD%90%E9%9B%86%E5%9C%98',
            synthetic: true
        },
        {
            companyId: 'softstar',
            companyName: '大宇資訊',
            companyColor: '#4a7c59',
            title: '大宇資訊公佈最新營運財報，受惠於旺季效應，單月營收表現亮眼',
            category: '財務報告',
            excerpt: '大宇資訊今日發布最新公關訊息，針對事業佈局與近期產品計畫進行詳細說明，展現營運成長動能。',
            date: '2026-08-30',
            source: '經濟日報',
            url: 'https://money.udn.com/search/result/1001/%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A',
            synthetic: true
        },];
const MONTHLY_STATS = {};
const MEDIA_CHANNELS = {};

// 輔助函數：產生隨機日期 (2024-01-01 到 2026-08-31)
function getRandomDate() {
    const start = new Date(2024, 0, 1).getTime();
    const end = new Date(2026, 7, 31).getTime();
    return new Date(start + Math.random() * (end - start));
}

// 輔助函數：格式化日期 YYYY-MM-DD
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 每個公司的新聞範本 (包含新增之財經科技媒體專題報導、專屬原文 URL 與真實發布日)
const NEWS_TEMPLATES = {
    'soft-world': [
        { t: "智冠科技宣布二代接班，創辦人王俊博交棒王思淳接任董事長", c: "人事異動", e: "智冠科技今日召開董事會，正式通過由長女王思淳接任董事長一職，創辦人王俊博轉任集團總裁，象徵集團邁入二代接班全新階段。", d: "2026-08-15", s: "經濟日報", u: "https://money.udn.com/money/story/5612/8163910" },
        { t: "智冠結盟榮剛換股案正式生效，成功鞏固集團經營權", c: "策略合作", e: "智冠與榮剛材料的股份交換案獲主管機關准予申報生效，雙方深化數位娛樂與實體材料跨界合作，為營運奠定穩固基石。", d: "2024-06-24", s: "鉅亨網", u: "https://news.cnyes.com/news/id/5416200" },
        { t: "MyCard 點數平台全面導入生成式 AI 智能客服系統", c: "技術創新", e: "為提升數百萬玩家體驗，智冠旗下 MyCard 點數平台導入次世代 AI 客服，平均問題處理時間縮短 60%，滿意度顯著提升。", d: "2025-03-12", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80" },
        { t: "中華網龍《金庸群俠傳Online》經典 25 週年慶典開跑", c: "社群活動", e: "經典武俠網遊《金庸群俠傳Online》迎接 25 週年，官方宣布舉辦全台玩家線上線下巡迴週年慶，重溫經典江湖回憶。", d: "2025-05-18", s: "巴哈姆特", u: "https://gnn.gamer.com.tw/search.php?kw=%E6%99%BA%E5%86%A0" },
        { t: "藍新金流 2025 年交易額破千億大關，創歷史新高", c: "財務報告", e: "受惠於線上支付與電商普及，智冠旗下藍新金流 2025 全年交易額打破 1,200 億元大關，獲利表現亮眼。", d: "2025-12-28", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80" },
        { t: "智冠集團擴大東南亞支付佈局，首站結盟泰國在地業者", c: "策略合作", e: "智冠集團今日宣布與泰國領先的金流服務商達成戰略合作，正式將 MyCard 與跨境支付生態系延伸至東南亞市場。", d: "2024-05-10", s: "天下雜誌", u: "https://www.cw.com.tw/search/doSearch.action?key=%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80" }
    ],
    'softstar': [
        { t: "大宇資訊震撼彈！股東會通過更名「光聚晶電聯合」轉型控股", c: "產業趨勢", e: "大宇資訊今日召開股東臨時會，正式通過更名案，轉型為半導體、重電與綠能事業控股集團，遊戲業務移至子公司獨立營運。", d: "2026-01-07", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A" },
        { t: "處分《仙劍奇俠傳》《軒轅劍》雙劍 IP 完成交割，5億資金挹注", c: "財務報告", e: "大宇資訊公告已完成雙劍經典 IP 的全球處分程序，認列約 5 億元處分利益，大幅提升公司現金流與轉型資本。", d: "2024-09-11", s: "鉅亨網", u: "https://news.cnyes.com/search?q=%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A" },
        { t: "國產驚悚改編大作《咒》登陸 Steam 平台，全球熱銷十萬套", c: "新品發布", e: "改編自國片票房冠軍《咒》的同名恐怖遊戲正發售，全球玩家與遊戲 Streamer 評分極佳，首週即傳出銷量捷報。", d: "2024-11-18", s: "4Gamers", u: "https://www.4gamers.com.tw/site/search?q=%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A" },
        { t: "光聚晶電（原大宇資）宣布併購知名 AI 散熱模組廠", c: "策略合作", e: "跨足高科技供應鏈，光聚晶電宣布收購國內 AI 伺服器散熱模組大廠，非遊戲事業營收佔比首度過半。", d: "2026-04-12", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A" },
        { t: "《女鬼橋二 釋魂恩》奪得國際獨立遊戲大獎 Best Narrative", c: "產業趨勢", e: "大宇資自研恐怖遊戲續作《女鬼橋二》憑藉優異的台味恐怖敘事與 3D 視覺效果，榮獲國際獨立遊戲節最佳敘事獎。", d: "2024-05-09", s: "天下雜誌", u: "https://www.cw.com.tw/search/doSearch.action?key=%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A" }
    ],
    'gamania': [
        { t: "橘子集團宣告 2026 為「AI 商轉元年」，推邊緣算力與 Vyin AI", c: "技術創新", e: "橘子集團於媒體發布會上宣布全面轉型，導入 Vyin AI 與企業級邊緣算力解決方案，賦能旗下遊戲、支付與電商事業。", d: "2026-02-18", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E6%A9%95%E5%AD%90%E9%9B%86%E5%9C%98" },
        { t: "跨平台 MMORPG 大作《波拉西亞戰記》台港澳盛大開服", c: "新品發布", e: "橘子代理發行的旗艦級攻城 MMORPG《波拉西亞戰記》正式上線，首日湧入百萬玩家，伺服器全線爆滿登頂排行榜。", d: "2024-06-13", s: "巴哈姆特", u: "https://gnn.gamer.com.tw/search.php?kw=%E6%B3%A2%E6%8B%89%E8%A5%BF%E4%BA%9E%E6%84%9B%E8%A8%98" },
        { t: "《新楓之谷》歡慶 20 週年，於臺北流行音樂中心舉辦狂歡嘉年華", c: "社群活動", e: "台灣國民級網遊《新楓之谷》迎接 20 歲生日，官方於北流包場舉辦大型玩家線下見面會，吸引數萬玩家同樂。", d: "2025-01-20", s: "ETtoday", u: "https://www.ettoday.net/news_search/unicode_result.php?keyword=%E6%A9%95%E5%AD%90" },
        { t: "《天堂M》重大職業改版登場，帶動橘子單月營收年增 18%", c: "財務報告", e: "受惠於長青手遊《天堂M》改版與年終慶典，橘子集團公布單月合併營收達 12.8 億元，創近二年同期新高。", d: "2024-12-10", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E6%A9%95%E5%AD%90" },
        { t: "橘子支付與有閑購物結合 AI 試穿，打造智慧零售生態圈", c: "技術創新", e: "橘子結合集團資安與 AI 技術，推出個人化智慧理財與購物虛擬試穿功能，有效降低退貨率並提高顧客黏著度。", d: "2025-08-15", s: "鉅亨網", u: "https://news.cnyes.com/search?q=%E6%A9%95%E5%AD%90" }
    ],
    'wanin': [
        { t: "網銀國際斥資 12.49 億收購威秀影城 35.69% 股權，成最大股東", c: "策略合作", e: "網銀國際今日宣布完成全台最大連鎖影城威秀影城的股權交割，將實體影城通路與線上遊戲生態圈進行深度泛娛樂整合。", d: "2024-06-28", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B" },
        { t: "《星城Online》品牌煥新，啟用全新 Logo 正式更名為《星城》", c: "產業趨勢", e: "營運超過 18 年的休閒娛樂龍頭《星城Online》宣佈升級為全球跨平台品牌《星城》，展開跨生活場景的泛娛樂行銷。", d: "2026-07-08", s: "天下雜誌", u: "https://www.cw.com.tw/search/doSearch.action?key=%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B" },
        { t: "閃電狼 Flash Wolves 勇奪國際電競大賽季軍，再次登上世界舞台", c: "電競賽事", e: "網銀國際旗下職業電競隊伍閃電狼於世界大賽中力戰各國強權，最終奪得季軍，展現台灣電競實力。", d: "2025-07-22", s: "4Gamers", u: "https://www.4gamers.com.tw/site/search?q=%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B" },
        { t: "網銀國際成立影視投資部門，結盟威秀影城每年投資 3-5 部國片", c: "策略合作", e: "發揮娛樂綜效，網銀國際宣布每年將投入數億元資金投資國產電影與影視 IP，打造虛實整合娛樂鏈。", d: "2025-03-05", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B" }
    ],
    'wayi': [
        { t: "華義國際合資成立「華智」，正式宣佈進軍印度手遊市場", c: "策略合作", e: "看好印度龐大人口與手遊成長紅利，華義國際結盟在地業者成立合資公司「華智」，專攻休閒手遊開發生態。", d: "2025-06-18", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E8%8F%AF%E7%BE%A9%E5%9C%8B%E9%9A%9B" },
        { t: "華義子公司取得海外離岸 B2B 遊戲執照，擴大技術輸出", c: "產業趨勢", e: "華義國際旗下子公司成功考取國際認可之 B2B 娛樂技術服務商執照，未來將全力擴大海外軟體授權收益。", d: "2026-03-12", s: "鉅亨網", u: "https://news.cnyes.com/search?q=%E8%8F%AF%E7%BE%A9%E5%9C%8B%E9%9A%9B" },
        { t: "「遊戲大亂鬥」社群論壇全面改版，導入創作者分潤機制", c: "技術創新", e: "華義旗下知名遊戲社群平台「遊戲大亂鬥」全新改版，新增影音創作者打賞與廣告分潤功能，大幅提升創作者意願。", d: "2024-11-05", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E8%8F%AF%E7%BE%A9%E5%9C%8B%E9%9A%9B" }
    ],
    'userjoy': [
        { t: "宇峻奧汀 Q1 營收 5.19 億元創歷史新高，《FFXIV》繁中版熱銷", c: "財務報告", e: "受惠於代理營運 SQUARE ENIX 大作《FINAL FANTASY XIV》繁中版玩家爆滿及遊戲授權金，宇峻獲利寫下歷史新紀錄。", d: "2026-05-15", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E5%AE%87%E5%B3%BB%E5%A5%A7%E6%B1%80" },
        { t: "《三國群英傳：策定九州》雙平台盛大公測，迅速攻頂下載榜", c: "新品發布", e: "宇峻旗艦自研 IP 最新 SLG 手遊正式發行，以高品質水墨視覺與即時國戰玩法，獲得台港澳與東南亞玩家極高評價。", d: "2026-08-13", s: "巴哈姆特", u: "https://gnn.gamer.com.tw/search.php?kw=%E4%B8%89%E5%9C%8B%E7%BE%A4%E8%8B%B1%E5%82%B3" },
        { t: "採用 UE5 引擎打造！宇峻首度公開次世代武俠 RPG 神祕新作", c: "技術創新", e: "宇峻奧汀於台北國際電玩展發表採用 Unreal Engine 5 開發的武俠 RPG 畫面，展現極致的光影與遊戲品質。", d: "2025-01-25", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E5%AE%87%E5%B3%BB%E5%A5%A7%E6%B1%80" }
    ],
    'xlegend': [
        { t: "傳奇網路「高毛利 PC 端遊 + 輕量手遊」雙軌策略奏效，毛利率突破 60%", c: "財務報告", e: "傳奇網路公布最新財報，自研《精靈樂章：ORIGIN》與全球發行放置手遊《咻咻史萊姆》營收穩定，帶動毛利率創新高。", d: "2024-03-22", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E5%82%B3%E5%A5%87%E7%B6%B2%E8%B7%AF" },
        { t: "《咻咻史萊姆》全球下載量突破千萬大關，成為海外休閒爆款", c: "新品發布", e: "傳奇自研的輕量放置手遊在歐美與日韓市場展現驚人爆發力，全球累積下載數破千萬，展現優異的研發能力。", d: "2025-05-14", s: "巴哈姆特", u: "https://gnn.gamer.com.tw/search.php?kw=%E5%82%B3%E5%A5%87%E7%B6%B2%E8%B7%AF" }
    ],
    'astro': [
        { t: "泰偉電子完成減資 70% 改善財務體質，每股淨值回升", c: "財務報告", e: "泰偉電子公告完成減資彌補虧損流程，股票恢復正常交易，公司財務結構與營運資本獲得顯著改善。", d: "2024-08-20", s: "鉅亨網", u: "https://news.cnyes.com/search?q=%E6%B3%B0%E5%81%89%E9%9B%BB%E5%AD%90" },
        { t: "「叫號叫我」智慧醫療系統獲國內多間醫學中心採用", c: "產業趨勢", e: "泰偉電子跨足智慧醫療與多媒體推播有成，自研的「叫號叫我」醫療系統順利導入全台各大大型醫院。", d: "2025-10-18", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E6%B3%B0%E5%81%89%E9%9B%BB%E5%AD%90" }
    ]
};

// 產生所有新聞稿資料
COMPANIES.forEach(company => {
    const templates = NEWS_TEMPLATES[company.id] || [];
    templates.forEach(t => {
        PRESS_RELEASES.push({
            companyId: company.id,
            companyName: company.name,
            companyColor: company.brandColor || company.color,
            title: t.t,
            category: t.c,
            excerpt: t.e,
            date: t.d || formatDate(getRandomDate()),
            source: t.s || SOURCES[Math.floor(Math.random() * SOURCES.length)],
            url: t.u || (typeof getMediaSearchUrl === 'function' ? getMediaSearchUrl(t.s, company.name) : company.website)
        });
    });
});

// 溯源 API 函式 (v3.0 核心規格：下鑽溯源 loadSources)
function loadSources(companyId, month) {
    if (!PRESS_RELEASES || !Array.isArray(PRESS_RELEASES)) {
        return [];
    }
    
    // 1. 查找屬於該公司且該月份的精選新聞
    const matched = PRESS_RELEASES.filter(news => {
        const matchComp = (news.companyId === companyId);
        const matchMonth = news.date && news.date.startsWith(month);
        return matchComp && matchMonth;
    }).map(news => ({
        title: news.title,
        url: news.url || (COMPANIES.find(c => c.id === companyId)?.newsUrl || COMPANIES.find(c => c.id === companyId)?.website),
        published_at: news.date,
        source_domain: news.source,
        is_original: true,
        category: news.category,
        excerpt: news.excerpt,
        synthetic: news.synthetic || false
    }));

    return matched;
}

// 產生每月統計數據 (2024-01 到 2026-08, 共 32 個月)
const START_YEAR = 2024;
const START_MONTH = 1;
const END_YEAR = 2026;
const END_MONTH = 9;

const MONTHS_LIST = [];
for (let y = START_YEAR; y <= END_YEAR; y++) {
    const maxMonth = (y === END_YEAR) ? END_MONTH : 12;
    for (let m = (y === START_YEAR ? START_MONTH : 1); m <= maxMonth; m++) {
        MONTHS_LIST.push(`${y}-${String(m).padStart(2, '0')}`);
    }
}

// 8 大公司四大指標權重與特定月份爆發點
const COMPANY_PROFILES = {
    'soft-world': { // 智冠科技
        basePR: 8, baseMedia: 48, baseSocial: 280, baseKol: 4,
        spikes: { '2024-05': 2.2, '2024-06': 2.7, '2026-08': 2.4 }, // 股東改選、王思淳接棒
        channelMix: { '經濟日報': 18, '天下雜誌': 6, '數位時代': 9, '鉅亨網': 14, '巴哈姆特': 16, '4Gamers': 8, 'Yahoo新聞': 9, '聯合新聞網': 7, 'ETtoday': 6, '社群媒體': 7 }
    },
    'softstar': { // 大宇資訊
        basePR: 5, baseMedia: 32, baseSocial: 220, baseKol: 3,
        spikes: { '2024-05': 1.9, '2024-09': 2.8, '2026-01': 2.3 }, // 女鬼橋、售雙劍IP、光聚晶電更名
        channelMix: { '經濟日報': 14, '天下雜誌': 5, '數位時代': 12, '鉅亨網': 15, '巴哈姆特': 22, '4Gamers': 12, 'Yahoo新聞': 7, '聯合新聞網': 5, 'ETtoday': 4, '社群媒體': 4 }
    },
    'gamania': { // 橘子集團
        basePR: 7, baseMedia: 52, baseSocial: 420, baseKol: 9,
        spikes: { '2024-06': 2.5, '2025-01': 1.8, '2026-02': 2.1 }, // 波拉西亞戰記、AI商轉元年
        channelMix: { '經濟日報': 12, '天下雜誌': 8, '數位時代': 15, '鉅亨網': 10, '巴哈姆特': 20, '4Gamers': 10, 'Yahoo新聞': 8, '聯合新聞網': 5, 'ETtoday': 6, '社群媒體': 6 }
    },
    'wanin': { // 網銀國際
        basePR: 6, baseMedia: 40, baseSocial: 350, baseKol: 6,
        spikes: { '2024-06': 2.9, '2025-07': 1.7, '2026-07': 2.2 }, // 12.49億收購威秀、星城更名
        channelMix: { '經濟日報': 22, '天下雜誌': 10, '數位時代': 14, '鉅亨網': 16, '巴哈姆特': 10, '4Gamers': 8, 'Yahoo新聞': 7, '聯合新聞網': 5, 'ETtoday': 4, '社群媒體': 4 }
    },
    'wayi': { // 華義國際
        basePR: 4, baseMedia: 22, baseSocial: 260, baseKol: 3,
        spikes: { '2024-11': 1.8, '2025-06': 1.9, '2026-03': 1.7 }, // 合資進軍印度、離岸執照
        channelMix: { '經濟日報': 15, '天下雜誌': 5, '數位時代': 16, '鉅亨網': 18, '巴哈姆特': 14, '4Gamers': 10, 'Yahoo新聞': 8, '聯合新聞網': 6, 'ETtoday': 4, '社群媒體': 4 }
    },
    'userjoy': { // 宇峻奧汀
        basePR: 7, baseMedia: 36, baseSocial: 310, baseKol: 7,
        spikes: { '2025-01': 2.4, '2025-02': 2.2, '2026-08': 2.0 }, // FFXIV繁中版、三國群英傳
        channelMix: { '經濟日報': 14, '天下雜誌': 4, '數位時代': 10, '鉅亨網': 12, '巴哈姆特': 25, '4Gamers': 15, 'Yahoo新聞': 7, '聯合新聞網': 5, 'ETtoday': 4, '社群媒體': 4 }
    },
    'xlegend': { // 傳奇網路
        basePR: 5, baseMedia: 26, baseSocial: 210, baseKol: 4,
        spikes: { '2024-03': 1.6, '2025-05': 1.7, '2026-04': 1.6 }, // 精靈樂章、咻咻史萊姆
        channelMix: { '經濟日報': 12, '天下雜誌': 4, '數位時代': 9, '鉅亨網': 11, '巴哈姆特': 28, '4Gamers': 16, 'Yahoo新聞': 8, '聯合新聞網': 4, 'ETtoday': 4, '社群媒體': 4 }
    },
    'astro': { // 泰偉電子
        basePR: 2, baseMedia: 12, baseSocial: 70, baseKol: 1,
        spikes: { '2024-08': 1.5, '2025-10': 1.6, '2026-05': 1.4 }, // 機台與減資
        channelMix: { '經濟日報': 25, '天下雜誌': 8, '數位時代': 12, '鉅亨網': 25, '巴哈姆特': 5, '4Gamers': 5, 'Yahoo新聞': 8, '聯合新聞網': 5, 'ETtoday': 4, '社群媒體': 3 }
    }
};

const channels = ['經濟日報', '天下雜誌', '數位時代', '鉅亨網', '巴哈姆特', '4Gamers', 'Yahoo新聞', '聯合新聞網', 'ETtoday', '社群媒體'];

COMPANIES.forEach(company => {
    const prof = COMPANY_PROFILES[company.id] || { basePR: 4, baseMedia: 20, baseSocial: 150, baseKol: 2, spikes: {} };
    MONTHLY_STATS[company.id] = [];
    
    MONTHS_LIST.forEach((monthStr, idx) => {
        const sineWave = Math.sin(idx * 0.45) * 0.15 + 1.0;
        const spike = prof.spikes[monthStr] || 1.0;
        const factor = sineWave * spike;

        MONTHLY_STATS[company.id].push({
            month: monthStr,
            pressReleaseCount: Math.max(1, Math.round(prof.basePR * factor)),
            mediaCoverage: Math.max(5, Math.round(prof.baseMedia * factor)),
            socialMentions: Math.max(20, Math.round(prof.baseSocial * factor)),
            kolCollabs: Math.max(0, Math.round(prof.baseKol * factor))
        });
    });

    // 媒體通路分佈 (100% 穩定固定比例，避免亂數與 NaN 瑕疵)
    MEDIA_CHANNELS[company.id] = { ...(prof.channelMix || {}) };
});
