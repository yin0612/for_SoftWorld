const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
});

// Some publisher feeds retain years of entries. Bound each run to the most
// recent feed entries so a newly enabled source cannot overwhelm D1.
const MAX_RSS_ITEMS_PER_SOURCE = 200;

// 新增的台灣支付來源先提供「即時唯讀」補位，避免來源已驗證但 D1
// seed 尚未完成時，公開頁仍只看到舊資料。資料仍以 RSS 標題／摘要與
// 原文 URL 為限，不在這條路徑寫入 D1；排程收集成功後會自動去重。
const LIVE_DOMESTIC_SOURCES = [
  { id: 'cna-finance', name: '中央社 產經證券', region: 'TW', type: 'editorial', feed_url: 'https://feeds.feedburner.com/rsscna/finance' },
  { id: 'cna-technology', name: '中央社 科技', region: 'TW', type: 'editorial', feed_url: 'https://feeds.feedburner.com/rsscna/technology' },
  { id: 'nccc-news', name: '聯合信用卡處理中心 最新消息', region: 'TW', type: 'official', feed_url: 'https://www.nccc.com.tw/wps/wcm/connect/zh/home/CNT_00_005_News?subType=xml' },
  { id: 'nccc-member-activity', name: '聯卡中心 卡友活動', region: 'TW', type: 'official', feed_url: 'https://www.nccc.com.tw/wps/wcm/connect/zh/home/CNT_00_005_MemberActivity?subType=xml' },
  { id: 'nccc-shop-news', name: '聯卡中心 特約商店公告', region: 'TW', type: 'official', feed_url: 'https://www.nccc.com.tw/wps/wcm/connect/zh/home/CNT_00_005_ShopNews?subType=xml' },
  { id: 'cardu-hot', name: '卡優新聞網熱門新聞', region: 'TW', type: 'editorial', feed_url: 'https://www.cardu.com.tw/rss/cardurss.xml' },
  { id: 'ltn-business', name: '自由電子報 財經', region: 'TW', type: 'editorial', feed_url: 'https://news.ltn.com.tw/rss/business.xml' },
  { id: 'techorange', name: '科技報橘 TechOrange', region: 'TW', type: 'editorial', feed_url: 'https://techorange.com/feed/' },
  { id: 'blocktempo', name: '動區動趨 BlockTempo', region: 'TW', type: 'editorial', feed_url: 'https://www.blocktempo.com/feed/' },
  { id: 'abmedia', name: 'ABMedia 區塊鏈媒體', region: 'TW', type: 'editorial', feed_url: 'https://www.abmedia.io/feed/' }
];

const LIVE_DOMESTIC_RULES = [
  {
    id: 'newebpay-brand',
    folder_id: 'folder_2',
    scope: 'full_text',
    any_of_json: JSON.stringify(['藍新科技','藍新金流','NewebPay','簡單付','ezPay','簡單行動支付','ezAIO簡單收','ezAIO','簡單收','歐付寶','O\'Pay','OPay','橘子支','橘子支付','樂點行動支付','GAMA PAY','街口支付','街口電子支付','綠界科技','ECPay','全支付','PXPay','全盈支付','全盈+PAY','台灣Pay','悠遊付','悠遊卡','一卡通','iPASS MONEY','LINE Pay','LINE Pay Money','Pi拍錢包','PChomepay','Hami Pay','friDay錢包','蝦皮支付','電子票證','MaiCoin Pay','TWQR']),
    all_of_json: '[]',
    exclude_any_json: JSON.stringify(['大宇紡織']),
    auto_publish: 1,
    auto_publish_allowed_terms_json: JSON.stringify(['藍新科技','藍新金流','NewebPay','簡單付','ezPay','簡單行動支付','ezAIO簡單收','ezAIO','簡單收','歐付寶','O\'Pay','OPay','橘子支','橘子支付','街口支付','街口電子支付','綠界科技','ECPay','全支付','全盈支付','全盈+PAY','台灣Pay','悠遊付','悠遊卡','一卡通','iPASS MONEY','LINE Pay','LINE Pay Money','Pi拍錢包','PChomepay','Hami Pay','friDay錢包','蝦皮支付','電子票證','MaiCoin Pay','TWQR'])
  },
  {
    id: 'taiwan-payment-core',
    folder_id: 'folder_2',
    scope: 'full_text',
    any_of_json: JSON.stringify(['電支','電子支付','行動支付','數位支付','第三方支付','收單','代收付','電子票證','悠遊卡','悠遊付','一卡通','iPASS MONEY','LINE Pay','LINE Pay Money','街口支付','街口電子支付','全支付','全盈支付','台灣Pay','跨境支付','非現金支付','支付安全','支付基礎建設','支付機構','電支機構','信用卡支付','信用卡','刷卡','電子錢包','數位錢包','掃碼支付','TWQR','卡友','特店','特約商店','BNPL','先買後付','MaiCoin Pay']),
    all_of_json: JSON.stringify(['台灣','臺灣','國內','本土','台北','金管會','金融監督管理委員會','央行','中央銀行','財金公司','聯卡中心','聯合信用卡處理中心','數位發展部','數發部','經濟部','行政院','立法院','金融科技','數位金融','支付產業','支付市場','支付業者','支付機構','電支機構','電子支付機構','金融服務','信用卡市場','信用卡','卡友','特店','特約商店','台灣Pay','一卡通','悠遊卡','悠遊付','街口支付','全支付','全盈支付','LINE Pay','iPASS MONEY','藍新科技','NewebPay','TWQR']),
    exclude_any_json: JSON.stringify(['大宇紡織']),
    auto_publish: 1,
    auto_publish_allowed_terms_json: JSON.stringify(['電支','電子支付','行動支付','數位支付','第三方支付','金流','收單','代收付','電子票證','悠遊卡','悠遊付','一卡通','iPASS MONEY','LINE Pay','街口支付','全支付','全盈支付','台灣Pay','跨境支付','非現金支付','支付安全','支付基礎建設','支付機構','電支機構','信用卡支付','信用卡','刷卡','TWQR','卡友','特店','MaiCoin Pay'])
  },
  {
    id: 'taiwan-payment-authority',
    folder_id: 'folder_2',
    scope: 'full_text',
    any_of_json: JSON.stringify(['聯卡中心','聯合信用卡處理中心','財金公司','金融資訊服務','金管會','金融監督管理委員會','中央銀行','央行','數位發展部','數發部','經濟部','銀行公會']),
    all_of_json: JSON.stringify(['支付','電支','電子支付','行動支付','數位支付','電子票證','信用卡支付','非現金支付','支付安全','支付基礎建設','防詐','交易安全','收單','代收付','信用卡','刷卡','卡友','特店','特約商店','TWQR']),
    exclude_any_json: JSON.stringify(['大宇紡織']),
    auto_publish: 1,
    auto_publish_allowed_terms_json: JSON.stringify(['支付','電支','電子支付','行動支付','數位支付','電子票證','信用卡支付','非現金支付','支付安全','支付基礎建設','聯卡中心','聯合信用卡處理中心'])
  }
];

// 穩定幣頁面的即時唯讀補位優先使用台灣金融、區塊鏈與科技媒體；
// 奧丁丁／OwlPay 必須再搭配穩定幣、鏈上支付、加密資產或金融科技語境，
// 避免一般品牌或商業新聞被誤歸入穩定幣。
const LIVE_STABLECOIN_SOURCES = LIVE_DOMESTIC_SOURCES.filter((source) => [
  'cna-finance', 'cna-technology', 'ltn-business', 'techorange', 'blocktempo', 'abmedia'
].includes(source.id));

const LIVE_STABLECOIN_RULES = [
  {
    id: 'stablecoin-core',
    folder_id: 'folder_6',
    scope: 'full_text',
    any_of_json: JSON.stringify(['穩定幣','穩定幣支付','穩定幣結算','美元穩定幣','stablecoin','stable coin','USDT','USDC','USDe','PYUSD','RLUSD','FDUSD','EURC','USDG','GUSD','Tether']),
    all_of_json: '[]',
    exclude_any_json: JSON.stringify(['大宇紡織']),
    auto_publish: 1,
    auto_publish_allowed_terms_json: JSON.stringify(['穩定幣','穩定幣支付','穩定幣結算','美元穩定幣','stablecoin','stable coin','USDT','USDC','USDe','PYUSD','RLUSD','FDUSD','EURC','USDG','GUSD','Tether'])
  },
  {
    id: 'stablecoin-settlement',
    folder_id: 'folder_6',
    scope: 'full_text',
    any_of_json: JSON.stringify(['鏈上結算','鏈上支付','代幣化存款','代幣化貨幣','tokenized deposit','tokenized deposits','stablecoin settlement','stablecoin payment','stablecoin payments']),
    all_of_json: '[]',
    exclude_any_json: JSON.stringify(['大宇紡織']),
    auto_publish: 1,
    auto_publish_allowed_terms_json: JSON.stringify(['鏈上結算','鏈上支付','代幣化存款','代幣化貨幣','tokenized deposit','tokenized deposits','stablecoin settlement','stablecoin payment','stablecoin payments'])
  },
  {
    id: 'stablecoin-brand',
    folder_id: 'folder_6',
    scope: 'full_text',
    any_of_json: JSON.stringify(['奧丁丁','OwlPay']),
    all_of_json: JSON.stringify(['穩定幣','穩定幣支付','穩定幣結算','美元穩定幣','stablecoin','stable coin','USDT','USDC','USDe','PYUSD','RLUSD','FDUSD','EURC','USDG','GUSD','Tether','鏈上結算','鏈上支付','代幣化存款','代幣化貨幣','tokenized deposit','tokenized deposits','stablecoin settlement','stablecoin payment','stablecoin payments','數位資產','加密資產','虛擬資產','加密貨幣','區塊鏈','支付','付款','結算','錢包','入金','出金','金融科技']),
    exclude_any_json: JSON.stringify(['大宇紡織']),
    auto_publish: 1,
    auto_publish_allowed_terms_json: JSON.stringify(['奧丁丁','OwlPay'])
  }
];

function cors(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = env.CORS_ORIGIN || '';
  return origin && origin === allowed ? { 'access-control-allow-origin': origin, vary: 'Origin' } : {};
}

function normalize(text = '') {
  return text.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function decodeEntities(text = '') {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
  let decoded = String(text);
  let previous;
  do {
    previous = decoded;
    decoded = decoded.replace(/&(#39|amp|lt|gt|quot|apos|nbsp);/gi, (_match, entity) => entities[entity.toLowerCase()] || _match);
  } while (decoded !== previous);
  return decoded;
}

function textFromXml(value = '') {
  return decodeEntities(value
    .replace(/<\/?(?:p|div|br|li|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n[ \t]*\n+/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim());
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? textFromXml(match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '')) : '';
}

function parseRss(xml) {
  const entries = xml.match(/<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/gi) || [];
  return entries.map((entry) => {
    // RSS publishers commonly wrap links in CDATA, while Atom uses href.
    // extractTag handles both plain and CDATA-wrapped RSS text links.
    const rawLink = (entry.match(/<link[^>]*href=["']([^"']+)/i) || [])[1] || extractTag(entry, 'link');
    const textParts = [
      extractTag(entry, 'description'),
      extractTag(entry, 'summary'),
      extractTag(entry, 'content:encoded')
    ].filter(Boolean);
    return {
      title: extractTag(entry, 'title'),
      link: decodeEntities(rawLink).trim(),
      publishedAt: extractTag(entry, 'pubDate') || extractTag(entry, 'published') || extractTag(entry, 'updated'),
      // A number of publishers put their useful lead in description and the
      // attributable RSS body in content:encoded. Keep both for matching.
      excerpt: [...new Set(textParts)].join('\n\n')
    };
  }).filter((item) => item.title && item.link).slice(0, MAX_RSS_ITEMS_PER_SOURCE);
}

function taipeiDate(date = new Date()) {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function subtractCalendarMonths(dateString, months) {
  const [year, month, day] = dateString.split('-').map(Number);
  const monthIndex = year * 12 + month - 1 - months;
  const targetYear = Math.floor(monthIndex / 12);
  const targetMonth = (monthIndex % 12) + 1;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

function parseTaipeiDate(value, fallback) {
  if (!value) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00+08:00`);
    return Number.isNaN(parsed.getTime()) || taipeiDate(parsed) !== value ? fallback : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : taipeiDate(parsed);
}

function articleQueryRange(searchParams) {
  const today = taipeiDate();
  const earliest = subtractCalendarMonths(today, 2);
  const clamp = (date) => date < earliest ? earliest : date > today ? today : date;
  let fromDate = clamp(parseTaipeiDate(searchParams.get('from'), earliest));
  let toDate = clamp(parseTaipeiDate(searchParams.get('to'), today));
  if (fromDate > toDate) toDate = fromDate;
  const boundary = (date, endOfDay) => new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}+08:00`).toISOString();
  return { fromDate, toDate, from: boundary(fromDate, false), to: boundary(toDate, true) };
}

function isWithinCollectionWindow(publishedAt) {
  const publishedDay = parseTaipeiDate(publishedAt, '');
  if (!publishedDay) return false;
  const today = taipeiDate();
  const earliest = subtractCalendarMonths(today, 2);
  return publishedDay >= earliest && publishedDay <= today;
}

function parseJson(value, fallback) {
  try { return JSON.parse(value); } catch (_) { return fallback; }
}

function ruleTargets(article, scope) {
  const title = article.title || '';
  const paragraphs = (article.excerpt || '').split(/\n{2,}/).map((text) => text.trim()).filter(Boolean);
  const lead = paragraphs[0] || article.excerpt || '';
  if (scope === 'title') return [{ label: 'title', text: title }];
  if (scope === 'lead') return [{ label: 'rss_excerpt', text: lead }];
  if (scope === 'title_or_lead') return [{ label: 'title', text: title }, { label: 'rss_excerpt', text: lead }];
  if (scope === 'paragraph') return [{ label: 'title', text: title }, ...paragraphs.map((text, index) => ({ label: `rss_paragraph_${index + 1}`, text }))];
  return [{ label: 'title_and_rss_excerpt', text: `${title}\n${article.excerpt || ''}` }];
}

function evaluateRule(article, rule) {
  const requiredAnyGroups = [parseJson(rule.any_of_json, []), parseJson(rule.all_of_json, [])].filter((group) => group.length);
  const excluded = parseJson(rule.exclude_any_json, []);
  for (const target of ruleTargets(article, rule.scope)) {
    const normalizedTarget = normalize(target.text);
    const hits = (terms) => terms.filter((term) => normalizedTarget.includes(normalize(term)));
    const groupHits = requiredAnyGroups.map(hits);
    const excludedHits = hits(excluded);
    const matched = groupHits.every((group) => group.length > 0) && excludedHits.length === 0;
    if (matched) {
      return {
        matched: true,
        evidence: {
          matched_scope: target.label,
          required_any_group_hits: groupHits,
          any_hits: groupHits[0] || [],
          all_hits: groupHits[1] || [],
          excluded_hits: excludedHits
        }
      };
    }
  }
  return { matched: false };
}

function ruleAutoPublishes(rule, evidence) {
  if (Number(rule.auto_publish) !== 1) return false;
  const allowedTerms = parseJson(rule.auto_publish_allowed_terms_json, []);
  if (!Array.isArray(allowedTerms) || allowedTerms.length === 0) return true;
  const allowed = new Set(allowedTerms.map(normalize));
  const groupHits = Array.isArray(evidence?.required_any_group_hits)
    ? evidence.required_any_group_hits.flat()
    : [];
  return groupHits.some((term) => allowed.has(normalize(term)));
}

function ruleAllowsSource(rule, source) {
  const allowedRegions = parseJson(rule.region_scope_json || '[]', []);
  return allowedRegions.length === 0 || allowedRegions.includes(source.region);
}

function isPublishedInRange(publishedAt, from, to) {
  const timestamp = new Date(publishedAt).getTime();
  const fromTimestamp = new Date(from).getTime();
  const toTimestamp = new Date(to).getTime();
  return Number.isFinite(timestamp) && timestamp >= fromTimestamp && timestamp <= toTimestamp;
}

async function fetchLiveArticles(from, to, { sources, rules, folderId }) {
  const fetchedAt = new Date().toISOString();
  const perSource = await Promise.all(sources.map(async (source) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(source.feed_url, {
        signal: controller.signal,
        headers: {
          'user-agent': 'SoftWorldMonitoring/1.0 (+https://yin0612.github.io/for_SoftWorld/)',
          accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.8'
        }
      });
      if (!response.ok) return [];
      const items = parseRss(await response.text());
      return items.map((item) => {
        const parsedDate = new Date(item.publishedAt);
        if (Number.isNaN(parsedDate.getTime()) || !isPublishedInRange(parsedDate.toISOString(), from, to)) return null;
        const article = { title: item.title, excerpt: item.excerpt, canonicalUrl: item.link };
        const matches = rules
          .map((rule) => ({ rule, result: evaluateRule(article, rule) }))
          .filter(({ rule, result }) => result.matched && ruleAutoPublishes(rule, result.evidence));
        if (!matches.length) return null;
        return {
          id: `live-${crypto.randomUUID()}`,
          canonical_url: item.link,
          source_id: source.id,
          source: source.name,
          source_region: source.region,
          source_feed: source.feed_url,
          title: item.title,
          excerpt: item.excerpt || '此文章由已驗證公開 RSS 來源即時收錄。',
          published_at: parsedDate.toISOString(),
          fetched_at: fetchedAt,
          review_status: 'approved',
          folder_ids: folderId,
          rule_ids: matches.map(({ rule }) => rule.id).join(','),
          evidence_jsons: matches.map(({ result }) => JSON.stringify(result.evidence)).join('|||')
        };
      }).filter(Boolean);
    } catch (_) {
      // 唯讀補位來源逾時或暫時不可用時，不影響 D1 已保存的公開結果。
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }));
  const unique = new Map();
  perSource.flat().forEach((article) => {
    if (article?.canonical_url && !unique.has(article.canonical_url)) unique.set(article.canonical_url, article);
  });
  return [...unique.values()];
}

async function fetchLiveDomesticArticles(from, to) {
  return fetchLiveArticles(from, to, {
    sources: LIVE_DOMESTIC_SOURCES,
    rules: LIVE_DOMESTIC_RULES,
    folderId: 'folder_2'
  });
}

async function fetchLiveStablecoinArticles(from, to) {
  return fetchLiveArticles(from, to, {
    sources: LIVE_STABLECOIN_SOURCES,
    rules: LIVE_STABLECOIN_RULES,
    folderId: 'folder_6'
  });
}

async function findExistingArticleUrls(env, urls) {
  const existing = new Set();
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  for (let offset = 0; offset < uniqueUrls.length; offset += 80) {
    const batch = uniqueUrls.slice(offset, offset + 80);
    try {
      const placeholders = batch.map(() => '?').join(',');
      // 只把已公開的 D1 文章視為重複。舊規則留下的 pending／rejected
      // 項目不應遮住目前已通過精準台灣支付規則的即時結果。
      const result = await env.DB.prepare(`SELECT canonical_url FROM articles
        WHERE review_status = 'approved' AND canonical_url IN (${placeholders})`).bind(...batch).all();
      result.results.forEach((row) => existing.add(row.canonical_url));
    } catch (_) {
      // D1 讀取暫時失敗時仍可顯示即時來源，前端會以 URL 去重後呈現。
    }
  }
  return existing;
}

const DOMESTIC_CATALOG_ENTRIES = [
  { id: 'tw-fintech-official-001', name: '聯合信用卡處理中心', url: 'https://www.nccc.com.tw/wps/wcm/connect/zh/home/AboutNCCC/News', source_id: 'nccc-news' },
  { id: 'tw-fintech-official-002', name: '卡優新聞網', url: 'https://www.cardu.com.tw/footer/about.php', source_id: 'cardu-hot' },
  { id: 'tw-fintech-official-003', name: '自由電子報', url: 'https://service.ltn.com.tw/RSS', source_id: 'ltn-business' },
  { id: 'tw-fintech-official-004', name: '動區動趨', url: 'https://www.blocktempo.com/', source_id: 'blocktempo' },
  { id: 'tw-fintech-official-005', name: 'ABMedia', url: 'https://www.abmedia.io/', source_id: 'abmedia' }
];

async function syncDomesticConfig(env) {
  // Seed 失敗或尚未完成時，排程會在下一次執行自動補齊設定；失敗只記錄
  // 並繼續既有收集，避免一次 D1 寫入錯誤讓整個 Worker 中斷。
  try {
    const ruleIds = LIVE_DOMESTIC_RULES.map((rule) => rule.id);
    const stablecoinRuleIds = LIVE_STABLECOIN_RULES.map((rule) => rule.id);
    const sourceIds = LIVE_DOMESTIC_SOURCES.map((source) => source.id);
    const [folder, rules, sources, catalog, stablecoinFolder, stablecoinRules] = await Promise.all([
      env.DB.prepare('SELECT id, version, name, description FROM monitoring_folders WHERE id = ?').bind('folder_2').first(),
      env.DB.prepare(`SELECT id, version FROM monitoring_rules WHERE id IN (${ruleIds.map(() => '?').join(',')})`).bind(...ruleIds).all(),
      env.DB.prepare(`SELECT id, feed_url, enabled, auto_publish FROM media_sources WHERE id IN (${sourceIds.map(() => '?').join(',')})`).bind(...sourceIds).all(),
      env.DB.prepare(`SELECT id, version, source_id FROM monitoring_media_catalog WHERE id IN (${DOMESTIC_CATALOG_ENTRIES.map(() => '?').join(',')})`).bind(...DOMESTIC_CATALOG_ENTRIES.map((entry) => entry.id)).all(),
      env.DB.prepare('SELECT id, version, name, description FROM monitoring_folders WHERE id = ?').bind('folder_6').first(),
      env.DB.prepare(`SELECT id, version FROM monitoring_rules WHERE id IN (${stablecoinRuleIds.map(() => '?').join(',')})`).bind(...stablecoinRuleIds).all()
    ]);
    const existingRules = new Map((rules.results || []).map((rule) => [rule.id, rule]));
    const existingStablecoinRules = new Map((stablecoinRules.results || []).map((rule) => [rule.id, rule]));
    const existingSources = new Map((sources.results || []).map((source) => [source.id, source]));
    const existingCatalog = new Map((catalog.results || []).map((entry) => [entry.id, entry]));
    const statements = [];
    const version = env.RULES_VERSION || '2026-09-16-owlpay-priority-v1';

    if (!folder || folder.version !== version || folder.name !== '台灣支付與藍新科技') {
      statements.push(env.DB.prepare(`INSERT INTO monitoring_folders
        (id, name, region_scope_json, priority, description, version)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, region_scope_json=excluded.region_scope_json,
          priority=excluded.priority, description=excluded.description, version=excluded.version`)
        .bind('folder_2', '台灣支付與藍新科技', JSON.stringify(['TW']), 'high', '台灣媒體的支付、電子支付、行動支付、金流與支付監理動態；國內優先', version));
    }

    if (!stablecoinFolder || stablecoinFolder.version !== version || stablecoinFolder.name !== '穩定幣與鏈上結算') {
      statements.push(env.DB.prepare(`INSERT INTO monitoring_folders
        (id, name, region_scope_json, priority, description, version)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, region_scope_json=excluded.region_scope_json,
          priority=excluded.priority, description=excluded.description, version=excluded.version`)
        .bind('folder_6', '穩定幣與鏈上結算', JSON.stringify(['TW', 'CN', 'HK', 'GLOBAL']), 'high', '穩定幣、代幣化貨幣與鏈上支付結算；奧丁丁／OwlPay 優先', version));
    }

    LIVE_DOMESTIC_RULES.forEach((rule) => {
      if (existingRules.get(rule.id)?.version === version) return;
      statements.push(env.DB.prepare(`INSERT INTO monitoring_rules
        (id, folder_id, scope, any_of_json, all_of_json, exclude_any_json, version, auto_publish, auto_publish_allowed_terms_json, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET folder_id=excluded.folder_id, scope=excluded.scope,
          any_of_json=excluded.any_of_json, all_of_json=excluded.all_of_json,
          exclude_any_json=excluded.exclude_any_json, version=excluded.version,
          auto_publish=excluded.auto_publish, auto_publish_allowed_terms_json=excluded.auto_publish_allowed_terms_json,
          active=excluded.active`)
        .bind(rule.id, rule.folder_id, rule.scope, rule.any_of_json, rule.all_of_json,
          rule.exclude_any_json, version, rule.auto_publish, rule.auto_publish_allowed_terms_json));
    });

    LIVE_STABLECOIN_RULES.forEach((rule) => {
      if (existingStablecoinRules.get(rule.id)?.version === version) return;
      statements.push(env.DB.prepare(`INSERT INTO monitoring_rules
        (id, folder_id, scope, any_of_json, all_of_json, exclude_any_json, version, auto_publish, auto_publish_allowed_terms_json, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET folder_id=excluded.folder_id, scope=excluded.scope,
          any_of_json=excluded.any_of_json, all_of_json=excluded.all_of_json,
          exclude_any_json=excluded.exclude_any_json, version=excluded.version,
          auto_publish=excluded.auto_publish, auto_publish_allowed_terms_json=excluded.auto_publish_allowed_terms_json,
          active=excluded.active`)
        .bind(rule.id, rule.folder_id, rule.scope, rule.any_of_json, rule.all_of_json,
          rule.exclude_any_json, version, rule.auto_publish, rule.auto_publish_allowed_terms_json));
    });

    LIVE_DOMESTIC_SOURCES.forEach((source) => {
      const current = existingSources.get(source.id);
      if (current?.feed_url === source.feed_url && Number(current.enabled) === 1 && Number(current.auto_publish) === 1) return;
      const domain = new URL(source.feed_url).hostname;
      statements.push(env.DB.prepare(`INSERT INTO media_sources
        (id, name, domain, region, type, access_mode, feed_url, tier, enabled, auto_publish)
        VALUES (?, ?, ?, ?, ?, 'rss', ?, 'A', 1, 1)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, domain=excluded.domain, region=excluded.region,
          type=excluded.type, access_mode=excluded.access_mode, feed_url=excluded.feed_url,
          tier=excluded.tier, enabled=excluded.enabled, auto_publish=excluded.auto_publish`)
        .bind(source.id, source.name, domain, source.region, source.type || 'editorial', source.feed_url));
    });

    for (const entry of DOMESTIC_CATALOG_ENTRIES) {
      if (existingCatalog.get(entry.id)?.version === version && existingCatalog.get(entry.id)?.source_id === entry.source_id) continue;
      statements.push(env.DB.prepare(`INSERT INTO monitoring_media_catalog
        (id, document_name, region, category, document_url, is_new_2025, onboarding_status, source_id, version)
        VALUES (?, ?, 'TW', '台灣支付與金融科技專業來源', ?, 0, 'verified_rss', ?, ?)
        ON CONFLICT(id) DO UPDATE SET document_name=excluded.document_name, region=excluded.region,
          category=excluded.category, document_url=excluded.document_url, onboarding_status=excluded.onboarding_status,
          source_id=excluded.source_id, version=excluded.version`)
        .bind(entry.id, entry.name, entry.url, entry.source_id, version));
    }

    if (statements.length) await env.DB.batch(statements);
    return { synced: true, statements: statements.length };
  } catch (error) {
    console.warn('Domestic monitoring config sync deferred:', String(error).slice(0, 300));
    return { synced: false, deferred: true };
  }
}

async function readDomesticConfigStatus(env) {
  const ruleIds = LIVE_DOMESTIC_RULES.map((rule) => rule.id);
  const sourceIds = LIVE_DOMESTIC_SOURCES.map((source) => source.id);
  try {
    const [folder, rules, sources] = await Promise.all([
      env.DB.prepare('SELECT id, version, name FROM monitoring_folders WHERE id = ?').bind('folder_2').first(),
      env.DB.prepare(`SELECT id, version FROM monitoring_rules WHERE id IN (${ruleIds.map(() => '?').join(',')})`).bind(...ruleIds).all(),
      env.DB.prepare(`SELECT id, feed_url, enabled, auto_publish FROM media_sources WHERE id IN (${sourceIds.map(() => '?').join(',')})`).bind(...sourceIds).all()
    ]);
    const version = env.RULES_VERSION || '2026-09-16-owlpay-priority-v1';
    const configuredRules = new Map((rules.results || []).map((rule) => [rule.id, rule]));
    const configuredSources = new Map((sources.results || []).map((source) => [source.id, source]));
    const missingRules = LIVE_DOMESTIC_RULES.filter((rule) => configuredRules.get(rule.id)?.version !== version).map((rule) => rule.id);
    const missingSources = LIVE_DOMESTIC_SOURCES.filter((source) => {
      const current = configuredSources.get(source.id);
      return !current || current.feed_url !== source.feed_url || Number(current.enabled) !== 1 || Number(current.auto_publish) !== 1;
    }).map((source) => source.id);
    const folderReady = folder?.version === version && folder?.name === '台灣支付與藍新科技';
    return {
      pending: !folderReady || missingRules.length > 0 || missingSources.length > 0,
      folder_ready: folderReady,
      missing_rules: missingRules,
      missing_sources: missingSources
    };
  } catch (_) {
    return { pending: true, folder_ready: false, missing_rules: [], missing_sources: [] };
  }
}

async function readStablecoinConfigStatus(env) {
  const ruleIds = LIVE_STABLECOIN_RULES.map((rule) => rule.id);
  try {
    const [folder, rules] = await Promise.all([
      env.DB.prepare('SELECT id, version, name FROM monitoring_folders WHERE id = ?').bind('folder_6').first(),
      env.DB.prepare(`SELECT id, version FROM monitoring_rules WHERE id IN (${ruleIds.map(() => '?').join(',')})`).bind(...ruleIds).all()
    ]);
    const version = env.RULES_VERSION || '2026-09-16-owlpay-priority-v1';
    const configuredRules = new Map((rules.results || []).map((rule) => [rule.id, rule]));
    const missingRules = LIVE_STABLECOIN_RULES
      .filter((rule) => configuredRules.get(rule.id)?.version !== version)
      .map((rule) => rule.id);
    const folderReady = folder?.version === version && folder?.name === '穩定幣與鏈上結算';
    return {
      pending: !folderReady || missingRules.length > 0,
      folder_ready: folderReady,
      missing_rules: missingRules
    };
  } catch (_) {
    return { pending: true, folder_ready: false, missing_rules: [] };
  }
}

async function activeRules(env) {
  const result = await env.DB.prepare(`SELECT r.*, f.region_scope_json
    FROM monitoring_rules r
    LEFT JOIN monitoring_folders f ON f.id = r.folder_id
    WHERE r.active = 1`).all();
  return result.results;
}

async function collectSource(source, rules, env) {
  const runId = crypto.randomUUID();
  const now = new Date().toISOString();
  let started = false;
  try {
    await env.DB.prepare('INSERT INTO collection_runs (id, source_id, started_at, result) VALUES (?, ?, ?, ?)').bind(runId, source.id, now, 'running').run();
    started = true;
    const response = await fetch(source.feed_url, {
      headers: {
        'user-agent': 'SoftWorldMonitoring/1.0 (+https://yin0612.github.io/for_SoftWorld/)',
        accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.8'
      }
    });
    if (!response.ok) throw new Error(`RSS HTTP ${response.status}`);
    const items = parseRss(await response.text());
    const sourceRules = rules.filter((rule) => ruleAllowsSource(rule, source));
    let added = 0;

    for (const item of items) {
      const parsedDate = new Date(item.publishedAt);
      if (Number.isNaN(parsedDate.getTime())) continue;
      const publishedAt = parsedDate.toISOString();
      // The database itself observes the same rolling two-month window as the public API.
      if (!isWithinCollectionWindow(publishedAt)) continue;
      const canonicalUrl = new URL(item.link, source.feed_url).toString();
      const article = { title: item.title, excerpt: item.excerpt, canonicalUrl };
      const matches = sourceRules.map((rule) => ({ rule, result: evaluateRule(article, rule) })).filter(({ result }) => result.matched);
      if (!matches.length) continue;
      const hasPublishableMatch = matches.some(({ rule, result }) => ruleAutoPublishes(rule, result.evidence));

      const existing = await env.DB.prepare('SELECT id FROM articles WHERE canonical_url = ?').bind(canonicalUrl).first();
      const articleId = existing?.id || crypto.randomUUID();
      if (existing) {
        await env.DB.prepare(`UPDATE articles
          SET title = ?, excerpt = ?, published_at = COALESCE(?, published_at), fetched_at = ?,
              review_status = CASE
                WHEN review_status = 'rejected' THEN 'rejected'
                ELSE review_status
              END
          WHERE id = ?`).bind(item.title, item.excerpt || null, publishedAt, now, articleId).run();
      } else {
        await env.DB.prepare(`INSERT INTO articles
          (id, canonical_url, source_id, title, excerpt, published_at, fetched_at, review_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(articleId, canonicalUrl, source.id, item.title, item.excerpt || null, publishedAt, now, 'pending').run();
        added++;
      }

      await env.DB.batch(matches.map(({ rule, result }) => {
        const autoPublish = ruleAutoPublishes(rule, result.evidence);
        return env.DB.prepare(`INSERT INTO article_matches
        (article_id, rule_id, evidence_json, status, reviewed_by, reviewed_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(article_id, rule_id) DO UPDATE SET
          evidence_json = excluded.evidence_json,
          status = CASE WHEN article_matches.status = 'rejected' THEN 'rejected' ELSE excluded.status END,
          reviewed_by = CASE WHEN article_matches.status = 'rejected' THEN article_matches.reviewed_by ELSE excluded.reviewed_by END,
          reviewed_at = CASE WHEN article_matches.status = 'rejected' THEN article_matches.reviewed_at ELSE excluded.reviewed_at END`).bind(
          articleId, rule.id, JSON.stringify(result.evidence), autoPublish ? 'approved' : 'pending',
          autoPublish ? 'system:verified-rss' : null, autoPublish ? now : null
        );
      }));

      // Recompute the article status after the match upsert. This lets a
      // precision-policy update safely demote former system approvals while
      // preserving an explicitly rejected article.
      if (existing || hasPublishableMatch) {
        const approval = await env.DB.prepare(`SELECT COUNT(*) AS approved_matches
          FROM article_matches WHERE article_id = ? AND status = 'approved'`).bind(articleId).first();
        await env.DB.prepare(`UPDATE articles SET review_status = CASE
          WHEN review_status = 'rejected' THEN 'rejected'
          WHEN ? = 1 THEN 'approved'
          ELSE 'pending'
        END WHERE id = ?`).bind(Number(approval?.approved_matches || 0) > 0 ? 1 : 0, articleId).run();
      }
    }

    await env.DB.batch([
      env.DB.prepare('UPDATE media_sources SET last_success_at = ?, last_attempt_at = ?, health_status = ?, last_error = NULL WHERE id = ?').bind(now, now, 'healthy', source.id),
      env.DB.prepare('UPDATE collection_runs SET finished_at = ?, result = ?, items_seen = ?, items_new = ? WHERE id = ?').bind(now, 'success', items.length, added, runId)
    ]);
    return { source_id: source.id, result: 'success', items_seen: items.length, items_new: added };
  } catch (error) {
    const errorText = String(error).slice(0, 500);
    const statements = [env.DB.prepare('UPDATE media_sources SET last_attempt_at = ?, health_status = ?, last_error = ? WHERE id = ?').bind(now, 'error', errorText, source.id)];
    if (started) statements.push(env.DB.prepare('UPDATE collection_runs SET finished_at = ?, result = ?, error = ? WHERE id = ?').bind(now, 'failed', errorText, runId));
    await env.DB.batch(statements);
    return { source_id: source.id, result: 'failed', error: errorText };
  }
}

async function collectAll(env) {
  await syncDomesticConfig(env);
  const [sources, rules] = await Promise.all([
    env.DB.prepare("SELECT * FROM media_sources WHERE enabled = 1 AND auto_publish = 1 AND access_mode = 'rss' AND feed_url IS NOT NULL").all(),
    activeRules(env)
  ]);
  return Promise.all(sources.results.map((source) => collectSource(source, rules, env)));
}

async function monitoringStatus(env) {
  const [sources, articles, latestRun, catalog, ruleCount, enabledSources, domesticConfig, stablecoinConfig] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN enabled = 1 AND auto_publish = 1 THEN 1 ELSE 0 END) AS enabled,
      SUM(CASE WHEN enabled = 1 AND auto_publish = 1 AND health_status = 'healthy' THEN 1 ELSE 0 END) AS healthy,
      MAX(CASE WHEN enabled = 1 AND auto_publish = 1 THEN last_success_at END) AS latest_success FROM media_sources`).first(),
    env.DB.prepare(`SELECT COUNT(*) AS total,
      SUM(CASE WHEN review_status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN review_status = 'rejected' THEN 1 ELSE 0 END) AS rejected FROM articles`).first(),
    env.DB.prepare("SELECT finished_at, result, items_seen, items_new FROM collection_runs WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1").first(),
    env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN onboarding_status = 'verified_rss' THEN 1 ELSE 0 END) AS verified_rss FROM monitoring_media_catalog").first(),
    env.DB.prepare(`SELECT COUNT(*) AS active,
      SUM(CASE WHEN auto_publish = 1 THEN 1 ELSE 0 END) AS auto_publish FROM monitoring_rules WHERE active = 1`).first(),
    env.DB.prepare(`SELECT id, name, region, health_status, last_success_at
      FROM media_sources
      WHERE enabled = 1 AND auto_publish = 1 AND access_mode = 'rss'
      ORDER BY region, name`).all(),
    readDomesticConfigStatus(env),
    readStablecoinConfigStatus(env)
  ]);
  return {
    rules_version: env.RULES_VERSION || null,
    source_summary: sources,
    article_summary: articles,
    media_catalog_summary: catalog,
    enabled_sources: enabledSources.results,
    live_fallback_sources: LIVE_DOMESTIC_SOURCES.map((source) => source.name),
    live_fallback_source_count: LIVE_DOMESTIC_SOURCES.length,
    domestic_config: domesticConfig,
    stablecoin_config: stablecoinConfig,
    active_rule_count: ruleCount?.active || 0,
    auto_publish_rule_count: ruleCount?.auto_publish || 0,
    latest_run: latestRun || null,
    publication_policy: '只顯示已驗證公開 RSS 且命中高精準自動發布規則的文章；不顯示展示資料或待覆核內容。'
  };
}

function isInternalRequest(request, env) {
  const expected = env.MONITORING_ADMIN_TOKEN;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(expected && supplied && supplied === expected);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { headers: { ...headers, 'access-control-allow-methods': 'GET, POST, OPTIONS' } });

    if (url.pathname === '/api/health') {
      const result = await env.DB.prepare('SELECT health_status, COUNT(*) AS count, MAX(last_success_at) AS latest_success FROM media_sources GROUP BY health_status').all();
      return json({ sources: result.results }, 200, headers);
    }
    if (url.pathname === '/api/status') return json(await monitoringStatus(env), 200, headers);

    if (url.pathname === '/api/internal/collect' && request.method === 'POST') {
      if (!isInternalRequest(request, env)) return json({ error: 'Not found' }, 404, headers);
      return json({ runs: await collectAll(env) }, 200, headers);
    }

    if (url.pathname === '/api/articles') {
      const requestedLimit = Number(url.searchParams.get('limit') || 30);
      const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100) : 30;
      const requestedOffset = Number(url.searchParams.get('offset') || 0);
      const offset = Number.isFinite(requestedOffset) ? Math.max(Math.trunc(requestedOffset), 0) : 0;
      const folder = url.searchParams.get('folder');
      const { fromDate, toDate, from, to } = articleQueryRange(url.searchParams);
      const where = [
        "a.review_status = 'approved'",
        "m.status = 'approved'",
        'COALESCE(a.published_at, a.fetched_at) BETWEEN ? AND ?'
      ];
      const values = [from, to];
      if (folder) {
        where.push('r.folder_id = ?');
        values.push(folder);
      }
      const joins = 'FROM articles a JOIN media_sources s ON s.id = a.source_id JOIN article_matches m ON m.article_id = a.id JOIN monitoring_rules r ON r.id = m.rule_id';
      const whereSql = `WHERE ${where.join(' AND ')}`;
      // 先讀取完整的近兩個月 D1 結果，再與唯讀即時補位合併後分頁，
      // 避免新來源插在排序前端時造成 offset 分頁漏項。
      const articlesSql = `SELECT a.id, a.title, a.excerpt, a.canonical_url AS url, a.published_at, a.fetched_at, a.review_status,
          s.name AS source, s.region AS source_region, s.feed_url AS source_feed, GROUP_CONCAT(DISTINCT r.folder_id) AS folder_ids, GROUP_CONCAT(DISTINCT r.id) AS rule_ids,
          GROUP_CONCAT(m.evidence_json, '|||') AS evidence_jsons
          ${joins} ${whereSql}
          GROUP BY a.id ORDER BY MAX(COALESCE(a.published_at, a.fetched_at)) DESC LIMIT 5000`;
      const totalSql = `SELECT COUNT(DISTINCT a.id) AS total ${joins} ${whereSql}`;
      const livePromise = !folder
        ? Promise.all([
          fetchLiveDomesticArticles(from, to),
          fetchLiveStablecoinArticles(from, to)
        ]).then((groups) => groups.flat())
        : folder === 'folder_2'
          ? fetchLiveDomesticArticles(from, to)
          : folder === 'folder_6'
            ? fetchLiveStablecoinArticles(from, to)
            : Promise.resolve([]);
      const [result, totalResult, liveCandidates] = await Promise.all([
        env.DB.prepare(articlesSql).bind(...values).all(),
        env.DB.prepare(totalSql).bind(...values).first(),
        livePromise
      ]);
      const existingLiveUrls = await findExistingArticleUrls(env, liveCandidates.map((article) => article.canonical_url));
      const liveArticles = [...new Map(
        liveCandidates
          .filter((article) => !existingLiveUrls.has(article.canonical_url))
          .map((article) => [article.canonical_url, article])
      ).values()];
      const persistedArticles = Array.isArray(result.results) ? result.results : [];
      const merged = new Map();
      persistedArticles.forEach((article) => {
        if (article?.url) merged.set(article.url, article);
      });
      liveArticles.forEach((article) => {
        if (article?.canonical_url && !merged.has(article.canonical_url)) merged.set(article.canonical_url, {
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          url: article.canonical_url,
          published_at: article.published_at,
          fetched_at: article.fetched_at,
          review_status: article.review_status,
          source: article.source,
          source_region: article.source_region,
          source_feed: article.source_feed,
          folder_ids: article.folder_ids,
          rule_ids: article.rule_ids,
          evidence_jsons: article.evidence_jsons,
          live_fallback: true
        });
      });
      const mergedArticles = [...merged.values()].sort((a, b) => String(b.published_at || b.fetched_at || '').localeCompare(String(a.published_at || a.fetched_at || '')));
      const resultPage = mergedArticles.slice(offset, offset + limit);
      const persistedTotal = Number(totalResult?.total || 0);
      const total = persistedTotal + liveArticles.length;
      const nextOffset = offset + resultPage.length;
      return json({
        articles: resultPage,
        total,
        has_more: nextOffset < total,
        next_offset: nextOffset,
        data_mode: 'verified_rss_monitoring',
        range: { from: fromDate, to: toDate },
        live_fallback_count: liveArticles.length,
        live_fallback_sources: LIVE_DOMESTIC_SOURCES.map((source) => source.name)
      }, 200, headers);
    }
    return json({ error: 'Not found' }, 404, headers);
  },
  async scheduled(_controller, env, ctx) { ctx.waitUntil(collectAll(env)); }
};
