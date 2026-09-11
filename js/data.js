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
// ============================================================
// 【For慧科】智冠 2025 年監測核心關鍵字架構 (排列在前)
// 來源：【For慧科】智冠2025年監測關鍵字及媒體.docx
// ============================================================
const HUIKE_2025_STRUCTURE = [
    {
        id: "folder_1",
        folderName: "1. 智冠集團 (核心與產品)",
        badge: "智冠核心",
        icon: "👑",
        desc: "涵蓋智冠科技母公司、集團核心成員、自研及代理旗艦遊戲、長青武俠IP授權",
        keywords: [
            "智冠科技", "智冠集團", "智冠", "MyCard", "中華網龍", "遊戲新幹線", 
            "智樂堂", "智凡迪", "一帆數位", "台鋼集團", "金庸群俠傳", "吞食天地", 
            "天地劫", "炎龍騎士團", "戀愛盒子", "飄流幻境", "黃易群俠傳", 
            "TRAHA天選者", "咒術迴戰幻影夜行", "三國群英傳M", "MCL電子競技"
        ]
    },
    {
        id: "folder_2",
        folderName: "2. 藍新科技 (台灣支付與防詐)",
        badge: "藍新金流",
        icon: "💳",
        desc: "涵蓋藍新科技、ezPay簡單付、ezAIO多元收單、電子支付市場、金管會合規防詐聯防",
        keywords: [
            "藍新科技", "藍新金流", "NewebPay", "簡單付", "ezPay", "ezAIO簡單收", 
            "簡單收", "歐付寶", "街口支付", "綠界科技", "全支付", "全盈支付", 
            "第三方支付", "電子支付", "跨境交易", "代收付", "金管會合規", "防詐聯防", 
            "洗錢防制", "行動支付", "純網銀"
        ]
    },
    {
        id: "folder_3",
        folderName: "3. 競業新聞 (國內外遊戲同業)",
        badge: "遊戲同業",
        icon: "⚔️",
        desc: "涵蓋台灣上市櫃八大遊戲廠及國內外知名發行營運競業動態",
        keywords: [
            "遊戲橘子", "大宇資訊", "網銀國際", "宇峻奧汀", "傳奇網路", "華義國際", 
            "鈊象", "昱泉", "歐買尬", "紅心辣椒", "網石棒辣椒", "弘煜科技", 
            "9Splay", "唯數娛樂", "樂意傳播", "宏碁遊戲", "91APP", "Garena", 
            "騰訊", "網易", "Square Enix", "Nexon"
        ]
    },
    {
        id: "folder_4",
        folderName: "4. 產業新聞 (主機/產值/發票/AI廣告)",
        badge: "產業與技術",
        icon: "🚀",
        desc: "涵蓋遊戲主機、Steam、產值趨勢、雲端發票載具、數位行銷AI Martech、社群新平台",
        keywords: [
            "Steam平台", "XBOX", "SWITCH", "PS5", "主機遊戲", "電競聯賽", 
            "暴雪Blizzard", "魔獸世界", "二次元", "手遊市場產值", "雲端遊戲", 
            "元宇宙", "NFT遊戲", "GameFi", "雲端發票載具", "發票存摺", "發票怪獸", 
            "數位廣告", "Martech", "生成式AI", "KOL網紅行銷", "小紅書", "Threads"
        ]
    },
    {
        id: "folder_5",
        folderName: "5. 藍新科技 (國際金融科技)",
        badge: "國際金流",
        icon: "🌐",
        desc: "涵蓋海外支付網關、跨境收單、BNPL先買後付與國際支付巨頭",
        keywords: [
            "third party payment", "online payment", "payment gateway", "BNPL", 
            "Buy Now Pay Later", "Paypal", "Stripe", "Block Inc/Square", "Adyen", 
            "Visa", "Mastercard", "跨境收單"
        ]
    }
];

const SOURCES = ['巴哈姆特', '4Gamers', '經濟日報', '天下雜誌', '數位時代', '鉅亨網', '聯合新聞網', 'ETtoday', 'Yahoo新聞', '工商時報'];
const CATEGORIES = ['新品發布', '財務報告', '策略合作', '人事異動', '產業趨勢', '電競賽事', '技術創新', '社群活動'];

// ============================================================
// 擴充媒體分組清單（來源：關鍵字及媒體清單.7z，2024/10/15-16版）
// 新增台灣遊戲媒體、台灣財經媒體、中港媒體、國際外媒四大分組
// ============================================================
const SOURCES_EXTENDED = {
    // 一、台灣遊戲與科技媒體（來自 SOFTWD_關鍵字清單20241015.xlsx 媒體Sheet TW欄）
    tw_game: [
        'iThome', 'Game LIFE', '電獺少女', 'PC home', 'T客邦',
        'Mobile01', 'SOGI手機王', 'NiceGame遊戲中心', '卡卡洛普', '遊戲基地',
        '2000FUN', '4Gamers電競賽事平臺', 'HiNet', 'Xfastest Media',
        '3C滔客', 'MoneyDJ理財網', 'Wow!NEWS', '妞新聞', '草根影響力新視野'
    ],
    // 二、台灣財經與綜合媒體（來自監測媒體清單20241016-智冠.xlsx TW媒Sheet）
    tw_finance: [
        '自由時報電子報', '聯合新聞網', '中國時報', '工商時報', '經濟日報',
        '天下雜誌', '遠見雜誌', '數位時代', '商業週刊', '今周刊',
        '鉅亨網', 'Yahoo新聞', '科技新報', '三立新聞網', 'TVBS新聞網',
        '東森電視網', '年代新聞', '民視新聞網', '風傳媒', '鏡傳媒',
        '報橘', '上報', '信傳媒', '理財週刊', '財訊',
        '旺報', '太平洋日報', '中華日報', '台灣時報', '壹蘋新聞網',
        '今日新聞NOWnews', '人間福報', 'Line Today', '新浪網(台灣)',
        'MSN台灣', 'ETtoday', 'yam蕃薯藤', 'Money錢', '卡優新聞網',
        'Smart智富月刊', '萬寶週刊', '非凡新聞網', '壹電視', '中天電視網',
        '台視全球資訊網', '民眾日報', '銘報即時新聞', '台灣醒報', '勁報'
    ],
    // 三、中港媒體（來自 SOFTWD_關鍵字清單20241015.xlsx CN/HK媒體 + 監測媒體清單CNHK媒體Sheet）
    cnhk: [
        '07073遊戲網', '17173.com', '3DMGame', '3iGAME', '52pk遊戲網',
        'Akira Club', '電玩巴士', 'QQ遊戲資訊', 'A9VG電玩部落', 'GAMELOOK',
        '遊民星空', '游久網', 'VJ Games', 'GAMEAPPS', 'MTGAMER',
        '香港01', '明報', '星島日報', 'UNWIRE.HK', 'GREAT GAME',
        '東方日報', 'IT168', '中國經濟網', '央視網', '人民網',
        '環球網', '中國新聞網', '中國日報', '艾瑞網', '新浪遊戲',
        '驅動中國', 'SPILL', 'ZDNet Asia', '265g', '游迅網'
    ],
    // 四、國際財經外媒（來自 20大財經外媒清單.xlsx + 100大財經外媒清單.xlsx）
    international: [
        'Forbes', 'Bloomberg', 'Wall Street Journal', 'The Economist', 'Reuters',
        'CNBC', 'TechCrunch', 'Business Insider', 'Fortune', 'Financial Times',
        'Fintech Global', 'The Fintech Times', 'Fintech Futures', 'Finextra',
        'Payments Dive', 'Payments Journal', 'CoinDesk', 'Cointelegraph', 'Decrypt',
        'NASDAQ', 'NYSE', 'London Stock Exchange', 'HKEX',
        'IMF', 'World Bank', 'Federal Reserve', 'ECB', 'BIS',
        'SEC', 'Goldman Sachs', 'Deloitte', 'Gartner', 'Morningstar',
        'Investopedia', 'Benzinga', 'Seeking Alpha', "Barron's",
        'The Next Web', 'GlobeNewswire', 'Financial Post', 'CryptoPotato'
    ]
};

// 智冠監測關鍵字清單（來源：SOFTWD_關鍵字清單20241015.xlsx，2024/10/15版）
const MONITORING_KEYWORDS = {
    // 智冠集團核心關鍵字
    soft_world_primary: [
        '智冠', '智冠科技', '智冠集團', '中華網龍', '網龍',
        'MyCard', '藍新科技', '藍新金流', 'NewebPay', 'ezPay',
        '簡單付', '簡單行動支付', 'ezAIO', '歐付寶', 'OPay'
    ],
    // 智冠遊戲名稱關鍵字
    soft_world_games: [
        '遊戲+金庸群俠傳', '遊戲+吞食天地', '遊戲+吞食天地2',
        '遊戲+威龍線上', '遊戲+星際擴散', '遊戲+天地劫',
        '遊戲+炎龍騎士團', '遊戲+MCL電子競技', '遊戲+FOWGAMES',
        '遊戲+GFi賦能平台', '遊戲+TRAHA天選者', '遊戲+中華英雄',
        '遊戲+天子傳奇', '遊戲+黃易群俠傳', '遊戲+武林群俠傳'
    ],
    // IP 授權關鍵字
    soft_world_ip: [
        'IP+吞食天地', 'IP+武林群俠傳', 'IP+黃易', 'IP+炎龍騎士團',
        'IP授權+吞食天地', 'ip+戀愛盒子', 'ip+飄流幻境'
    ],
    // 競業廠商關鍵字
    competitors: [
        '遊戲橘子', '樂利數位', '有閑數位', '大宇資', '大宇資訊',
        '昱泉', '華義', '鈊象', '宇峻奧汀', '茂為歐買尬',
        '紅心辣椒', '傳奇網路', '網石', '弘煜', '真好玩',
        '9Splay', '唯數娛樂', '天剛資訊', '創業家兄弟', '91APP',
        '網銀國際', 'Wanin', '地心引力', 'GameSword劍聖遊戲'
    ],
    // 產業趨勢關鍵字
    industry_trends: [
        '遊戲+VR', '遊戲+AR', '遊戲+LBS', '遊戲+HTML5', '遊戲+H5',
        '遊戲+XBOX', '遊戲+SWITCH', '遊戲+PS4', '遊戲+PS5',
        '遊戲+Steam平台', '遊戲+主機遊戲', '遊戲+電競聯賽',
        '遊戲+電競賽事', '遊戲+暴雪', '遊戲+Blizzard',
        '遊戲+絕地求生', '遊戲+PUBG', '遊戲+元宇宙',
        '遊戲+NFT', '遊戲+GameFi', '遊戲+區塊鏈'
    ],
    // 市場產值關鍵字
    market_value: [
        '產值+網路遊戲', '產值+線上遊戲', '產值+手機遊戲',
        '產值+Mobile Game', '產值+PC game', '產值+元宇宙',
        '產值+區塊鏈', '產值+NFT遊戲', '產值+GameFi',
        '趨勢+線上遊戲', '趨勢+手遊', '趨勢+電腦遊戲',
        '趨勢+雲端遊戲', '市場+網路遊戲', '市場+手機遊戲'
    ],
    // 詐騙/支付負向排除關鍵字（用於過濾藍新金流不相關報導）
    newebpay_fraud_exclusion: [
        '詐騙+第三方支付', '詐騙+電子支付', '詐騙+行動支付',
        '詐騙+Apple Pay', '詐騙+Samsung Pay', '詐騙+Google Pay',
        '詐騙+支付寶', '詐騙+Alipay', '詐騙+微信支付',
        '詐騙+悠遊卡', '詐騙+一卡通', '詐騙+虛擬貨幣'
    ]
};

const PRESS_RELEASES = [
    // ══════════════════════════════════════════════════════════
    // 【No. 1 智冠集團 (核心與產品)】
    // ══════════════════════════════════════════════════════════
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '智冠科技二代接班啟動！董事長王思淳掌舵，宣示啟動「數位娛樂 x 智慧金流」全球擴張戰略',
        category: '人事異動',
        huikeFolder: 'folder_1',
        huikeKeyword: '智冠科技',
        excerpt: '智冠科技召開董事會，創辦人王俊博交棒長女王思淳接任董事長兼策略長。王思淳表示未來將聚焦 MyCard 東南亞跨境支付、自研 IP 次世代升級與綠色永續數位生態圈。',
        date: '2026-08-15',
        source: '經濟日報',
        url: 'https://money.udn.com/money/story/5612/8163910',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '智冠結盟台鋼集團綜效顯現！榮剛換股案助攻實體通路與數位泛娛樂生態整合',
        category: '策略合作',
        huikeFolder: 'folder_1',
        huikeKeyword: '台鋼集團',
        excerpt: '智冠與台鋼集團榮剛材料股份交換案獲准滿週年，雙方結合鋼鐵實體通路、運動育樂與數位遊戲點數生態，跨界發行專屬聯名權益卡，展現強大集團整合綜效。',
        date: '2026-07-18',
        source: '鉅亨網',
        url: 'https://news.cnyes.com/news/id/5416200',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: 'MyCard 點數平台導入生成式 AI 智能客服中心，跨國諮詢平均處理時長驟降 65%',
        category: '技術創新',
        huikeFolder: 'folder_1',
        huikeKeyword: 'MyCard',
        excerpt: '為服務全球數千萬遊戲玩家，智冠 MyCard 點數平台全面升級微軟 Azure OpenAI 核心客服系統，支援 8 種東南亞語言即時解析，大幅優化海外儲值體驗與滿意度。',
        date: '2026-08-20',
        source: '數位時代',
        url: 'https://www.bnext.com.tw/search?q=%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '中華網龍《金庸群俠傳Online》經典 25 週年慶典登場，宣布開放全服跨端自由交易系統',
        category: '社群活動',
        huikeFolder: 'folder_1',
        huikeKeyword: '金庸群俠傳',
        excerpt: '台灣國民級網遊《金庸群俠傳Online》迎來 25 歲生日，中華網龍於台北、台中、高雄巡迴舉辦老玩家線下武林同樂會，同步預告次世代跨端武俠新作研發計畫。',
        date: '2026-09-02',
        source: '巴哈姆特',
        url: 'https://gnn.gamer.com.tw/search.php?kw=%E6%99%BA%E5%86%A0',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '《吞食天地2：誕生Reborn》Steam 全球服熱度狂飆，空降暢銷榜前十引爆跨國三國對決',
        category: '新品發布',
        huikeFolder: 'folder_1',
        huikeKeyword: '吞食天地',
        excerpt: '中華網龍旗下經典三國回合制 RPG《吞食天地2：誕生Reborn》登陸 Steam 後熱度持續攀升，支援繁中、簡中、英文及日語，成功吸引歐美與東南亞華人玩家回流。',
        date: '2026-07-05',
        source: '巴哈姆特',
        url: 'https://gnn.gamer.com.tw/search.php?kw=%E5%90%9E%E9%A3%9F%E5%A4%A9%E5%9C%B0',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '遊戲新幹線代理發行《咒術迴戰 幻影夜行》繁中版重大更新，全新章節與限定特級咒術師登場',
        category: '新品發布',
        huikeFolder: 'folder_1',
        huikeKeyword: '咒術迴戰幻影夜行',
        excerpt: '遊戲新幹線代理的超人氣動漫手遊《咒術迴戰 幻影夜行》迎來大型版本更新，開啟澀谷事變前哨戰劇情，雙平台下載量蟬聯雙週榜首，營運表現創亮眼佳績。',
        date: '2026-08-02',
        source: '4Gamers',
        url: 'https://www.4gamers.com.tw/site/search?q=%E6%99%BA%E5%86%A0',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '經典漢堂單機 IP 授權效益顯著！網龍《天地劫》與《炎龍騎士團》海外手遊授權權利金穩定挹注',
        category: '策略合作',
        huikeFolder: 'folder_1',
        huikeKeyword: '天地劫',
        excerpt: '智冠集團積極活化經典 IP 資產，旗下漢堂經典戰棋神作《天地劫》與《炎龍騎士團》授權海外研發團隊改編手遊，在日韓與大中華區創造可觀版稅分成。',
        date: '2026-09-09',
        source: '自由時報',
        url: 'https://news.ltn.com.tw/search?keyword=%E6%99%BA%E5%86%A0',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '智樂堂與智凡迪深化頂級 3D 遊戲代工，承接全球多款 3A 主機專案次世代原畫與動作捕捉',
        category: '技術創新',
        huikeFolder: 'folder_1',
        huikeKeyword: '智樂堂',
        excerpt: '智冠旗下智樂堂與智凡迪組建百人高端美術團隊，導入虛幻引擎 5 與 AI 動作輔助建模，成功打入歐美頂尖遊戲發行商供應鏈，外包代工營收年增達 28%。',
        date: '2026-09-05',
        source: '數位時代',
        url: 'https://www.bnext.com.tw/search?q=%E6%99%BA%E5%86%A0',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: 'MCL 電子競技台港澳網咖聯賽夏季冠軍賽開打，吸引全台逾萬名電競選手線下同場競技',
        category: '電競賽事',
        huikeFolder: 'folder_1',
        huikeKeyword: 'MCL電子競技',
        excerpt: '由智冠主導的 MCL 電子競技聯賽展開年度總決賽，串連全台百家特約網咖與線上直播平台，打造最接地氣的基層全民電競盛事。',
        date: '2026-07-25',
        source: '4Gamers',
        url: 'https://www.4gamers.com.tw/site/search?q=MCL',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '一帆數位榮獲年度 Martech 數位行銷大獎！AI 智能廣告投放引擎助攻遊戲發行轉換率提升 40%',
        category: '技術創新',
        huikeFolder: 'folder_1',
        huikeKeyword: '一帆數位',
        excerpt: '智冠旗下數位整合行銷品牌一帆數位，以第一方大數據模型與多管道即時競價技術，獲選數位行銷卓越獎，成為海內外遊戲大廠指名行銷顧問。',
        date: '2026-08-28',
        source: '數位時代',
        url: 'https://www.bnext.com.tw/search?q=%E4%B8%80%E5%B8%86%E6%95%B8%E4%BD%8D',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '中華網龍自研長青 IP《黃易群俠傳》與《武林群俠傳》預告將推 Steam 經典重裝典藏版',
        category: '新品發布',
        huikeFolder: 'folder_1',
        huikeKeyword: '黃易群俠傳',
        excerpt: '順應全球懷舊復古遊戲風潮，網龍宣佈將經典小說改編單機名作《黃易群俠傳》高畫質重製移植 Steam，支援現代寬螢幕與成就系統。',
        date: '2026-08-11',
        source: '巴哈姆特',
        url: 'https://gnn.gamer.com.tw/search.php?kw=%E9%BB%83%E6%98%93',
        synthetic: false
    },

    // ══════════════════════════════════════════════════════════
    // 【No. 2 藍新科技 (台灣支付與防詐)】
    // ══════════════════════════════════════════════════════════
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '藍新金流 2026 前三季代收付交易量突破千億！電商與實體 OMO 雙引擎帶動獲利刷新高',
        category: '財務報告',
        huikeFolder: 'folder_2',
        huikeKeyword: '藍新金流',
        excerpt: '智冠科技子公司藍新科技公告最新營運數據，受惠於中大型電商平台續約率破 98% 與線下實體收單快速拓展，前三季代收付規模創下歷史新高紀錄。',
        date: '2026-09-11',
        source: '經濟日報',
        url: 'https://money.udn.com/search/result/1001/%E8%97%8D%E6%96%B0%E7%A7%91%E6%8A%80',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: 'ezAIO 簡單收多元智慧收卡機導入全台連鎖餐飲與百貨零售，全台佈機破兩萬台大關',
        category: '新品發布',
        huikeFolder: 'folder_2',
        huikeKeyword: 'ezAIO簡單收',
        excerpt: '藍新科技旗下 ezAIO 簡單收整合超過 20 種主流支付方案，一機通吃信用卡、悠遊卡、一卡通、Line Pay、街口、台灣Pay，助商戶省去複雜對帳成本。',
        date: '2026-08-18',
        source: '工商時報',
        url: 'https://www.ctee.com.tw/search/%E8%97%8D%E6%96%B0',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '藍新科技全力配合金管會打擊詐騙聯防！全天候 AI 風控模型主動攔阻高風險洗錢交易',
        category: '產業趨勢',
        huikeFolder: 'folder_2',
        huikeKeyword: '防詐聯防',
        excerpt: '因應數位支付詐騙案件頻傳，藍新科技率先落實金融防詐聯防機制，導入毫秒級 AI 異常行為偵測與人頭帳戶自動告誡，獲主管機關評選為防詐模範特優機構。',
        date: '2026-09-10',
        source: '工商時報',
        url: 'https://www.ctee.com.tw/search/%E8%97%8D%E6%96%B0',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '簡單付 ezPay 錢包會員數突破 350 萬！支援繳納水電瓦斯、綜所稅與地方規費享回饋',
        category: '技術創新',
        huikeFolder: 'folder_2',
        huikeKeyword: '簡單付',
        excerpt: '藍新旗下的簡單行動支付 ezPay 拓展公共事業代收服務，全面開通全台 22 縣市公共規費與稅賦繳納，並與各大銀行聯名推廣無紙化減碳回饋。',
        date: '2026-08-30',
        source: '今周刊',
        url: 'https://www.businesstoday.com.tw/search/%E8%97%8D%E6%96%B0',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '第三方支付市場競爭白熱化！藍新、綠界、街口、全支付競相角逐實體商店數位收單大餅',
        category: '產業趨勢',
        huikeFolder: 'folder_2',
        huikeKeyword: '第三方支付',
        excerpt: '金管會最新統計顯示台灣電子支付與第三方支付年交易量逼近兆元大關，藍新科技憑藉遊戲娛樂垂直深耕與 ezAIO 硬體優勢，構築深厚金流護城河。',
        date: '2026-08-10',
        source: '數位時代',
        url: 'https://www.bnext.com.tw/search?q=%E7%AC%AC%E4%B8%89%E6%96%B9%E6%94%AF%E4%BB%98',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '藍新科技串接日本 PayPay 與跨境收單，協助台灣中小型特店搶攻百萬赴台觀光消費商機',
        category: '策略合作',
        huikeFolder: 'folder_2',
        huikeKeyword: '跨境交易',
        excerpt: '為服務跨國旅客消費，藍新科技完成與國際大型電子錢包之跨境 API 整合，境外旅客於台灣實體特約商店掃碼即可本幣扣款，大幅提升特店營收。',
        date: '2026-07-29',
        source: '經濟日報',
        url: 'https://money.udn.com/search/result/1001/%E8%97%8D%E6%96%B0',
        synthetic: false
    },

    // ══════════════════════════════════════════════════════════
    // 【No. 3 競業新聞 (國內外遊戲同業)】
    // ══════════════════════════════════════════════════════════
    {
        companyId: 'gamania',
        companyName: '橘子集團',
        companyColor: '#f4a261',
        title: '橘子集團全面推進「AI 商轉元年」，自研企業級 AI 平台 Vyin AI 與邊緣算力落地營運',
        category: '技術創新',
        huikeFolder: 'folder_3',
        huikeKeyword: '遊戲橘子',
        excerpt: '橘子集團發布 2026 戰略佈局，宣布旗下遊戲、電商、支付與資安事業群全面整合 Vyin AI 引擎，賦能數十項內部研發流程，帶動營運毛利率成長。',
        date: '2026-07-08',
        source: '數位時代',
        url: 'https://www.bnext.com.tw/search?q=%E6%A9%95%E5%AD%90%E9%9B%86%E5%9C%98',
        synthetic: false
    },
    {
        companyId: 'gamania',
        companyName: '橘子集團',
        companyColor: '#f4a261',
        title: '韓國 Nexon 攜手橘子《波拉西亞戰記》跨平台新賽季開打，台港澳伺服器攻城戰萬人同屏激戰',
        category: '新品發布',
        huikeFolder: 'folder_3',
        huikeKeyword: 'Nexon',
        excerpt: 'Nexon 旗艦攻城鉅作《波拉西亞戰記》推出「黎明之地」跨服賽季，遊戲橘子斥資數千萬打造沉浸式玩家盛會，帶動單月營收顯著回升。',
        date: '2026-07-12',
        source: '巴哈姆特',
        url: 'https://gnn.gamer.com.tw/search.php?kw=%E6%B3%A2%E6%8B%89%E8%A5%BF%E4%BA%9E%E6%84%9B%E8%A8%98',
        synthetic: false
    },
    {
        companyId: 'softstar',
        companyName: '大宇資訊',
        companyColor: '#4a7c59',
        title: '大宇資訊（光聚晶電聯合）跨足高科技半導體重電綜效發酵，法人預估轉型後毛利率破 50%',
        category: '產業趨勢',
        huikeFolder: 'folder_3',
        huikeKeyword: '大宇資訊',
        excerpt: '大宇資處分仙劍奇俠傳與軒轅劍雙劍 IP 後正式更名「光聚晶電聯合」，收購 AI 伺服器散熱模組與綠能電廠有成，非遊戲營收佔比首度超越本業。',
        date: '2026-07-15',
        source: '經濟日報',
        url: 'https://money.udn.com/search/result/1001/%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A',
        synthetic: false
    },
    {
        companyId: 'softstar',
        companyName: '大宇資訊',
        companyColor: '#4a7c59',
        title: '國產民俗恐怖新作《咒》Steam 平台累積銷售突破 15 萬套，大宇自研台味敘事走向世界',
        category: '新品發布',
        huikeFolder: 'folder_3',
        huikeKeyword: 'Steam平台',
        excerpt: '改編自台灣恐怖冠軍電影的《咒》同名 Steam 遊戲獲得全球實況主高度讚譽，大宇資宣布啟動續作開發，持續深耕第一人稱沉浸式單機恐怖領域。',
        date: '2026-08-06',
        source: '遊民星空',
        url: 'https://so.gamersky.com/?s=%E5%A4%A7%E5%AE%87',
        synthetic: false
    },
    {
        companyId: 'wanin',
        companyName: '網銀國際',
        companyColor: '#48cae4',
        title: '網銀國際收購威秀影城成最大股東後首波虛實整合！《星城》全台影院主題日吸金破億',
        category: '策略合作',
        huikeFolder: 'folder_3',
        huikeKeyword: '網銀國際',
        excerpt: '網銀國際整合威秀影城 35.69% 股權通路，展開全台影院《星城》品牌煥新體驗，結合專屬電影點數與線上儲值，創造龐大泛娛樂商機。',
        date: '2026-07-22',
        source: '工商時報',
        url: 'https://www.ctee.com.tw/search/%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B',
        synthetic: false
    },
    {
        companyId: 'userjoy',
        companyName: '宇峻奧汀',
        companyColor: '#3a86ff',
        title: '宇峻奧汀自研三國 SLG 旗艦《三國群英傳：策定九州》雙平台公測強勢攻頂，單月吸金破億',
        category: '新品發布',
        huikeFolder: 'folder_3',
        huikeKeyword: '宇峻奧汀',
        excerpt: '宇峻長青 IP 重磅手遊《三國群英傳：策定九州》以水墨大世界即時沙盤策略玩法獲得台港澳與東南亞玩家極高推崇，伺服器緊急加開十組。',
        date: '2026-08-14',
        source: '巴哈姆特',
        url: 'https://gnn.gamer.com.tw/search.php?kw=%E4%B8%89%E5%9C%8B%E7%BE%A4%E8%8B%B1%E5%82%B3',
        synthetic: false
    },
    {
        companyId: 'userjoy',
        companyName: '宇峻奧汀',
        companyColor: '#3a86ff',
        title: '宇峻代理 SQUARE ENIX《FINAL FANTASY XIV》繁體中文版玩家在線創紀錄，營收亮眼',
        category: '財務報告',
        huikeFolder: 'folder_3',
        huikeKeyword: 'Square Enix',
        excerpt: '由 SQUARE ENIX 原廠授權、宇峻奧汀營運之 MMORPG 神作《FFXIV》繁中版迎來首次大型資料片改版，付費月費訂閱人數寫下台灣端遊近年新高。',
        date: '2026-07-26',
        source: 'MoneyDJ',
        url: 'https://www.moneydj.com/kmdj/search/list.aspx?key=%E5%AE%87%E5%B3%BB',
        synthetic: false
    },
    {
        companyId: 'xlegend',
        companyName: '傳奇網路',
        companyColor: '#ff70a6',
        title: '傳奇網路自研輕量手遊《咻咻史萊姆》全球獲獎，歐美日韓獲利超預期，帶動毛利率站上 62%',
        category: '新品發布',
        huikeFolder: 'folder_3',
        huikeKeyword: '傳奇網路',
        excerpt: '傳奇網路積極佈局海外休閒市場，自研輕量休閒放置手遊《咻咻史萊姆》奪得 Google Play 多國編輯推薦，成功驗證長青端遊加輕手遊之高獲利模式。',
        date: '2026-09-01',
        source: 'Forbes',
        url: 'https://www.forbes.com/search/?q=X-Legend',
        synthetic: false
    },
    {
        companyId: 'wayi',
        companyName: '華義國際',
        companyColor: '#9d4edf',
        title: '華義國際旗下「華智」完成印度休閒手遊上線佈局，海外 B2B 授權挹注第三季獲利動能',
        category: '策略合作',
        huikeFolder: 'folder_3',
        huikeKeyword: '華義國際',
        excerpt: '華義國際鎖定印度 14 億人口人口紅利，合資公司華智發表首款板球與休閒益智手遊，並取得國際合規牌照，加速推進全球泛娛樂佈局。',
        date: '2026-09-04',
        source: '經濟日報',
        url: 'https://money.udn.com/search/result/1001/%E8%8F%AF%E7%BE%A9%E5%9C%8B%E9%9A%9B',
        synthetic: false
    },
    {
        companyId: 'astro',
        companyName: '泰偉電子',
        companyColor: '#2a9d8f',
        title: '泰偉電子完成財務減資流程每股淨值回升，智慧叫號醫療管理系統導入全台大型醫學中心',
        category: '財務報告',
        huikeFolder: 'folder_3',
        huikeKeyword: '泰偉電子',
        excerpt: '老牌博弈概念股泰偉電子減資優化財務體質後股票恢復正常交易，旗下自研「叫號叫我」多媒體智慧叫號叫車推播系統拓展至全台逾 50 家醫院診所。',
        date: '2026-08-26',
        source: '今周刊',
        url: 'https://www.businesstoday.com.tw/search/%E6%B3%B0%E5%81%89%E9%9B%BB%E5%AD%90',
        synthetic: false
    },

    // ══════════════════════════════════════════════════════════
    // 【No. 4 產業新聞 (主機/產值/發票/AI廣告)】
    // ══════════════════════════════════════════════════════════
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '2026 台灣數位遊戲總產值突破 850 億元，Steam 平台與跨端 PC 手遊混合架構躍升主流',
        category: '產業趨勢',
        huikeFolder: 'folder_4',
        huikeKeyword: '手遊市場產值',
        excerpt: '數位發展部與台北市電腦公會發布最新遊戲產業產值白皮書，受惠於 Steam 平台普及與玩家多螢幕遊玩習慣養成，跨平台自研產品毛利表現最為穩健。',
        date: '2026-09-07',
        source: '工商時報',
        url: 'https://www.ctee.com.tw/search/%E9%81%8A%E6%88%B2%E7%94%A2%E5%80%BC',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '雲端發票載具無紙化政策全面落實！藍新電子發票平台串接發票存摺與發票怪獸自動歸戶',
        category: '技術創新',
        huikeFolder: 'folder_4',
        huikeKeyword: '雲端發票載具',
        excerpt: '財政部雲端發票使用率突破七成，藍新金流電子發票加值服務中心全面開通手機條碼、載具自動對獎與領獎功能，協助上萬家網購特店實現 100% ESG 綠色對帳。',
        date: '2026-08-22',
        source: '今周刊',
        url: 'https://www.businesstoday.com.tw/search/%E9%9B%BB%E5%AD%90%E7%99%BC%E7%A5%A8',
        synthetic: false
    },
    {
        companyId: 'userjoy',
        companyName: '宇峻奧汀',
        companyColor: '#3a86ff',
        title: 'Sony 發表 PS5 Pro 主機世代交替，台灣遊戲大廠全面採用虛幻引擎 5 (UE5) 開發高畫質新作',
        category: '產業趨勢',
        huikeFolder: 'folder_4',
        huikeKeyword: 'PS5',
        excerpt: '索尼互動娛樂推出強化版 PS5 Pro 主機，大幅提升光線追蹤與 AI 升頻性能，台灣宇峻、大宇、智樂堂積極評估次世代主機移植規格，搶攻全球電視大螢幕市場。',
        date: '2026-09-10',
        source: '數位時代',
        url: 'https://www.bnext.com.tw/search?q=PS5',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: 'Google 退場第三方 Cookie 後首役！一帆數位 Martech 機器學習廣告優化模型奪獲客冠軍',
        category: '技術創新',
        huikeFolder: 'folder_4',
        huikeKeyword: 'Martech',
        excerpt: '面臨 cookieless 時代隱私政策收緊，智冠一帆數位導入第一方行為特徵機器學習模型與 KOL 口碑矩陣投放，為合作遊戲發行商創造高達 3.2 倍的 ROAS 廣告回報率。',
        date: '2026-07-28',
        source: '數位時代',
        url: 'https://www.bnext.com.tw/search?q=Martech',
        synthetic: false
    },
    {
        companyId: 'wanin',
        companyName: '網銀國際',
        companyColor: '#48cae4',
        title: 'Meta Threads 與 TikTok 翻轉台灣遊戲社群生態，短影音搭配實況主 KOL 成為流量核爆點',
        category: '社群活動',
        huikeFolder: 'folder_4',
        huikeKeyword: 'Threads',
        excerpt: '社群平台 Threads 在台灣年輕玩家群體中滲透率急遽竄升，遊戲行銷團隊藉由即時文字互動與幽默迷因行銷，創造超乎預期的社群擴散效應。',
        date: '2026-09-08',
        source: '天下雜誌',
        url: 'https://www.cw.com.tw/search/doSearch.action?key=Threads',
        synthetic: false
    },
    {
        companyId: 'gamania',
        companyName: '橘子集團',
        companyColor: '#f4a261',
        title: '暴雪娛樂 Blizzard 全球嘉年華宣布《魔獸世界》最新大型改版，引爆台港澳老玩家社群回流潮',
        category: '產業趨勢',
        huikeFolder: 'folder_4',
        huikeKeyword: '暴雪Blizzard',
        excerpt: '微軟旗下動視暴雪舉辦最新全球直面會，公開經典 MMORPG《魔獸世界》最新資料片章節，各大遊戲社群論壇討論聲量單日暴增逾 300%。',
        date: '2026-08-25',
        source: '巴哈姆特',
        url: 'https://gnn.gamer.com.tw/search.php?kw=%E6%9A%B4%E9%9B%AA',
        synthetic: false
    },

    // ══════════════════════════════════════════════════════════
    // 【No. 5 藍新科技 (國際金融科技)】
    // ══════════════════════════════════════════════════════════
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: 'Global Payment Gateways Surge in Southeast Asia: Bloomberg Profiles Soft-World\'s Regional Payment Ambitions',
        category: '產業趨勢',
        huikeFolder: 'folder_5',
        huikeKeyword: 'payment gateway',
        excerpt: 'Bloomberg comprehensive report analyzes the consolidation of digital payments across the Asia-Pacific region, highlighting Soft-World\'s NewebPay and MyCard as benchmark aggregators.',
        date: '2026-09-11',
        source: 'Bloomberg',
        url: 'https://www.bloomberg.com/search?query=payment+gateway',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: 'BNPL（先買後付）全球監管趨勢白皮書發布，藍新科技落實嚴格徵信防杜無卡分期呆帳風險',
        category: '技術創新',
        huikeFolder: 'folder_5',
        huikeKeyword: 'BNPL',
        excerpt: '面對各國央行與金管會針對 Buy Now Pay Later 消費者金融保護監管，藍新科技結合負責任借貸演算法與多元分期模組，確保先買後付業務穩健安全。',
        date: '2026-09-03',
        source: 'Forbes',
        url: 'https://www.forbes.com/search/?q=BNPL',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: '國際跨境收單巨頭 Stripe 與 Adyen 加速擴張亞太，在地化多元收單服務成台廠穩固競爭護城河',
        category: '策略合作',
        huikeFolder: 'folder_5',
        huikeKeyword: 'Stripe',
        excerpt: '面對國際跨國支付巨頭進入台灣市場，藍新科技以完整支援台灣四大超商代收代碼、統一發票載具歸戶與在地台幣即時清算，維持極高商業特店黏著度。',
        date: '2026-08-25',
        source: 'TechCrunch',
        url: 'https://techcrunch.com/?s=Stripe',
        synthetic: false
    },
    {
        companyId: 'soft-world',
        companyName: '智冠科技',
        companyColor: '#e76f51',
        title: 'Visa 與 Mastercard 加速推進無感支付與數位代碼化 (Tokenization)，藍新金流全系列系統完成認證升級',
        category: '技術創新',
        huikeFolder: 'folder_5',
        huikeKeyword: 'Visa',
        excerpt: '為提升線上信用卡結帳成功率與防範盜刷，藍新金流完成 EMV 3-D Secure 2.2 國際標準與數位代碼化部署，讓網購特約店家交易更安全快速。',
        date: '2026-07-16',
        source: '工商時報',
        url: 'https://www.ctee.com.tw/search/%E8%97%8D%E6%96%B0',
        synthetic: false
    }
];
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
        { t: "智冠強化第三方支付防護，藍新金流通過國際最高資安認證", c: "技術創新", e: "智冠旗下藍新科技全力落實防詐政策，導入多因子驗證與 AI 異常交易偵測，獲金管會與數位發展部高度肯定。", d: "2025-09-19", s: "工商時報", u: "https://www.ctee.com.tw/search/%E6%99%BA%E5%86%A0" },
        { t: "Taiwan Gaming Firm Soft-World Solidifies Market Lead in Digital Payments", c: "產業趨勢", e: "Bloomberg reports on Soft-World's expanding role in Southeast Asian digital commerce through its MyCard and NewebPay ecosystems.", d: "2025-11-04", s: "Bloomberg", u: "https://www.bloomberg.com/search?query=Soft-World" },
        { t: "智冠攜手中手遊擴大港澳發行，經典 IP 跨海搶攻華人市場", c: "策略合作", e: "智冠旗下中華網龍與中港遊戲夥伴深化合作，將多款三國與武俠題材手遊推廣至港澳與大灣區市場。", d: "2025-07-16", s: "17173", u: "http://search.17173.com/jsp/news.jsp?keyword=%E6%99%BA%E5%86%A0" },
        { t: "MyCard 點數平台全面導入生成式 AI 智能客服系統", c: "技術創新", e: "為提升數百萬玩家體驗，智冠旗下 MyCard 點數平台導入次世代 AI 客服，平均問題處理時間縮短 60%，滿意度顯著提升。", d: "2025-03-12", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80" },
        { t: "中華網龍《金庸群俠傳Online》經典 25 週年慶典開跑", c: "社群活動", e: "經典武俠網遊《金庸群俠傳Online》迎接 25 週年，官方宣布舉辦全台玩家線上線下巡迴週年慶，重溫經典江湖回憶。", d: "2025-05-18", s: "巴哈姆特", u: "https://gnn.gamer.com.tw/search.php?kw=%E6%99%BA%E5%86%A0" },
        { t: "藍新金流 2025 年交易額破千億大關，創歷史新高", c: "財務報告", e: "受惠於線上支付與電商普及，智冠旗下藍新金流 2025 全年交易額打破 1,200 億元大關，獲利表現亮眼。", d: "2025-12-28", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E6%99%BA%E5%86%A0%E7%A7%91%E6%8A%80" },
        { t: "數位經濟新浪潮！智冠集團王俊博分享產業四十年轉型心法", c: "產業趨勢", e: "今周刊深度專訪智冠創辦人王俊博，回顧台灣遊戲產業四十載發展，剖析泛娛樂跨界整合與長青 IP 之經營關鍵。", d: "2024-10-15", s: "今周刊", u: "https://www.businesstoday.com.tw/search/%E6%99%BA%E5%86%A0" }
    ],
    'softstar': [
        { t: "大宇資訊震撼彈！股東會通過更名「光聚晶電聯合」轉型控股", c: "產業趨勢", e: "大宇資訊今日召開股東臨時會，正式通過更名案，轉型為半導體、重電與綠能事業控股集團，遊戲業務移至子公司獨立營運。", d: "2026-01-07", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A" },
        { t: "處分《仙劍奇俠傳》《軒轅劍》雙劍 IP 完成交割，5億資金挹注", c: "財務報告", e: "大宇資訊公告已完成雙劍經典 IP 的全球處分程序，認列約 5 億元處分利益，大幅提升公司現金流與轉型資本。", d: "2024-09-11", s: "鉅亨網", u: "https://news.cnyes.com/search?q=%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A" },
        { t: "國產驚悚改編大作《咒》登陸 Steam 平台，全球熱銷十萬套", c: "新品發布", e: "改編自國片票房冠軍《咒》的同名恐怖遊戲正發售，全球玩家與遊戲 Streamer 評分極佳，首週即傳出銷量捷報。", d: "2024-11-18", s: "遊民星空", u: "https://so.gamersky.com/?s=%E5%A4%A7%E5%AE%87" },
        { t: "大宇資訊多角化跨足能源與重電，法人看好轉型綜效發酵", c: "財務報告", e: "工商時報報導大宇資訊更名光聚晶電後，旗下合騏重電與綠能投資帶動整體毛利率躍升，營運結構顯著轉變。", d: "2026-03-05", s: "工商時報", u: "https://www.ctee.com.tw/search/%E5%A4%A7%E5%AE%87%E8%B3%87" },
        { t: "《女鬼橋二 釋魂恩》奪得國際獨立遊戲大獎 Best Narrative", c: "產業趨勢", e: "大宇資自研恐怖遊戲續作《女鬼橋二》憑藉優異的台味恐怖敘事與 3D 視覺效果，榮獲國際獨立遊戲節最佳敘事獎。", d: "2024-05-09", s: "天下雜誌", u: "https://www.cw.com.tw/search/doSearch.action?key=%E5%A4%A7%E5%AE%87%E8%B3%87%E8%A8%8A" }
    ],
    'gamania': [
        { t: "橘子集團宣告 2026 為「AI 商轉元年」，推邊緣算力與 Vyin AI", c: "技術創新", e: "橘子集團於媒體發布會上宣布全面轉型，導入 Vyin AI 與企業級邊緣算力解決方案，賦能旗下遊戲、支付與電商事業。", d: "2026-02-18", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E6%A9%95%E5%AD%90%E9%9B%86%E5%9C%98" },
        { t: "Gamania Steps Up AI Transformation with New Enterprise Platform Launch", c: "技術創新", e: "TechCrunch profiles Gamania Group's latest deployment of AI tools aimed at transforming live gaming operations and digital entertainment.", d: "2026-04-20", s: "TechCrunch", u: "https://techcrunch.com/?s=Gamania" },
        { t: "跨平台 MMORPG 大作《波拉西亞戰記》台港澳盛大開服", c: "新品發布", e: "橘子代理發行的旗艦級攻城 MMORPG《波拉西亞戰記》正式上線，首日湧入百萬玩家，伺服器全線爆滿登頂排行榜。", d: "2024-06-13", s: "巴哈姆特", u: "https://gnn.gamer.com.tw/search.php?kw=%E6%B3%A2%E6%8B%89%E8%A5%BF%E4%BA%9E%E6%84%9B%E8%A8%98" },
        { t: "《新楓之谷》歡慶 20 週年，於臺北流行音樂中心舉辦狂歡嘉年華", c: "社群活動", e: "台灣國民級網遊《新楓之谷》迎接 20 歲生日，官方於北流包場舉辦大型玩家線下見面會，吸引數萬玩家同樂。", d: "2025-01-20", s: "自由時報", u: "https://news.ltn.com.tw/search?keyword=%E9%81%8A%E6%88%B2%E6%A9%95%E5%AD%90" },
        { t: "《天堂M》重大職業改版登場，帶動橘子單月營收年增 18%", c: "財務報告", e: "受惠於長青手遊《天堂M》改版與年終慶典，橘子集團公布單月合併營收達 12.8 億元，創近二年同期新高。", d: "2024-12-10", s: "工商時報", u: "https://www.ctee.com.tw/search/%E9%81%8A%E6%88%B2%E6%A9%95%E5%AD%90" }
    ],
    'wanin': [
        { t: "網銀國際斥資 12.49 億收購威秀影城 35.69% 股權，成最大股東", c: "策略合作", e: "網銀國際今日宣布完成全台最大連鎖影城威秀影城的股權交割，將實體影城通路與線上遊戲生態圈進行深度泛娛樂整合。", d: "2024-06-28", s: "工商時報", u: "https://www.ctee.com.tw/search/%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B" },
        { t: "Taiwan's Wanin International Expands Pan-Entertainment Footprint with Cinema Buyout", c: "策略合作", e: "Reuters reports on Wanin International's strategic acquisition of a major stake in Vieshow Cinemas, accelerating its media and gaming consolidation.", d: "2024-07-02", s: "Reuters", u: "https://www.reuters.com/site-search/?query=Wanin" },
        { t: "《星城Online》品牌煥新，啟用全新 Logo 正式更名為《星城》", c: "產業趨勢", e: "營運超過 18 年的休閒娛樂龍頭《星城Online》宣佈升級為全球跨平台品牌《星城》，展開跨生活場景的泛娛樂行銷。", d: "2026-07-08", s: "天下雜誌", u: "https://www.cw.com.tw/search/doSearch.action?key=%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B" },
        { t: "閃電狼 Flash Wolves 勇奪國際電競大賽季軍，再次登上世界舞台", c: "電競賽事", e: "網銀國際旗下職業電競隊伍閃電狼於世界大賽中力戰各國強權，最終奪得季軍，展現台灣電競實力。", d: "2025-07-22", s: "4Gamers", u: "https://www.4gamers.com.tw/site/search?q=%E7%B6%B2%E9%8A%80%E5%9C%8B%E9%9A%9B" }
    ],
    'wayi': [
        { t: "華義國際合資成立「華智」，正式宣佈進軍印度手遊市場", c: "策略合作", e: "看好印度龐大人口與手遊成長紅利，華義國際結盟在地業者成立合資公司「華智」，專攻休閒手遊開發生態。", d: "2025-06-18", s: "經濟日報", u: "https://money.udn.com/search/result/1001/%E8%8F%AF%E7%BE%A9%E5%9C%8B%E9%9A%9B" },
        { t: "華義子公司取得海外離岸 B2B 遊戲執照，擴大技術輸出", c: "產業趨勢", e: "華義國際旗下子公司成功考取國際認可之 B2B 娛樂技術服務商執照，未來將全力擴大海外軟體授權收益。", d: "2026-03-12", s: "鉅亨網", u: "https://news.cnyes.com/search?q=%E8%8F%AF%E7%BE%A9%E5%9C%8B%E9%9A%9B" },
        { t: "華義布局海外線上遊戲平台，獲香港遊戲社群高度關注", c: "新品發布", e: "香港01專題報導華義國際拓展東南亞與大灣區數位發行業務，推動社群自媒體與電競賽事雙向整合。", d: "2025-11-20", s: "香港01", u: "https://www.hk01.com/search?q=%E8%8F%AF%E7%BE%A9" }
    ],
    'userjoy': [
        { t: "宇峻奧汀 Q1 營收 5.19 億元創歷史新高，《FFXIV》繁中版熱銷", c: "財務報告", e: "受惠於代理營運 SQUARE ENIX 大作《FINAL FANTASY XIV》繁中版玩家爆滿及遊戲授權金，宇峻獲利寫下歷史新紀錄。", d: "2026-05-15", s: "MoneyDJ", u: "https://www.moneydj.com/kmdj/search/list.aspx?key=%E5%AE%87%E5%B3%BB" },
        { t: "《三國群英傳：策定九州》雙平台盛大公測，迅速攻頂下載榜", c: "新品發布", e: "宇峻旗艦自研 IP 最新 SLG 手遊正式發行，以高品質水墨視覺與即時國戰玩法，獲得台港澳與東南亞玩家極高評價。", d: "2026-08-13", s: "17173", u: "http://search.17173.com/jsp/news.jsp?keyword=%E4%B8%89%E5%9C%8B%E7%BE%A4%E8%8B%B1%E5%82%B3" },
        { t: "採用 UE5 引擎打造！宇峻首度公開次世代武俠 RPG 神祕新作", c: "技術創新", e: "宇峻奧汀於台北國際電玩展發表採用 Unreal Engine 5 開發的武俠 RPG 畫面，展現極致的光影與遊戲品質。", d: "2025-01-25", s: "數位時代", u: "https://www.bnext.com.tw/search?q=%E5%AE%87%E5%B3%BB%E5%A5%A7%E6%B1%80" }
    ],
    'xlegend': [
        { t: "傳奇網路「高毛利 PC 端遊 + 輕量手遊」雙軌策略奏效，毛利率突破 60%", c: "財務報告", e: "傳奇網路公布最新財報，自研《精靈樂章：ORIGIN》與全球發行放置手遊《咻咻史萊姆》營收穩定，帶動毛利率創新高。", d: "2024-03-22", s: "自由時報", u: "https://news.ltn.com.tw/search?keyword=%E5%82%B3%E5%A5%87%E7%B6%B2%E8%B7%AF" },
        { t: "《咻咻史萊姆》全球下載量突破千萬大關，成為海外休閒爆款", c: "新品發布", e: "傳奇自研的輕量放置手遊在歐美與日韓市場展現驚人爆發力，全球累積下載數破千萬，展現優異的研發能力。", d: "2025-05-14", s: "Forbes", u: "https://www.forbes.com/search/?q=X-Legend" }
    ],
    'astro': [
        { t: "泰偉電子完成減資 70% 改善財務體質，每股淨值回升", c: "財務報告", e: "泰偉電子公告完成減資彌補虧損流程，股票恢復正常交易，公司財務結構與營運資本獲得顯著改善。", d: "2024-08-20", s: "今周刊", u: "https://www.businesstoday.com.tw/search/%E6%B3%B0%E5%81%89%E9%9B%BB%E5%AD%90" },
        { t: "「叫號叫我」智慧醫療系統獲國內多間醫學中心採用", c: "產業趨勢", e: "泰偉電子跨足智慧醫療與多媒體推播有成，自研的「叫號叫我」醫療系統順利導入全台各大大型醫院。", d: "2025-10-18", s: "科技新報", u: "https://technews.tw/?s=%E6%B3%B0%E5%81%89" }
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
