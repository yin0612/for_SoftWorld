// 台灣遊戲與金融支付業者基本資料
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
    },
    // 金融支付主要業者（產業總覽延伸；新聞仍以即時監測頁的真實命中結果為準）
    {
        id: 'ecpay',
        name: '綠界科技',
        enName: 'ECPay',
        stock: '第三方支付／金流',
        industry: '金融支付',
        website: 'https://www.ecpay.com.tw/',
        newsUrl: 'https://www.ecpay.com.tw/',
        mopsUrl: MOPS_HOME_URL,
        color: '#16a085',
        products: ['全方位金流', '電子發票', '物流整合', '跨境支付'],
        description: '台灣大型第三方支付與電商金流服務商，提供信用卡、超商代收、行動支付、電子發票與物流等整合服務。',
        latestNews: null
    },
    {
        id: 'sunpay',
        name: '紅陽科技',
        enName: 'SunPay（紅陽支付）',
        stock: '第三方支付／金流',
        industry: '金融支付',
        website: 'https://www.sunpay.com.tw/',
        newsUrl: 'https://www.sunpay.com.tw/',
        mopsUrl: MOPS_HOME_URL,
        color: '#e67e22',
        products: ['紅陽 Pay', '信用卡收款', '行動支付', '電子發票'],
        description: '台灣老牌第三方支付與金流串接業者，提供信用卡、行動支付、電子發票及商店收款整合。',
        latestNews: null
    },
    {
        id: 'line-pay-money',
        name: 'LINE Pay Money',
        enName: 'LINE Pay Money',
        stock: '電子支付服務',
        industry: '金融支付',
        website: 'https://pay.line.me/portal/tw-lpm/',
        newsUrl: 'https://pay.line.me/portal/tw-lpm/',
        mopsUrl: MOPS_HOME_URL,
        color: '#06c755',
        products: ['儲值與付款', '好友轉帳', '生活繳費', 'LINE 生態系'],
        description: 'LINE 生態系中的台灣電子支付服務，涵蓋儲值、消費付款、轉帳與生活繳費等使用情境。',
        latestNews: null
    },
    {
        id: 'jkopay',
        name: '街口支付',
        enName: 'JKOPAY',
        stock: '電子支付服務',
        industry: '金融支付',
        website: 'https://www.jkos.com/',
        newsUrl: 'https://www.jkos.com/',
        mopsUrl: MOPS_HOME_URL,
        color: '#f15a24',
        products: ['掃碼支付', '好友轉帳', '生活繳費', '商家收款'],
        description: '台灣大型行動電子支付品牌，提供消費掃碼、好友轉帳、生活繳費與商家收款服務。',
        latestNews: null
    },
    {
        id: 'plus-pay',
        name: '全支付',
        enName: 'PX Pay Plus',
        stock: '電子支付服務',
        industry: '金融支付',
        website: 'https://www.pluspay.com.tw/',
        newsUrl: 'https://www.pluspay.com.tw/',
        mopsUrl: MOPS_HOME_URL,
        color: '#1d70b7',
        products: ['全支付錢包', '掃碼支付', '跨境支付', '會員生態整合'],
        description: '由全聯生態系延伸的電子支付服務，串接零售會員、掃碼付款、轉帳與跨境支付場景。',
        latestNews: null
    }
];

// 統一品牌色欄位名稱 (charts.js 與 compare.js 讀取 brandColor)
COMPANIES.forEach(c => {
    c.brandColor = c.brandColor || c.color;
});

// 觀測媒體來源清單 (包含新增之財經與科技媒體)
// ============================================================
// 智冠 2025 年監測核心關鍵字架構 (排列在前)
// 來源：智冠年度監測關鍵字及媒體文件
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
        folderName: "2. 台灣支付與藍新科技 (國內優先)",
        badge: "藍新金流",
        icon: "💳",
        desc: "國內優先涵蓋藍新科技、ezPay簡單付、ezAIO多元收單、電子支付、行動支付、支付監理與防詐聯防",
        keywords: [
            "藍新科技", "藍新金流", "NewebPay", "簡單付", "ezPay", "ezAIO簡單收", 
            "簡單收", "歐付寶", "街口支付", "綠界科技", "全支付", "全盈支付", 
            "第三方支付", "電子支付", "行動支付", "數位支付", "電支", "支付安全", "非現金支付",
            "跨境交易", "代收付", "金管會", "聯卡中心", "財金公司", "金管會合規", "防詐聯防",
            "洗錢防制", "電子票證", "悠遊付", "一卡通", "台灣Pay", "LINE Pay", "LINE Bank", "彈性付", "純網銀"
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
