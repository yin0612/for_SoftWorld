# 台灣遊戲產業媒體曝光分析平台
## 完整建置計劃書 **v3.0 — 最終版**

> **v1** 描述成果長什麼樣（簡報）。**v2** 補上工程規格。**v3** 是**可直接執行的施工圖**：八家官網已逐一實地抓取稽核、Cloudflare 免費額度已查證、所有程式碼可複製即用。
>
> **標記**：`【已驗證】` 本文附來源或實測結果｜`【需查證】` 信心低於 90%，施工前必須人工確認。

---

# 目錄

| Part | 內容 | 你需要它的時機 |
| :--- | :--- | :--- |
| 0 | 決策摘要（一頁看完） | 現在 |
| I | v1 五大缺口診斷 | 想知道為什麼要改 |
| II | 產品定義與驗收標準 | 開工前 |
| III | **資料層：指標定義 + 八家官網實地稽核** ★核心 | 寫任何程式之前 |
| IV | **架構：GitHub × Cloudflare 三方案與選擇** ★核心 | 決定技術棧 |
| V | 資料模型與 Schema | M0 |
| VI | **完整實作：逐步 + 全部程式碼** ★核心 | M1–M6 |
| VII | 前端規格與改造方式 | M4 |
| VIII | 自動化、監控、故障處理 | M5 |
| IX | 測試與品質閘門 | 全程 |
| X | 法遵與風險 | 上線前 |
| XI | 里程碑與工時 | 排程 |
| XII | 八家公司主檔（修正版） | M0 |
| XIII | 待查證清單 | 開工第一天 |

---

# Part 0　決策摘要

## 已做的關鍵決策

| # | 決策 | 理由（一句話） |
| :-- | :--- | :--- |
| 1 | **刪除所有模擬數據**，改為真實抓取；缺漏留白不補 0 | 自動「推進」的數字與現實無關，資訊量為零 |
| 2 | **溯源優先**：任何顯示的數字須在兩次點擊內看到原始連結 | 這條規則讓造數在技術上不可能 |
| 3 | 「媒體報導」拆成 **原生 / 轉載** 兩欄 | 一篇稿被 18 家轉載不等於 18 篇報導 |
| 4 | **「社群聲量」MVP 降級為 PTT 提及數**，或整段移除 | FB/IG/Threads/X 無合法免費管道，不存在第三條路 |
| 5 | 架構採 **GitHub（真相與版控）× Cloudflare（排程與託管）混合** | 兩邊互為備援，各補對方的致命缺陷 |

## 最終架構一句話

**GitHub 存程式碼與資料快照（可回溯）→ Cloudflare Worker 定時抓取寫入 D1/R2（時效與可靠度）→ Cloudflare Pages 託管前端（全球 CDN）→ GitHub Actions 每週把 D1 匯出成 JSON commit 回 repo（備份與版本化）。**

## 成本

**新台幣 0 元。** 依實測用量估算（Part IV 第 4.5 節），本專案用量約為 Cloudflare 免費額度的 **0.1%～3%**。

---

# Part I　v1 的五個結構性缺口

## 缺口 1（致命）：沒有資料層，只有展示層

v1 寫「Python 腳本自動**推進**與更新 32 個月四大指標數值」。

**「推進數值」不是資料工程，是造數。** 折線圖的形狀完全由亂數種子決定，與八家公司在現實世界的公關行為無關。

> **第一性原理：一個指標的價值 = 它與現實的耦合強度 × 可驗證性。**
> 若使用者無法點擊圖上任一點、看到構成它的每一條原始連結，這個點就沒有存在的正當性。

## 缺口 2：四大指標沒有操作型定義

「媒體報導篇數」這五個字無法寫成程式，因此沒有正確答案，因此無法測試。→ Part III 3.1

## 缺口 3：實體解析完全未處理（而本專案剛好是最壞情況）

| 狀況 | 實例 | 後果 |
| :--- | :--- | :--- |
| **法人更名** | 大宇資訊股份有限公司於 **2026-01-07** 更名為 **光聚晶電聯合股份有限公司**（經授商字第11430207330號，114/12/23 股東會決議），代號仍 6111【已驗證：MOPS 重大訊息】 | 2026 後搜「大宇資訊」抓不到 → 圖表假性歸零 |
| **品牌名未同步** | 但其遊戲新聞網站（km.softstar.com.tw）**至今仍以「大宇資訊」署名發稿**【已驗證：實地抓取 2026-04-16 稿件，作者欄為「大宇資訊」】 | 只認新名字同樣會漏抓 → **必須新舊名並存** |
| **簡稱撞名** | 台股另有 **大宇（1445）＝大宇紡織**，上市公司，法說會與營收公告頻繁【已驗證】 | 裸關鍵字「大宇」會把紡織公司算進遊戲聲量 |

→ 解法：帶**生效日期**與**排除詞**的公司主檔（Part V 5.1）。

## 缺口 4：社群與 KOL 的可得性與合法性被跳過

v1 把四個指標並列為對等，但取得難度差**兩個數量級**：官方新聞可行、社群不可行、KOL 半可行。→ Part III 3.3

## 缺口 5：用口號取代工程機制

v1 要求「絕不覆蓋、破壞原有 HTML/CSS」。這條規則的存在本身，就證明專案缺少真正的防護。

> **「不要弄壞」不是流程，是願望。** 能防止破壞的只有三件事：可回滾的 commit、跑得起來的測試、把資料與呈現徹底切開。
> → 解法：`docs/` 與 `pipeline/` 物理隔離，資料更新**在檔案系統層面就碰不到 HTML**（Part V 5.4）。

---

# Part II　產品定義與驗收標準

## 2.1 使用者與工作場景

| 使用者 | 要完成的工作 | 對應功能 |
| :--- | :--- | :--- |
| 遊戲公司公關/行銷 | 知道自己這月發稿量與同業相比高低 | 排行榜 + PK 對比 |
| 產業記者/分析師 | 找出聲量異常期間並追到原始新聞 | 趨勢圖 + **下鑽溯源** |
| 求職者/玩家 | 快速理解八家公司近況 | 公司總覽卡片 |

## 2.2 可驗收的成功指標

| 指標 | 目標 | 量測方式 |
| :--- | :--- | :--- |
| **資料真實率** | **100%** 聚合數值可追溯至原始 URL | CI 溯源閘門（Part IX） |
| 抓取成功率 | 每次執行 ≥ 95% | `fetch_report.json` |
| 資料新鮮度 | `last_updated` 落後 ≤ 8 天 | 前端自檢，逾期顯示警示 |
| 頁面效能 | LCP < 2.5s、JS < 150KB gzip | Lighthouse CI |
| 可及性 | 內文對比度 ≥ 4.5:1 | axe-core CI |

## 2.3 明確不做（Non-goals）

1. 不做即時監測（日更足夠，免費架構撐得住且不需要更快）
2. 不做中文情緒分析（誤判率高，會製造假權威）
3. 不做投資建議、不預測股價
4. 不儲存新聞全文（著作權，Part X）

---

# Part III　資料層（核心）

## 3.1 四大指標的操作型定義

| 指標 | 操作型定義 | 計數單位 | 去重規則 | 時間歸屬 | 來源 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **官方發稿數** `pr_count` | 公司自有管道（官網新聞頁 / MOPS 重大訊息）發布之訊息 | 1 則 = 1 個官方頁面 URL | 正規化 URL 唯一 | 官方標示發布日（Asia/Taipei） | 官網 + MOPS |
| **媒體報導** `media_original` / `media_syndicated` | 非公司自有管道之媒體文章，**拆兩欄** | 1 篇文章 | 同群集內僅最早 1 篇為 original | 文章發布日 | RSS / 新聞聚合 |
| **社群提及** `social_mentions` | 指定板塊標題或內文出現主別名之貼文（**不含回文**） | 1 篇貼文 | 永久連結唯一 | 發文日 | PTT C_Chat |
| **KOL 影片** `kol_videos` | 標題或說明含公司/作品別名之 YouTube 影片 | 1 支影片 | videoId 唯一 | 影片發布日 | YouTube Data API |

### 三個必須先拍板的判定

1. **子公司算不算？** → 算，但標記 `entity_level: subsidiary`，前端可切換。（智冠有 MyCard/藍新/中華網龍；橘子有果核數位）
2. **作品名算不算公司聲量？** → 算，標記 `matched_by: title`。玩家討論《三國群英傳》不會提「宇峻奧汀」。
3. **轉載進不進主圖？** → 主圖只畫 original；轉載另做「**擴散倍數 = syndicated / original**」副指標——這比 v1 的四大指標更有洞察力。

### 缺漏處理（必須寫進規格）

- 某來源某期抓取失敗 → 記為 `null`，**絕不補 0**，前端以虛線斷開。
- **「0」與「無資料」在視覺上必須不同。** 這是資料誠信的最低要求。

---

## 3.2 ★ 八家官網實地稽核結果（2026-08-27 實測）

> 這是 v3 相對 v2 最大的增值。以下每一列都是**實際發出 HTTP 請求觀察到的結果**，不是推測。

### 第一性原理：抓取難度只取決於一件事

> **伺服器願意在第一個 HTTP 回應裡告訴你多少。**
>
> - **SSR（伺服器端渲染）** → 第一個回應就有全部資料 → `requests` + `BeautifulSoup` 即可
> - **模板 + XHR** → 第一個回應只有 `{SUBJECT}` 佔位符 → 必須找到背後的 JSON 端點（**找到後反而更好，因為是結構化資料**）
> - **SPA** → 第一個回應是 `Loading…` → 找 API，找不到才用 headless
>
> **永遠先找 API 再考慮 headless。** headless 在 Cloudflare Workers 上根本跑不了，在 GitHub Actions 上慢 10 倍以上。

### 稽核表

| 公司 | 新聞頁（實測有效） | 技術型態 | 難度 | 建議作法 |
| :--- | :--- | :--- | :---: | :--- |
| **智冠 5478** | `https://www.soft-world.com/News` | **SSR HTML 表格**。分頁 `?page=N`（共 25 頁）。內頁 `/News/NewsDetail?Sn=20395`（連續 ID）。分類 `/Home/Route?Type=6&ParentSn=20&EKind=21\|22\|23\|24`（全部/最新聲明/財務/產品/其他） | ★☆☆ | `requests`+`bs4` 逐列解析 `<tr>`；分類可直接對應 `doc_subtype` |
| **光聚晶電 6111**（原大宇） | `https://km.softstar.com.tw/list.aspx?cid=2` | **ASP.NET WebForms**。分頁是 `__doPostBack(...)`，**無法用 GET 翻頁**（需帶 `__VIEWSTATE`/`__EVENTVALIDATION` POST）。內頁 `topic.aspx?tid=980`（連續 ID）。**此頁是遊戲行銷新聞，非公司層公告** | ★★☆ | **跳過分頁**，直接遞增 `tid` 列舉；公司層公告改走 MOPS |
| **橘子 6180** | `https://www.gamania.com/news` | **SPA（headless WordPress）**。伺服器 HTML 只回 `Loading…` 與「目前站內無相關資料」→ **`requests` 抓到零筆資料** | ★★★ | 依序試：① `/wp-json/wp/v2/posts` ② DevTools 找 XHR ③ `ir.gamania.com` 投資人專區 ④ 最後才 Playwright |
| **網銀國際**（未上市） | `https://www.wanin.tw/News/` | **SSR HTML**。分頁 `?page=N`（15 頁）。內頁 `/NewsPages/20260708090906224/`——**ID 本身就是 17 碼時間戳**。分類 `/News/event_news/`、`/News/charity_news/` | ★☆☆ | **最容易**；日期可直接從 URL 解析，不必依賴頁面文字 |
| **華義 3086** | `【需查證】` v1 未指定 | — | — | 先走 MOPS + 媒體來源 |
| **宇峻 3546** | `https://www.userjoy.com.tw/news/news_01.aspx` | **SSR HTML 表格**。內頁 `news_02.aspx?n=0000963`（**零填補連續 ID**）。分頁是 JS。**另有獨立重大訊息頁 `news_03.aspx`**。有 EN 版 `/en/news/news_01.aspx` | ★☆☆ | 遞增 `n` 列舉；`news_01`=行銷稿、`news_03`=法定公告，**兩者分開計入不同指標** |
| **傳奇 4994** | `https://www.x-legend.tw/02news/news_1.php` | **Big5 編碼**（`charset=big5`）。清單是**前端樣板**，HTML 內留有 `{SUBJECT}` `{DATE}` 佔位符 → 靜態解析取不到任何新聞 | ★★★ | DevTools 找 XHR/JSON 端點；`response.encoding='big5'` 或 `.content.decode('big5', errors='replace')` |
| **泰偉 3064** | `【需查證】` v1 未指定 | — | — | 先走 MOPS |

### v1 表格中已確認失效的連結

- 傳奇：v1 寫 `.../news_1.php#/nl/undefined/undefined` —— `#/nl/undefined/undefined` 是**從 SPA 複製到的殘缺 hash**，且該站根本沒有前端路由，屬複製錯誤。
- 網銀：v1 寫 `http://wanin.tw/News/` —— 實際會 301 到 `https://www.wanin.tw/News/`。**正規化網址必須補 `https://` 與 `www.`**，否則同一頁會被當成兩筆。

### 從稽核中撿到的免費情報（可直接寫進網站內容）

| 日期 | 事件 |
| :--- | :--- |
| 2026-08-12 | 智冠科技啟動經營傳承：**王思淳接任董事長、李殷獎出任總經理**【已驗證：智冠官網】 |
| 2026-07-08 | 網銀國際取得 **Gogolook 13.75% 股權，成為單一最大股東**【已驗證：網銀官網】 |
| 2026-04-14 | 閃電狼更名「**網銀國際閃電狼**」【已驗證】 |
| 2026-08-13 | 宇峻《三國群英傳：策定九州》正式公測，異業聯名鬍鬚張【已驗證】 |
| 2026-09-10 | 宇峻《幻世錄 重製版》預定發售【已驗證】 |
| 2026-03-05 | 大宇《曹操不囉嗦》台港澳新馬雙平台上市【已驗證】 |

---

## 3.3 資料來源清冊與可行性判定

### Tier A：官方一手（必做，法遵風險最低）

| 來源 | 取得方式 | 結構化 | 判定 |
| :--- | :--- | :---: | :--- |
| 八家官網新聞頁 | HTML / XHR（見 3.2） | 低～中 | ✅ 必做 |
| **TWSE OpenAPI** `https://openapi.twse.com.tw/v1/` | 無金鑰 REST，JSON/CSV，分類含公司治理、財務報表、證券交易等【已驗證：Swagger `host: openapi.twse.com.tw, basePath: /v1`】 | **高** | ✅ 必做（**僅涵蓋上市**＝本案只有傳奇 4994） |
| TPEx 開放資料 | REST | 高 | ✅ 必做（**涵蓋上櫃**＝本案 6 家）`【需查證：確切 endpoint】` |
| MOPS 重大訊息 | 新版 MOPS 為 **hash 路由 SPA**（`mops.twse.com.tw/mops/#/web/home`）→ **不可解析 HTML**，須打背後 JSON 端點 | 中 | ⚠️ 以 OpenAPI 為主、MOPS 為輔 |

> **關鍵架構事實**：八家公司橫跨三種法定身分——**上市**（傳奇 4994）、**上櫃**（智冠 5478、光聚 6111、橘子 6180、華義 3086、宇峻 3546、泰偉 3064）、**未上市**（網銀國際）。
> 因此法定揭露有三條路徑，而**網銀國際沒有任何法定揭露管道**。
> → v1 讓每張卡片都掛「🏛️ MOPS 觀測站」按鈕，**對網銀是壞連結**，必須移除或改為官網。

### Tier B：新聞聚合（必做）

| 來源 | 免費額度 | 風險 | 判定 |
| :--- | :--- | :--- | :--- |
| 各媒體 RSS（中央社、工商時報等） | 無限 | 低 | ✅ 首選 |
| GDELT DOC 2.0 API | 免費 | 中文覆蓋率待測 | ⚠️ M2 需做覆蓋率抽樣 |
| Google News RSS | 無官方 SLA | 隨時可能變動 | ⚠️ 備援，不可為唯一來源 |
| Bing News Search API | — | `【需查證：已公告退役，採用前確認】` | ❌ 不建議 |

### Tier C：社群 / KOL（高風險，MVP 建議降級）

| 來源 | 可行性 | 說明 |
| :--- | :---: | :--- |
| PTT `C_Chat` | ✅ | web 版可解析；部分板需 `over18=1` cookie |
| Dcard | ⚠️ | 公開 API 政策已收緊 `【需查證現況】` |
| Facebook / Instagram / Threads | ❌ | **無合法免費公開搜尋管道** |
| X (Twitter) | ❌ | 免費層不含搜尋端點 |
| YouTube Data API v3 | ⚠️ | `search.list` 每次 **100 units**，每日配額 10,000 → **每天上限 100 次搜尋**。8 家 × 每日 1 次 = 800 units，完全夠用 |

### Tier D：付費替代

意藍 OpView、Social Lab 等台灣輿情服務可合法取得 FB/IG/Dcard `【需查證報價】`。

> **判斷準則：若「社群聲量」是核心賣點，就必須付費；若不是，就誠實移除。不存在免費且合法的第三條路。**

---

# Part IV　架構：GitHub × Cloudflare（核心）

## 4.1 兩個平台各自的致命缺陷

| 平台 | 致命缺陷 | 嚴重度 |
| :--- | :--- | :--- |
| **GitHub Actions** | ① 排程工作在儲存庫**連續 60 天無活動後自動停用** → 專案半年後悄悄停更，網站看起來仍正常<br>② 排程觸發**不保證準時**，高負載時可能延遲或跳過<br>③ `GITHUB_TOKEN` 的 push **不會觸發**其他 workflow | 高 |
| **Cloudflare Workers Cron** | ① **無自動重試**——排程執行失敗就是丟失，等下一次<br>② **無失敗告警**——Cloudflare 不會通知你<br>③ 免費版**每個 Worker 最多 3 個 Cron Trigger**<br>④ 無執行歷史、無版本化資料 | 高 |

【以上 Cloudflare 限制已驗證：Cloudflare Workers Cron Triggers 2026 參考資料】

> **第一性原理：兩者的缺陷剛好互補。** GitHub 有版本歷史但排程不可靠；Cloudflare 排程可靠但沒有歷史。所以正解不是二選一，是**讓兩者互為備援**。

## 4.2 三個方案

### 方案 A：純 GitHub（最快上線）

```
GitHub Actions (cron) ──► Python pipeline ──► commit docs/data/*.json ──► GitHub Pages
```
- **優點**：零外部相依、資料全在版控、1 天可上線
- **缺點**：60 天停用問題、前端須下載整包 JSON、無即時查詢
- **適用**：MVP 第一週

### 方案 B：純 Cloudflare（最即時）

```
Worker (Cron Trigger) ──► fetch ──► R2 (raw) + D1 (documents)
                                       │
Cloudflare Pages ──► Pages Function ──► D1 即時查詢 ──► 前端
```
- **優點**：可即時篩選/搜尋、全球 CDN、排程更可靠
- **缺點**：資料無版本歷史、Cron 無重試無告警、Worker 免費版 CPU 10ms/次
- **適用**：資料量大或需要即時互動時

### 方案 C：混合（★ 推薦，本計劃採用）

```
┌──────────────────────── Cloudflare ────────────────────────┐
│                                                             │
│  Worker「fetcher」 Cron: 每日 00:10 UTC (台北 08:10)         │
│    ├─ fetch 8 家官網 + TWSE/TPEx OpenAPI (HTMLRewriter 串流) │
│    ├─ 原始回應 ──► R2  (bucket: gmi-raw)                    │
│    ├─ 正規化文件 ──► D1 (table: documents)                  │
│    └─ 聚合結果 ──► D1 (table: metrics_monthly)              │
│                                                             │
│  Pages Function /api/*  ──► 查 D1 ──► 前端即時篩選            │
│  Pages（靜態前端）◄── 由 GitHub push 自動部署                 │
└─────────────────────────────────────────────────────────────┘
              ▲                              │
              │ push 觸發部署                  │ 每週匯出快照
              │                              ▼
┌──────────────────────── GitHub ────────────────────────────┐
│  repo: 程式碼 + config/companies.yml + docs/data 快照        │
│  Actions ①「weekly-snapshot」每週一 00:00 UTC                │
│      └─ 呼叫 Worker 的 /export ──► commit JSON ──► 版本化備份 │
│  Actions ②「watchdog」每日 02:00 UTC                         │
│      └─ 檢查 D1 最後更新時間；逾 36h 未更新 ──► 開 Issue 告警   │
└─────────────────────────────────────────────────────────────┘
```

**為什麼 C 是正解：**

| 問題 | C 的解法 |
| :--- | :--- |
| GitHub Actions 60 天停用 | 抓取主力在 Cloudflare Cron，不受影響；且 weekly-snapshot 每週 commit **本身就是活動**，permanently 重置 60 天計時器 |
| Cloudflare Cron 無告警 | GitHub Actions watchdog 每日檢查，逾時自動開 Issue |
| Cloudflare 無版本歷史 | 每週快照 commit 進 repo，可 `git log` 追溯任何一週的資料狀態 |
| 前端載入慢 | Pages Function 直查 D1，只回傳需要的區間 |
| 兩邊都掛 | 前端仍可讀 repo 內的靜態快照（degraded mode） |

## 4.3 Cloudflare 免費額度（已驗證）

| 服務 | 免費額度 | 【已驗證】 |
| :--- | :--- | :--- |
| **Workers** | 100,000 requests/day；10ms CPU/invocation | ✅ |
| **Cron Triggers** | **每 Worker 最多 3 個**（付費 5 個）；最小間隔 1 分鐘；**無重試、無告警** | ✅ |
| **D1** | 5 GB 儲存；**5,000,000 rows read/day**；**100,000 rows written/day**；每日 00:00 UTC 重置 | ✅ |
| **R2** | 10 GB-month 儲存；1M Class A ops/月；10M Class B ops/月 | ✅ |
| **KV** | 1 GB；100K reads/day；**僅 1K writes/day** | ✅ |
| **Queues** | 10K operations/day | ✅ |
| **Pages** | 靜態請求無限；建置次數有月上限 | ✅ |

> **D1 的 rows read 是「掃描列數」不是「回傳列數」**：對 5,000 列的表做無索引欄位篩選的 `SELECT`，即使只回 3 筆也算 5,000 rows read。→ **必須為 `company_id`、`published_at`、`doc_type` 建索引**（Part V 5.3）。

## 4.4 本專案的用量模型（實算）

假設：8 家公司 × 平均 3 個來源頁 = 24 次 fetch/天；每則新聞 ~1KB；每天新增 ~30 則。

| 資源 | 本專案用量 | 免費額度 | 占比 |
| :--- | ---: | ---: | ---: |
| Worker requests | ~30/天（含 API） | 100,000/天 | **0.03%** |
| D1 rows written | ~30/天 | 100,000/天 | **0.03%** |
| D1 rows read | 每次頁面載入 ~5 查詢 × 索引後掃描 ~500 列 = 2,500；**假設 1,000 次訪問/天 = 2.5M** | 5,000,000/天 | **50%** ⚠️ |
| R2 儲存 | 24 檔 × 50KB × 365 天 ≈ **438 MB/年** | 10 GB | **4.4%/年**（可存 20 年） |
| Cron Triggers | 1 個（每日抓取） | 3 個 | 33% |

**唯一需要盯的是 D1 rows read。** 對策（依序）：
1. 為所有查詢欄位建索引（把全表掃描變成索引掃描）
2. 聚合結果預先算好存 `metrics_monthly` 表（前端主圖只讀這張小表）
3. 熱門查詢結果放 Cloudflare Cache API（免費、不計 D1）

## 4.5 為什麼不用 GitHub Pages 而用 Cloudflare Pages

| 面向 | GitHub Pages | Cloudflare Pages |
| :--- | :--- | :--- |
| CDN 節點 | 較少 | 全球，台灣延遲更低 |
| 自訂 Header / 重導 | ❌ | ✅（`_headers` / `_redirects`） |
| 後端 Function | ❌ | ✅ Pages Functions |
| Preview 部署 | ❌ | ✅ 每個 PR 自動預覽 |
| 與 GitHub 整合 | 原生 | 一次授權後 push 即部署 |

**兩者可並存**：GitHub Pages 當 degraded 備援（純靜態快照），Cloudflare Pages 當主站。

---

# Part V　資料模型與 Schema

## 5.1 公司主檔 `config/companies.yml`（唯一真實來源）

```yaml
# 八家公司主檔。任何程式都不得硬編碼公司資訊，一律讀這個檔。
- id: soft-world
  display_name: 智冠科技
  ticker: "5478"
  market: TPEx                      # TWSE | TPEx | UNLISTED
  legal_names:
    - { name: 智冠科技股份有限公司, from: 1990-01-01 }
  aliases: [智冠, 智冠科技, 智冠集團, Soft-World]
  subsidiaries: [MyCard, 藍新金流, 中華網龍]
  titles: [金庸群俠傳Online]
  sources:
    - { type: press_release, url: "https://www.soft-world.com/News", parser: soft_world, paging: "?page={n}", max_pages: 25 }
  ir_url: "https://www.soft-world.com/Investors"

- id: softstar
  display_name: 光聚晶電（原大宇資訊）
  ticker: "6111"
  market: TPEx
  legal_names:
    - { name: 大宇資訊股份有限公司,       from: 1988-01-01, until: 2026-01-06 }
    - { name: 光聚晶電聯合股份有限公司,   from: 2026-01-07 }   # 經授商字第11430207330號
  aliases: [大宇資, 大宇資訊, 光聚晶電, Softstar]
  exclude_aliases: [大宇紡織]          # 1445 為不同公司，裸詞「大宇」一律不匹配
  titles: [仙劍奇俠傳, 軒轅劍, 女鬼橋, 曹操不囉嗦, 伊藤潤二狂熱, 魔力寶貝]
  sources:
    - { type: press_release, url: "https://km.softstar.com.tw/topic.aspx?tid={id}", parser: softstar_seq, id_mode: sequential }
  notes: |
    法人已更名但遊戲新聞站仍署名「大宇資訊」→ 新舊名必須並存。
    2024 起出售仙劍（RMB 1,830萬 + 中手遊 3,800萬股）與軒轅劍（約 3.3 億元）IP、跨入海外博弈機台。

- id: gamania
  display_name: 橘子集團
  ticker: "6180"
  market: TPEx
  legal_names: [{ name: 遊戲橘子數位科技股份有限公司, from: 1995-01-01 }]
  aliases: [橘子, 遊戲橘子, 橘子集團, Gamania]
  subsidiaries: [果核數位]
  titles: [天堂M, 新楓之谷]           # 波拉西亞戰記【需查證】
  sources:
    - { type: press_release, url: "https://www.gamania.com/news", parser: gamania_spa, render: api_first }
  notes: SPA，靜態抓取回傳零筆。必須先找 API 端點。

- id: wanin
  display_name: 網銀國際
  ticker: null
  market: UNLISTED                   # 無 MOPS，前端不得顯示 MOPS 按鈕
  legal_names: [{ name: 網銀國際股份有限公司, from: 2002-01-01 }]
  aliases: [網銀, 網銀國際, WANIN]
  subsidiaries: [閃電狼, 網銀國際閃電狼, 威秀影城]
  titles: [星城, 星城Online, 游e卡]
  sources:
    - { type: press_release, url: "https://www.wanin.tw/News/", parser: wanin, paging: "?page={n}", max_pages: 15 }

- id: wayi
  display_name: 華義國際
  ticker: "3086"
  market: TPEx
  legal_names: [{ name: 華義國際數位娛樂股份有限公司, from: 1993-01-01 }]
  aliases: [華義, 華義國際, Wayi]
  titles: [遊戲大亂鬥, BanaBana]
  sources: []                        # 【需查證】官網新聞頁待確認，暫走 MOPS

- id: userjoy
  display_name: 宇峻奧汀
  ticker: "3546"
  market: TPEx
  legal_names: [{ name: 宇峻奧汀科技股份有限公司, from: 1995-05-01 }]
  aliases: [宇峻, 奧汀, 宇峻奧汀, UserJoy]
  titles: [三國群英傳, 策定九州, 幻世錄, 天使之戀, FFXIV, 最終幻想14]
  sources:
    - { type: press_release, url: "https://www.userjoy.com.tw/news/news_02.aspx?n={id:07d}", parser: userjoy_seq, id_mode: sequential }
    - { type: mops_filing,   url: "https://www.userjoy.com.tw/news/news_03.aspx", parser: userjoy_mops }
  notes: FFXIV 繁中 PC 版代理權，涵蓋台港澳新馬，月費 420(信用卡)/450(點數卡) 元。

- id: x-legend
  display_name: 傳奇網路
  ticker: "4994"
  market: TWSE                       # 上市，非上櫃
  legal_names: [{ name: 傳奇網路遊戲股份有限公司, from: 2007-01-01 }]
  aliases: [傳奇, 傳奇網路, X-Legend]
  titles: [幻想神域, 精靈樂章, 晴空物語, 星界神話, 咻咻史萊姆]
  sources:
    - { type: press_release, url: "https://www.x-legend.tw/02news/news_1.php", parser: xlegend, encoding: big5, render: api_first }
  notes: Big5 編碼 + 前端樣板（HTML 內為 {SUBJECT}/{DATE} 佔位符），必須找 XHR 端點。

- id: taiwei
  display_name: 泰偉電子
  ticker: "3064"
  market: TPEx                       # 【需查證】
  legal_names: [{ name: 泰偉電子股份有限公司, from: 1994-01-01 }]
  aliases: [泰偉, 泰偉電子]
  titles: []
  sources: []                        # 【需查證】暫走 MOPS
```

> **`exclude_aliases` 是本專案不可省略的欄位。** 少了它，「大宇」會把大宇紡織（1445）的法說會與營收公告算進遊戲公司聲量。

## 5.2 文件 Schema `schemas/document.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["doc_id","company_id","doc_type","published_at","title","url","source_domain","fetched_at","raw_ref"],
  "additionalProperties": false,
  "properties": {
    "doc_id":        {"type":"string","description":"sha256(canonical_url) 前 32 碼"},
    "company_id":    {"type":"string"},
    "doc_type":      {"enum":["press_release","mops_filing","media_article","social_post","kol_video"]},
    "doc_subtype":   {"type":["string","null"],"description":"財務新聞/產品新聞/最新聲明 等"},
    "published_at":  {"type":"string","format":"date-time","description":"Asia/Taipei ISO8601"},
    "title":         {"type":"string","maxLength":200},
    "summary":       {"type":"string","maxLength":100,"description":"≤100 字，不存全文"},
    "url":           {"type":"string","format":"uri"},
    "source_domain": {"type":"string"},
    "matched_by":    {"enum":["company_name","ticker","title","subsidiary","source"]},
    "entity_level":  {"enum":["parent","subsidiary"]},
    "cluster_id":    {"type":["string","null"]},
    "is_original":   {"type":"boolean"},
    "fetched_at":    {"type":"string","format":"date-time"},
    "raw_ref":       {"type":"string","description":"R2 物件 key，供溯源與重算"},
    "content_hash":  {"type":"string","description":"sha256(全文)，全文本身不儲存"}
  }
}
```

## 5.3 D1 Schema `schema.sql`

```sql
-- 文件主表
CREATE TABLE IF NOT EXISTS documents (
  doc_id        TEXT PRIMARY KEY,
  company_id    TEXT NOT NULL,
  doc_type      TEXT NOT NULL,
  doc_subtype   TEXT,
  published_at  TEXT NOT NULL,          -- ISO8601, Asia/Taipei
  title         TEXT NOT NULL,
  summary       TEXT,
  url           TEXT NOT NULL UNIQUE,
  source_domain TEXT NOT NULL,
  matched_by    TEXT,
  entity_level  TEXT DEFAULT 'parent',
  cluster_id    TEXT,
  is_original   INTEGER DEFAULT 1,
  fetched_at    TEXT NOT NULL,
  raw_ref       TEXT NOT NULL,
  content_hash  TEXT
);

-- 索引：D1 免費層計算的是「掃描列數」，沒有索引 = 全表掃描 = 燒配額
CREATE INDEX IF NOT EXISTS idx_doc_company_date ON documents(company_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_type_date    ON documents(doc_type, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_cluster      ON documents(cluster_id);

-- 預聚合表：前端主圖只讀這張（列數 = 8 家 × 月數，永遠很小）
CREATE TABLE IF NOT EXISTS metrics_monthly (
  company_id        TEXT NOT NULL,
  month             TEXT NOT NULL,       -- 'YYYY-MM'
  pr_count          INTEGER,
  media_original    INTEGER,
  media_syndicated  INTEGER,
  social_mentions   INTEGER,
  kol_videos        INTEGER,
  coverage          REAL,                -- 該月抓取成功率 0..1
  computed_at       TEXT NOT NULL,
  PRIMARY KEY (company_id, month)
);

-- 抓取稽核表：每次執行的成敗紀錄，watchdog 與品質閘門靠它
CREATE TABLE IF NOT EXISTS fetch_log (
  run_id        TEXT NOT NULL,
  source_id     TEXT NOT NULL,
  company_id    TEXT NOT NULL,
  status        TEXT NOT NULL,           -- ok | http_error | parse_error | robots_denied
  http_status   INTEGER,
  items_found   INTEGER,
  error_message TEXT,
  started_at    TEXT NOT NULL,
  PRIMARY KEY (run_id, source_id)
);
CREATE INDEX IF NOT EXISTS idx_fetchlog_time ON fetch_log(started_at DESC);
```

## 5.4 儲存庫結構（資料與呈現物理隔離）

```
for_SoftWorld/
├── config/
│   ├── companies.yml           # 公司主檔（唯一真實來源）
│   └── sources.yml             # RSS / API 端點清單
├── worker/                     # Cloudflare Worker（抓取層）
│   ├── src/
│   │   ├── index.ts            # Cron handler + /api 路由
│   │   ├── fetchers/           # 逐家 parser
│   │   ├── entity.ts           # 實體解析
│   │   ├── dedup.ts            # 去重分群
│   │   └── aggregate.ts        # 聚合
│   ├── wrangler.toml
│   └── schema.sql
├── pipeline/                   # Python 備援 / 回填工具
│   ├── backfill.py             # 歷史回填（Worker 不適合跑長任務）
│   └── validate.py             # 品質閘門
├── docs/                       # ← 前端發布根目錄（Cloudflare Pages）
│   ├── index.html
│   ├── css/  js/
│   ├── methodology.html        # 資料方法說明（必要）
│   └── data/                   # 每週快照（degraded mode 備援）
├── tests/
│   ├── fixtures/               # 黃金檔（真實 HTML 快照）
│   └── test_parsers.py
├── schemas/
└── .github/workflows/
    ├── weekly_snapshot.yml
    ├── watchdog.yml
    └── ci.yml
```

> **`docs/` 與 `worker/` 完全隔離。** 資料更新只寫 D1 與 `docs/data/*.json`，**在檔案系統層面就不可能動到 HTML/CSS** —— 這才是 v1「微創修改原則」真正想要的東西。

---

# Part VI　完整實作（逐步 + 全部程式碼）

## M0　環境與資料契約　**5 小時**

```bash
# 1. 分支與目錄
git checkout -b feat/data-pipeline
mkdir -p config worker/src/fetchers pipeline docs/data schemas tests/fixtures .github/workflows

# 2. Cloudflare CLI
npm install -g wrangler
wrangler login

# 3. 建立資源
wrangler d1 create gmi-db                    # 記下輸出的 database_id
wrangler r2 bucket create gmi-raw

# 4. 套用 schema
wrangler d1 execute gmi-db --remote --file=./worker/schema.sql

# 5. Python 備援環境
python -m venv .venv && source .venv/bin/activate
pip install requests beautifulsoup4 lxml pyyaml jsonschema python-dateutil feedparser
pip freeze > requirements.txt
```

**驗收**：`wrangler d1 execute gmi-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"` 列出 3 張表。

---

## M1　Worker 骨架與排程　**6 小時**

### `worker/wrangler.toml`

```toml
name = "gmi-fetcher"
main = "src/index.ts"
compatibility_date = "2026-08-01"

# 免費版每個 Worker 最多 3 個 Cron Trigger
[triggers]
crons = ["10 0 * * *"]        # UTC 00:10 = 台北 08:10，每日

[[d1_databases]]
binding = "DB"
database_name = "gmi-db"
database_id = "<M0 產生的 id>"

[[r2_buckets]]
binding = "RAW"
bucket_name = "gmi-raw"

[vars]
USER_AGENT = "GamingMediaIntelligenceBot/1.0 (+https://<你的網域>/methodology.html)"
```

### `worker/src/index.ts`

```typescript
export interface Env {
  DB: D1Database;
  RAW: R2Bucket;
  USER_AGENT: string;
}

import { runFetchAll } from "./fetchers";
import { aggregate }    from "./aggregate";

export default {
  // ── Cron 進入點 ────────────────────────────────
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(pipeline(env));
  },

  // ── HTTP API（給前端與 GitHub Actions 用）──────
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const json = (d: unknown, s = 200) =>
      new Response(JSON.stringify(d), {
        status: s,
        headers: { "content-type": "application/json; charset=utf-8",
                   "access-control-allow-origin": "*" },
      });

    // 手動觸發（等同 workflow_dispatch，Cloudflare Cron 沒有這功能）
    if (url.pathname === "/run" && req.method === "POST") {
      await pipeline(env);
      return json({ ok: true });
    }

    // 前端主圖：只讀預聚合小表
    if (url.pathname === "/api/metrics") {
      const { results } = await env.DB
        .prepare("SELECT * FROM metrics_monthly ORDER BY month")
        .all();
      return json({ generated_at: new Date().toISOString(), series: results });
    }

    // 溯源：構成某公司某月數字的原始文件清單
    if (url.pathname === "/api/sources") {
      const c = url.searchParams.get("company");
      const m = url.searchParams.get("month");          // 'YYYY-MM'
      if (!c || !/^\d{4}-\d{2}$/.test(m ?? "")) return json({ error: "bad params" }, 400);
      const { results } = await env.DB.prepare(
        `SELECT title, url, published_at, doc_type, source_domain, is_original
           FROM documents
          WHERE company_id = ?1 AND published_at LIKE ?2
          ORDER BY published_at DESC`
      ).bind(c, `${m}%`).all();                          // 走 idx_doc_company_date
      return json({ company: c, month: m, documents: results });
    }

    // 健康檢查：watchdog 用
    if (url.pathname === "/api/health") {
      const row = await env.DB
        .prepare("SELECT MAX(started_at) AS last_run FROM fetch_log")
        .first<{ last_run: string }>();
      const ageH = row?.last_run
        ? (Date.now() - Date.parse(row.last_run)) / 3.6e6 : 1e9;
      return json({ last_run: row?.last_run ?? null, age_hours: Math.round(ageH) },
                   ageH > 36 ? 503 : 200);
    }

    // 匯出快照：GitHub Actions 每週呼叫
    if (url.pathname === "/api/export") {
      const [metrics, docs] = await Promise.all([
        env.DB.prepare("SELECT * FROM metrics_monthly ORDER BY company_id, month").all(),
        env.DB.prepare(
          "SELECT * FROM documents WHERE published_at >= date('now','-400 day') ORDER BY published_at DESC"
        ).all(),
      ]);
      return json({ schema_version: "3.0", exported_at: new Date().toISOString(),
                    metrics: metrics.results, documents: docs.results });
    }

    return new Response("Not found", { status: 404 });
  },
};

async function pipeline(env: Env) {
  const runId = new Date().toISOString();
  await runFetchAll(env, runId);   // 抓取 → R2 + documents
  await aggregate(env);            // 重算 metrics_monthly
}
```

**驗收**：`wrangler deploy` 成功；`curl https://gmi-fetcher.<subdomain>.workers.dev/api/health` 回 JSON。

---

## M2　抓取器（依實地稽核結果分三類）　**16 小時**

### 通用工具 `worker/src/fetchers/base.ts`

```typescript
import type { Env } from "../index";

/** URL 正規化：去追蹤參數、去 www、去尾斜線。同一頁只能有一個 doc_id。 */
const TRACKING = /^(utm_|fbclid|gclid|ref$|from$|_ga)/;
export function canonUrl(raw: string): string {
  const u = new URL(raw);
  u.protocol = "https:";                                   // http→https，避免重複
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
  [...u.searchParams.keys()].forEach(k => TRACKING.test(k) && u.searchParams.delete(k));
  u.hash = "";
  u.pathname = u.pathname.replace(/\/+$/, "") || "/";
  return u.toString();
}

export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

/** 禮貌抓取：帶可識別 UA、逾時、指數退避。 */
export async function politeFetch(
  url: string, env: Env, opts: { encoding?: string; retries?: number } = {}
): Promise<{ status: number; text: string }> {
  const retries = opts.retries ?? 3;
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": env.USER_AGENT, "Accept-Language": "zh-TW,zh;q=0.9" },
        signal: AbortSignal.timeout(15000),
      });
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      // Big5 站（傳奇網路）必須指定編碼，否則整頁亂碼
      const text = opts.encoding
        ? new TextDecoder(opts.encoding).decode(await r.arrayBuffer())
        : await r.text();
      return { status: r.status, text };
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(res => setTimeout(res, 2 ** i * 1000));   // 1s, 2s, 4s
    }
  }
  throw new Error("unreachable");
}

/** 原始回應存 R2（不可變），回傳 raw_ref 供溯源與重算。 */
export async function saveRaw(env: Env, sourceId: string, url: string, body: string) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${sourceId}/${day}/${(await sha256(url)).slice(0, 16)}.json`;
  await env.RAW.put(key, JSON.stringify({
    url, fetched_at: new Date().toISOString(),
    content_hash: await sha256(body), body,
  }));
  return key;
}

/** 民國年轉西元：MOPS 回傳 1150316 或 115/03/16，兩種都要吃。 */
export function rocToAd(s: string): string {
  const d = s.replace(/\D/g, "");                    // 1150316
  const y = parseInt(d.slice(0, d.length - 4), 10) + 1911;
  return `${y}-${d.slice(-4, -2)}-${d.slice(-2)}`;
}
```

### 類型 A：SSR 表格 — 智冠 `soft_world.ts`

```typescript
import { politeFetch, saveRaw, canonUrl, sha256 } from "./base";
import type { Env } from "../index";

export async function fetchSoftWorld(env: Env, pages = 2) {
  const docs = [];
  for (let p = 1; p <= pages; p++) {
    const url = `https://www.soft-world.com/News${p > 1 ? `?page=${p}` : ""}`;
    const { text } = await politeFetch(url, env);
    const rawRef = await saveRaw(env, "soft-world", url, text);

    // HTMLRewriter 是串流解析，CPU 成本遠低於載入整棵 DOM（Worker 免費版限 10ms CPU）
    let date = "", title = "", href = "";
    const rows: any[] = [];
    await new HTMLRewriter()
      .on("table tr td:nth-child(1)", { text(t) { date += t.text; } })
      .on("table tr td:nth-child(2) a", {
        element(e) { href = e.getAttribute("href") ?? ""; },
        text(t)    { title += t.text; },
      })
      .on("table tr", {
        element() {
          if (date.trim() && title.trim() && href) {
            rows.push({ date: date.trim(), title: title.trim(), href });
          }
          date = ""; title = ""; href = "";
        },
      })
      .transform(new Response(text)).text();

    for (const r of rows) {
      const abs = canonUrl(new URL(r.href, "https://www.soft-world.com").toString());
      docs.push({
        doc_id: (await sha256(abs)).slice(0, 32),
        company_id: "soft-world",
        doc_type: "press_release",
        published_at: r.date.replace(/\//g, "-") + "T00:00:00+08:00",
        title: r.title, url: abs,
        source_domain: "soft-world.com",
        matched_by: "source", entity_level: "parent",
        is_original: 1, fetched_at: new Date().toISOString(), raw_ref: rawRef,
      });
    }
    await new Promise(r => setTimeout(r, 2000));      // 每網域 ≥2s
  }
  return docs;
}
```

### 類型 B：連續 ID 列舉 — 宇峻 / 大宇 `sequential.ts`

> **為什麼這比翻頁更好**：大宇是 ASP.NET `__doPostBack` 分頁（要帶 `__VIEWSTATE` POST），宇峻是 JS 分頁。兩者的內頁 ID 都是**連續整數**（宇峻 `n=0000963`、大宇 `tid=980`）。
> **直接從上次記錄的最大 ID 往上遞增，比模擬分頁簡單一個數量級，而且天然增量。**

```typescript
export async function fetchSequential(env: Env, cfg: {
  companyId: string; sourceId: string; domain: string;
  urlTemplate: string;               // "https://.../news_02.aspx?n={id}"
  pad?: number;                      // 宇峻需補零到 7 位
  titleSelector: string; dateSelector: string;
  maxProbe?: number;                 // 連續幾次 404 就停
}) {
  const last = await env.DB
    .prepare("SELECT MAX(CAST(json_extract(raw_ref,'$.seq') AS INTEGER)) AS m FROM documents WHERE company_id=?")
    .bind(cfg.companyId).first<{ m: number }>();
  let id = (last?.m ?? 900) + 1;                 // 首次執行的起始值見 M6 回填
  const docs = [];
  let miss = 0;

  while (miss < (cfg.maxProbe ?? 5)) {
    const idStr = cfg.pad ? String(id).padStart(cfg.pad, "0") : String(id);
    const url = cfg.urlTemplate.replace("{id}", idStr);
    const { status, text } = await politeFetch(url, env, { retries: 1 }).catch(() => ({ status: 404, text: "" }));

    if (status !== 200 || text.length < 500) { miss++; id++; continue; }
    miss = 0;

    let title = "", date = "";
    await new HTMLRewriter()
      .on(cfg.titleSelector, { text(t) { title += t.text; } })
      .on(cfg.dateSelector,  { text(t) { date  += t.text; } })
      .transform(new Response(text)).text();

    if (title.trim()) {
      const abs = canonUrl(url);
      docs.push({
        doc_id: (await sha256(abs)).slice(0, 32),
        company_id: cfg.companyId, doc_type: "press_release",
        published_at: normalizeDate(date) , title: title.trim(), url: abs,
        source_domain: cfg.domain, matched_by: "source", entity_level: "parent",
        is_original: 1, fetched_at: new Date().toISOString(),
        raw_ref: await saveRaw(env, cfg.sourceId, url, text),
      });
    }
    id++;
    await new Promise(r => setTimeout(r, 2000));
  }
  return docs;
}
```

呼叫方式：

```typescript
// 宇峻奧汀：ID 補零 7 位
await fetchSequential(env, {
  companyId: "userjoy", sourceId: "userjoy", domain: "userjoy.com.tw",
  urlTemplate: "https://www.userjoy.com.tw/news/news_02.aspx?n={id}", pad: 7,
  titleSelector: "h1, .news-title", dateSelector: ".news-date",
});

// 大宇（光聚）：ID 不補零
await fetchSequential(env, {
  companyId: "softstar", sourceId: "softstar", domain: "km.softstar.com.tw",
  urlTemplate: "https://km.softstar.com.tw/topic.aspx?tid={id}",
  titleSelector: "h1", dateSelector: ".date",
});
```

### 類型 C：SPA / 前端樣板 — 橘子與傳奇（需先找 API）

**這兩家靜態抓取回傳零筆，必須先做端點偵察。** 標準程序：

```bash
# 步驟 1：試 WordPress REST API（橘子的 og:image 指向 wp-content，高機率是 WP）
curl -sI "https://www.gamania.com/wp-json/wp/v2/posts?per_page=5" | head -1

# 步驟 2：若 404，用瀏覽器 DevTools → Network → Fetch/XHR → 重新整理頁面
#         找回傳 JSON 的請求，右鍵「Copy as cURL」

# 步驟 3：傳奇網路（Big5 + {SUBJECT} 樣板）同樣程序
#         注意回應可能也是 Big5，需 iconv -f big5 -t utf-8

# 步驟 4：都找不到，才用 Playwright（只能跑在 GitHub Actions，不能跑在 Worker）
```

Playwright 備援（放 `pipeline/spa_fetch.py`，由 GitHub Actions 執行）：

```python
# 僅在 API 偵察失敗時使用。Worker 無法執行瀏覽器，故此路徑走 GitHub Actions。
from playwright.sync_api import sync_playwright

def fetch_spa(url: str, wait_selector: str, timeout_ms: int = 15000) -> str:
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(user_agent="GamingMediaIntelligenceBot/1.0")
        pg.goto(url, wait_until="networkidle", timeout=timeout_ms)
        pg.wait_for_selector(wait_selector, timeout=timeout_ms)
        html = pg.content()
        b.close()
        return html
```

**驗收**：八家中至少 5 家（智冠、大宇、網銀、宇峻 + 任一）可產出 ≥10 筆真實文件，`fetch_log` 全為 `ok`。

---

## M3　實體解析　**8 小時**

### `worker/src/entity.ts`

```typescript
type Company = {
  id: string; ticker: string | null;
  legal_names: { name: string; from: string; until?: string }[];
  aliases: string[]; exclude_aliases?: string[];
  subsidiaries?: string[]; titles?: string[];
};

/** 回傳 [company_id, matched_by, entity_level]，比對不到回 [null,null,null]。 */
export function matchCompany(
  text: string, companies: Company[], when: string
): [string | null, string | null, string | null] {
  for (const c of companies) {
    // ① 排除詞優先否決：「大宇紡織」不得命中 6111
    if (c.exclude_aliases?.some(x => text.includes(x))) continue;

    // ② 依文章發布時間選出當時有效的法人名稱（處理更名）
    for (const ln of c.legal_names) {
      const okFrom  = when >= ln.from;
      const okUntil = !ln.until || when <= ln.until;
      if (okFrom && okUntil && text.includes(ln.name)) return [c.id, "company_name", "parent"];
    }
    // ③ 但別名不受時間限制 —— 大宇已更名，其遊戲站仍署名「大宇資訊」
    if (c.aliases.some(a => text.includes(a)))        return [c.id, "company_name", "parent"];
    if (c.ticker && text.includes(c.ticker))          return [c.id, "ticker",       "parent"];
    if (c.subsidiaries?.some(s => text.includes(s)))  return [c.id, "subsidiary",   "subsidiary"];
    if (c.titles?.some(t => text.includes(t)))        return [c.id, "title",        "parent"];
  }
  return [null, null, null];
}
```

### 必須通過的測試（`tests/test_entity.py`）

| 輸入 | 期望輸出 | 檢驗什麼 |
| :--- | :--- | :--- |
| `"大宇紡織法說會"` | `null` | 排除詞否決 |
| `"大宇資訊出售仙劍IP"` | `softstar` | 舊名仍有效 |
| `"光聚晶電董事會決議"` | `softstar` | 新名生效 |
| `"《三國群英傳》改版"` | `userjoy` | 作品名匹配 |
| `"果核數位資安服務"` | `gamania` + `subsidiary` | 子公司分級 |

**驗收**：5 個案例全綠。

---

## M4　去重分群　**6 小時**

```typescript
// worker/src/dedup.ts

/** 標題相似度（Dice coefficient on bigrams）。中文短標題比 Levenshtein 穩定。 */
function similarity(a: string, b: string): number {
  const grams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const A = grams(a), B = grams(b);
  let hit = 0; A.forEach(g => B.has(g) && hit++);
  return (2 * hit) / (A.size + B.size || 1);
}

/** ±72 小時內、標題相似度 ≥0.88 者視為同一則稿。最早者為原生，其餘為轉載。 */
export function cluster(docs: any[], hours = 72, thr = 0.88) {
  const sorted = [...docs].sort((a, b) => a.published_at.localeCompare(b.published_at));
  const out: any[] = [];
  for (const d of sorted) {
    const hit = out.find(o =>
      Math.abs(Date.parse(d.published_at) - Date.parse(o.published_at)) <= hours * 3.6e6 &&
      similarity(d.title, o.title) >= thr
    );
    if (hit) { d.cluster_id = hit.cluster_id; d.is_original = 0; }
    else     { d.cluster_id = d.doc_id;       d.is_original = 1; }
    out.push(d);
  }
  return out;
}
```

**驗收**：餵入 3 篇同稿轉載 → 輸出 1 original + 2 syndicated。

---

## M5　聚合與 GitHub Actions　**8 小時**

### `worker/src/aggregate.ts`

```typescript
export async function aggregate(env: Env) {
  // 一次 SQL 重算所有月份。走 idx_doc_company_date，不會全表掃描。
  await env.DB.prepare(`
    INSERT OR REPLACE INTO metrics_monthly
      (company_id, month, pr_count, media_original, media_syndicated,
       social_mentions, kol_videos, coverage, computed_at)
    SELECT
      company_id,
      substr(published_at, 1, 7)                                            AS month,
      SUM(doc_type IN ('press_release','mops_filing'))                      AS pr_count,
      SUM(doc_type = 'media_article' AND is_original = 1)                   AS media_original,
      SUM(doc_type = 'media_article' AND is_original = 0)                   AS media_syndicated,
      SUM(doc_type = 'social_post')                                         AS social_mentions,
      SUM(doc_type = 'kol_video')                                           AS kol_videos,
      NULL, datetime('now')
    FROM documents
    GROUP BY company_id, month
  `).run();

  // coverage 由 fetch_log 另算：該月成功來源數 ÷ 應抓來源數
  await env.DB.prepare(`
    UPDATE metrics_monthly SET coverage = (
      SELECT CAST(SUM(status='ok') AS REAL) / COUNT(*)
        FROM fetch_log
       WHERE fetch_log.company_id = metrics_monthly.company_id
         AND substr(started_at,1,7) = metrics_monthly.month
    )
  `).run();
}
```

### `.github/workflows/weekly_snapshot.yml`

```yaml
name: weekly-snapshot
on:
  schedule:
    - cron: "0 0 * * 1"          # UTC 週一 00:00 = 台北 週一 08:00
  workflow_dispatch:
permissions:
  contents: write
concurrency: { group: snapshot, cancel-in-progress: false }
jobs:
  snapshot:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - name: 從 Worker 匯出資料快照
        run: |
          curl -sf "${{ secrets.WORKER_URL }}/api/export" -o docs/data/snapshot.json
          jq '{schema_version, exported_at, metrics}' docs/data/snapshot.json \
            > docs/data/metrics_monthly.json

      - name: 品質閘門（失敗即中止，不得 commit 壞資料）
        run: |
          python -m pip install jsonschema
          python pipeline/validate.py --snapshot docs/data/snapshot.json --fail-on-anomaly

      - name: Commit
        run: |
          git config user.name  "data-bot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add docs/data/
          git diff --staged --quiet || git commit -m "chore(data): weekly snapshot $(date -u +%F)"
          git push
```

> **這個 workflow 每週的 commit，本身就是「儲存庫活動」，因此永久重置 GitHub 的 60 天排程停用計時器。** 這是方案 C 的關鍵副作用。

### `.github/workflows/watchdog.yml`（補上 Cloudflare Cron 缺少的告警）

```yaml
name: watchdog
on:
  schedule:
    - cron: "0 2 * * *"          # 每日 UTC 02:00，在抓取後 ~2 小時
  workflow_dispatch:
permissions:
  issues: write
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: 檢查 Worker 健康狀態
        id: health
        run: |
          code=$(curl -s -o /tmp/h.json -w "%{http_code}" "${{ secrets.WORKER_URL }}/api/health")
          echo "age=$(jq -r .age_hours /tmp/h.json)" >> $GITHUB_OUTPUT
          [ "$code" = "200" ] || echo "unhealthy=true" >> $GITHUB_OUTPUT

      - name: 逾時則開 Issue
        if: steps.health.outputs.unhealthy == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner, repo: context.repo.repo,
              title: `[watchdog] 資料已 ${{ steps.health.outputs.age }} 小時未更新`,
              body: "Cloudflare Cron 可能失敗。Cron Triggers 無自動重試，請手動觸發：\n\n```\ncurl -X POST $WORKER_URL/run\n```",
              labels: ["ops","urgent"]
            })
```

**驗收**：手動 `workflow_dispatch` 兩個 workflow 皆全綠；`docs/data/metrics_monthly.json` 出現在 repo。

---

## M6　歷史回填　**6 小時**

Worker 有 CPU 與執行時間限制，**不適合跑長時間回填**。回填走 GitHub Actions + Python，一次性執行後把結果 POST 進 D1。

```python
# pipeline/backfill.py — 一次性歷史回填（智冠 25 頁、網銀 15 頁、宇峻/大宇 ID 全掃）
import time, json, requests, yaml, hashlib
from bs4 import BeautifulSoup

UA = {"User-Agent": "GamingMediaIntelligenceBot/1.0"}

def backfill_paged(base: str, pages: int, row_sel: str, domain: str, company: str):
    docs = []
    for p in range(1, pages + 1):
        url = f"{base}?page={p}" if p > 1 else base
        r = requests.get(url, headers=UA, timeout=20)
        r.encoding = r.apparent_encoding                 # Big5 站自動偵測
        soup = BeautifulSoup(r.text, "lxml")
        for tr in soup.select(row_sel):
            tds = tr.find_all("td")
            a = tr.find("a")
            if len(tds) < 2 or not a: continue
            docs.append({
                "company_id": company,
                "doc_type": "press_release",
                "published_at": tds[0].get_text(strip=True).replace("/", "-") + "T00:00:00+08:00",
                "title": a.get_text(strip=True),
                "url": requests.compat.urljoin(base, a["href"]),
                "source_domain": domain,
            })
        time.sleep(2)                                    # 每網域 ≥2s
    return docs

if __name__ == "__main__":
    all_docs = []
    all_docs += backfill_paged("https://www.soft-world.com/News", 25,
                               "table tr", "soft-world.com", "soft-world")
    all_docs += backfill_paged("https://www.wanin.tw/News/", 15,
                               "article, .news-item", "wanin.tw", "wanin")
    # 批次寫入 D1（每批 500 筆，遠低於 100K rows/day 免費額度）
    for i in range(0, len(all_docs), 500):
        requests.post(f"{WORKER_URL}/api/ingest",
                      json={"documents": all_docs[i:i+500]},
                      headers={"Authorization": f"Bearer {INGEST_TOKEN}"}, timeout=60)
    print(f"回填完成：{len(all_docs)} 筆")
```

**驗收**：`SELECT COUNT(*) FROM documents` ≥ 500；最早 `published_at` 早於 2024-01-01。

---

# Part VII　前端規格與改造方式

## 7.1 改造原則：只換資料源，不動版面

v1 已有設計好的 HTML/CSS。改造只做三件事：

| 步驟 | 動作 | 檔案 |
| :-- | :--- | :--- |
| 1 | **刪除** `js/data.js` 內所有硬編碼假資料陣列 | `docs/js/data.js` |
| 2 | 改為 `fetch('/api/metrics')`（主站）或 `fetch('data/metrics_monthly.json')`（degraded） | `docs/js/data.js` |
| 3 | 圖表 `onClick` → 開啟溯源彈窗 | `docs/js/charts.js` |

```javascript
// docs/js/data.js — 資料層唯一入口。HTML 與 CSS 完全不需要改。
const API = "https://gmi-fetcher.<subdomain>.workers.dev";

export async function loadMetrics() {
  try {
    const r = await fetch(`${API}/api/metrics`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch {
    // degraded mode：Worker 掛了就讀 repo 內的週快照
    console.warn("API 不可用，改用靜態快照");
    return await (await fetch("data/metrics_monthly.json")).json();
  }
}

// 溯源：這是「資料真實」與「儀表板造數」的分界線
export async function loadSources(companyId, month) {
  const r = await fetch(`${API}/api/sources?company=${companyId}&month=${month}`);
  return (await r.json()).documents;
}
```

```javascript
// docs/js/charts.js — 圖表點擊 → 溯源彈窗
chart.options.onClick = async (evt, elements) => {
  if (!elements.length) return;
  const i = elements[0].index;
  const month = chart.data.labels[i];
  const company = chart.data.datasets[elements[0].datasetIndex].companyId;
  const docs = await loadSources(company, month);
  showModal(`${company} · ${month}（共 ${docs.length} 則）`, docs.map(d =>
    `<li><a href="${d.url}" target="_blank" rel="noopener">${d.title}</a>
         <span class="meta">${d.published_at.slice(0,10)} · ${d.source_domain}
         ${d.is_original ? "" : "（轉載）"}</span></li>`).join(""));
};
```

## 7.2 設計 token（把 v1 的美術方向變成可執行約束）

```css
:root{
  --forest:#2d5a3f;         /* 主按鈕；白底對比 8.6:1 → WCAG AAA */
  --ink:#2b2b2b;            /* 內文；白底 13.7:1 */
  --muted:#6b6b6b;          /* 次要文字；白底 5.3:1 → AA */
  --morandi-sage:#a8b5a0;   /* 僅可用於「面」與圖表色塊，禁止當文字色 */
  --morandi-clay:#c3a89a;
  --surface:#ffffff; --line:#e8e6e1;
  --warn:#8a6d1f;           /* 資料過期警示 */
}
```

> **鐵則：莫蘭迪色飽和度低，對比度通常 < 3:1，只能當背景/色塊。一旦拿來當文字色就直接違反可及性標準。**

## 7.3 必要的資料狀態顯示

```html
<!-- 首頁頂部。使用者必須能一眼看出資料是否新鮮、是否完整。 -->
<div id="data-status" class="status-bar">
  資料更新於 <time id="last-updated"></time>
  · 來源覆蓋率 <span id="coverage"></span>
  <a href="methodology.html">資料方法說明</a>
</div>
```

```javascript
const ageDays = (Date.now() - Date.parse(data.generated_at)) / 864e5;
if (ageDays > 14) bar.classList.add("stale");   // 紅色：資料可能已停更
else if (ageDays > 8) bar.classList.add("warn");
if (data.coverage < 0.9) showCoverageWarning();
```

## 7.4 圖表選型與效能預算

| 需求 | 選擇 | 理由 |
| :--- | :--- | :--- |
| 折線/長條/圓餅/雷達 | **Chart.js v4**（tree-shaking，只 import 用到的 controller） | 雷達圖原生支援；可壓到 ~70KB gzip |
| 只需折線 | uPlot | 更輕，但無雷達圖，本案不適用 |
| ECharts | ❌ | 完整包 > 400KB，超出預算 |

| 預算項 | 上限 |
| :--- | ---: |
| 首屏 JS (gzip) | 150 KB |
| `metrics_monthly.json` | 200 KB |
| LCP | 2.5 s |

**色盲可用性**：圖表不得只用顏色區分系列，必須加直接標籤或圖案。

---

# Part VIII　自動化、監控與故障處理

## 8.1 平台限制對照與對策（全部已驗證）

| 限制 | 影響 | 對策 |
| :--- | :--- | :--- |
| GitHub Actions 排程在 repo **連續 60 天無活動後自動停用** | 半年後靜靜停更 | weekly-snapshot 每週 commit 即為活動，永久重置計時器 |
| GitHub 排程**不保證準時** | 不可假設 08:00 一定完成 | 抓取用 `--since 8d` 重疊，容忍漏跑 |
| `GITHUB_TOKEN` push **不觸發**其他 workflow | 部署鏈可能斷 | 用 Cloudflare Pages 的 Git 整合（不依賴 Actions） |
| **Cloudflare Cron 無自動重試** | 失敗即丟失一天 | watchdog 開 Issue + `POST /run` 手動補跑 |
| **Cloudflare Cron 無失敗告警** | 你不會知道 | 同上，這是 watchdog 存在的唯一理由 |
| **Worker 免費版 CPU 10ms/次** | 大量解析可能超時 | 用 HTMLRewriter（串流，非 DOM）；fetch 等待不計 CPU |
| Worker 免費版 subrequest 上限 `【需查證：約 50/次】` | 一次抓太多家會被截斷 | 分家分次；或用 Queues（10K ops/day 免費）fan-out |
| **D1 5M rows read/day** | 高流量會打爆 | 建索引 + 預聚合表 + Cache API |
| R2 累積 | 長期膨脹 | raw 保留 400 天，更舊者刪除或轉冷儲存 |

## 8.2 三種故障的處理流程

```
症狀：網站數字沒變
  └─ curl $WORKER_URL/api/health
       ├─ 200 且 age_hours < 36 → 資料正常，是前端快取問題 → 清 Cloudflare Cache
       └─ 503 或 age_hours > 36 → 抓取失敗
            └─ wrangler tail gmi-fetcher            # 看即時 log
                 ├─ HTTP 403/429 → 對方封鎖 → 調高間隔、檢查 UA
                 ├─ parse_error  → 對方改版 → 跑黃金檔測試定位，修 selector
                 └─ 無 log       → Cron 沒觸發 → curl -X POST $WORKER_URL/run 手動補
```

## 8.3 常態維運節奏

| 頻率 | 動作 | 耗時 |
| :--- | :--- | ---: |
| 每日 | watchdog 自動檢查（無事不用管） | 0 |
| 每週 | 掃一眼 snapshot commit 的 diff 是否合理 | 2 分鐘 |
| 每季 | 重跑黃金檔測試，確認八家官網未改版 | 15 分鐘 |
| 每年 | 複查 Cloudflare / GitHub 免費額度政策 | 30 分鐘 |

---

# Part IX　測試與品質閘門

## 9.1 三道硬性閘門（任一失敗即中止 commit）

```python
# pipeline/validate.py
import json, sys, statistics as st

def gate_schema(docs, schema):
    """閘門 1：所有文件通過 JSON Schema。"""
    from jsonschema import validate
    for d in docs: validate(d, schema)

def gate_provenance(metrics, docs):
    """閘門 2（本案最重要）：每個聚合數值都要能對回原始文件。"""
    from collections import Counter
    actual = Counter((d["company_id"], d["published_at"][:7]) for d in docs)
    for m in metrics:
        total = (m["pr_count"] or 0) + (m["media_original"] or 0) + (m["media_syndicated"] or 0)
        key = (m["company_id"], m["month"])
        if total != actual.get(key, 0):
            sys.exit(f"✗ 溯源失敗 {key}: 聚合={total} 實際文件={actual.get(key,0)} → 疑似造數")

def gate_anomaly(metrics):
    """閘門 3：偏離前 12 期中位數 3×MAD 即中止，等待人工確認。"""
    by_c = {}
    for m in sorted(metrics, key=lambda x: x["month"]):
        by_c.setdefault(m["company_id"], []).append(m["pr_count"] or 0)
    for cid, series in by_c.items():
        if len(series) < 13: continue
        hist, cur = series[-13:-1], series[-1]
        med = st.median(hist)
        mad = st.median([abs(x - med) for x in hist]) or 1
        if abs(cur - med) > 3 * mad:
            sys.exit(f"✗ 異常 {cid}: 本期={cur} 中位數={med} MAD={mad} → 需人工確認")
```

## 9.2 黃金檔測試（Golden Files）

把八家官網的真實 HTML 存進 `tests/fixtures/`，parser 針對快照測試。

> **理由：網站改版是這類專案最常見的沉默失效來源。** 黃金檔讓「對方改版」在 CI 立刻現形，而不是三個月後你才發現圖表一直是平的。

```bash
# 建立黃金檔（每季更新一次）
for f in soft-world wanin userjoy; do
  curl -s "$(yq ".[] | select(.id==\"$f\") | .sources[0].url" config/companies.yml)" \
    > "tests/fixtures/${f}_$(date +%Y%m%d).html"
done
```

---

# Part X　法遵與風險

## 10.1 著作權（台灣著作權法）

| 做法 | 判斷 |
| :--- | :--- |
| 儲存 標題 + URL + 發布時間 + ≤100 字摘要 | ✅ 事實資訊與索引導流，風險低 |
| 儲存新聞全文於公開儲存庫 | ❌ 明確重製，風險高 |
| 顯示新聞圖片 | ❌ 不做 |
| 使用公司 Logo | ⚠️ 商標；改用文字 + 品牌色塊 |

**實作**：全文只在 Worker 記憶體中用於相似度比對，比對後丟棄，僅保留 `content_hash`。

## 10.2 抓取禮儀（同時是被封鎖的最佳防護）

遵守 `robots.txt`；每網域 ≥ 2 秒間隔；帶可識別 User-Agent 與說明頁連結；使用 ETag/If-Modified-Since；收到 429/503 立即指數退避。

## 10.3 個資與人格權

KOL 是自然人。只儲存**公開影片的 metadata**（頻道名、標題、URL、發布時間），不建立個人檔案、不做行為側寫、不推論業配關係（除非影片本身標示「合作」）。

## 10.4 必要免責聲明（頁尾 + `methodology.html`）

> 本站為獨立技術研究專案，非任何公司之官方管道，與所列公司無合作或委任關係。
> 所有數據由公開來源自動彙整，可能存在遺漏、延遲或誤判，**不構成投資建議**。
> 各項指標之計算口徑請見「資料方法說明」。原始著作權歸各媒體所有，本站僅提供索引與連結。

## 10.5 風險登記表

| 風險 | 機率 | 衝擊 | 對策 |
| :--- | :---: | :---: | :--- |
| 官網改版導致 parser 失效 | 高 | 中 | 黃金檔測試 + 每季複查 |
| 被目標站封 IP | 中 | 高 | 限速 + UA + 退避；Worker 出口 IP 分散 |
| Cloudflare/GitHub 免費政策變更 | 低 | 高 | 資料在 repo 內有完整快照，可整包搬遷 |
| 公司再度更名或併購 | 中 | 中 | `legal_names` 生效日期機制已支援 |
| 被誤認為官方或投資工具 | 中 | 高 | 顯著免責聲明 + methodology 頁 |

---

# Part XI　里程碑與工時

| 里程碑 | 內容 | 工時 | 累計 | 驗收 |
| :--- | :--- | ---: | ---: | :--- |
| M0 | 環境、D1/R2、資料契約 | 5h | 5h | 3 張表建立完成 |
| M1 | Worker 骨架 + Cron + API | 6h | 11h | `/api/health` 回 200 |
| M2 | 抓取器（3 種類型 × 8 家） | 16h | 27h | ≥5 家產出 ≥10 筆真實文件 |
| M3 | 實體解析 | 8h | 35h | 5 個測試案例全綠 |
| M4 | 去重分群 | 6h | 41h | 3 篇轉載 → 1 原生 + 2 轉載 |
| M5 | 聚合 + GitHub Actions + watchdog | 8h | 49h | 兩個 workflow 全綠 |
| M6 | 歷史回填 | 6h | 55h | ≥500 筆，最早早於 2024-01 |
| M7 | 前端接線 + 溯源 UI | 10h | 65h | 兩次點擊看到真實連結 |
| M8 | 品質閘門 + methodology + 上線 | 8h | 73h | 三道閘門在 CI 運作 |
| （選配） | Tier C 社群 + KOL | 18h | 91h | — |

**合計 73 小時 ≈ 9 個工作天（單人 8h/日）。** 純靜態的方案 A 可在 **第 3 天**先上線，再逐步切換到方案 C。

---

# Part XII　八家公司主檔（v1 修訂對照）

| 企業 | 代碼 | 市場別 | v1 → v3 修訂 |
| :--- | :--- | :--- | :--- |
| 智冠科技 | 5478 | 上櫃 | 新增：2026-08-12 **王思淳接任董事長、李殷獎任總經理**【已驗證】；需決定 MyCard/藍新/中華網龍(3083) 是否併計 |
| **光聚晶電**（原大宇資訊） | 6111 | 上櫃 | **已於 2026-01-07 更名**【已驗證】；2024 起出售仙劍/軒轅劍 IP、跨博弈機台；**但遊戲站仍署名「大宇資訊」→ 新舊名並存**；代表作已換為《曹操不囉嗦》《伊藤潤二狂熱》 |
| 橘子集團 | 6180 | 上櫃 | 官網為 SPA，**靜態抓取回零筆**；《波拉西亞戰記》歸屬 `【需查證】`；果核數位為資安子公司 |
| 網銀國際 | — | **未上市** | **無 MOPS，v1 的 MOPS 按鈕無效必須移除**；新增 2026-07-08 **成為 Gogolook 單一最大股東（13.75%）**、閃電狼更名「網銀國際閃電狼」【已驗證】 |
| 華義國際 | 3086 | 上櫃 | 官網新聞頁 `【需查證】`，暫走 MOPS |
| 宇峻奧汀 | 3546 | 上櫃 | **FFXIV 繁中 PC 版代理確認**（台港澳新馬，月費 420/450 元）【已驗證】；新增《三國群英傳：策定九州》2026-08-13 公測、《幻世錄 重製版》2026-09-10 發售 |
| 傳奇網路 | 4994 | **上市** | 市場別正確（Yahoo `.TW` 後綴＝TWSE）；官網為 **Big5 + 前端樣板**，需找 XHR 端點 |
| 泰偉電子 | 3064 | 上櫃 `【需查證】` | 官網新聞頁 `【需查證】`，暫走 MOPS |

---

# Part XIII　待查證清單（開工第一天完成）

| # | 項目 | 確認方式 | 阻擋 | 預估 |
| :-- | :--- | :--- | :--- | ---: |
| 1 | **橘子 gamania.com 的資料 API 端點** | 先試 `/wp-json/wp/v2/posts`；不行開 DevTools → Network → Fetch/XHR | M2 | 20 分 |
| 2 | **傳奇 x-legend.tw 的 XHR 端點** | 同上；注意回應可能也是 Big5 | M2 | 20 分 |
| 3 | 華義 3086、泰偉 3064 是否有官網新聞頁 | 官網巡檢 | M2 | 15 分 |
| 4 | TPEx 開放資料的重大訊息 endpoint | 查 TPEx 開放資料平台 Swagger | M2 | 20 分 |
| 5 | Worker 免費版 subrequest 上限 | Cloudflare Workers Limits 官方文件 | M2 | 5 分 |
| 6 | 《波拉西亞戰記》與橘子的關係 | 橘子官方新聞稿 | M0 | 10 分 |
| 7 | PTT / Dcard 現行存取政策與 robots.txt | 逐站確認 | M2（選配） | 20 分 |

> **這 7 項未確認前不要寫對應的 parser。先寫再改的成本，是先確認的 5 倍。**

---

# 附錄 A　v1 → v3 取捨對照

| v1 主張 | v3 處置 | 原因 |
| :--- | :--- | :--- |
| 32 個月四大指標自動推進 | **刪除**，改真實抓取，缺漏留白 | 造數不是資料 |
| 四大指標並列 | 社群/KOL 降級為選配並標明口徑 | 取得難度差兩個數量級 |
| 「微創修改原則」 | 資料/呈現物理隔離 + 三道 CI 閘門 | 口號無法執行 |
| 每家都掛 MOPS 按鈕 | 未上市公司不掛 | 網銀國際無法定揭露 |
| 「每週一台北 08:00」 | Cloudflare Cron `10 0 * * *`（UTC）+ GitHub watchdog | 時區換算 + 平台無告警 |
| 純 GitHub Actions | GitHub × Cloudflare 混合 | 60 天停用 vs 無告警，兩者互補 |
| 「官方新聞來源」一欄 URL | 逐家實測的技術型態 + 抓法 | 三家 v1 連結有問題，兩家靜態抓不到 |

# 附錄 B　第一次執行的完整指令序列

```bash
# ── 前置 ──────────────────────────────────
npm install -g wrangler && wrangler login
git clone https://github.com/yin0612/for_SoftWorld && cd for_SoftWorld
git checkout -b feat/data-pipeline

# ── 建立雲端資源 ──────────────────────────
wrangler d1 create gmi-db          # 複製 database_id 貼進 wrangler.toml
wrangler r2 bucket create gmi-raw
wrangler d1 execute gmi-db --remote --file=./worker/schema.sql

# ── 部署 Worker ───────────────────────────
cd worker && wrangler deploy && cd ..
curl "https://gmi-fetcher.<subdomain>.workers.dev/api/health"

# ── 首次抓取 + 回填 ───────────────────────
curl -X POST "https://gmi-fetcher.<subdomain>.workers.dev/run"
python pipeline/backfill.py

# ── 設定 GitHub Secret ────────────────────
gh secret set WORKER_URL --body "https://gmi-fetcher.<subdomain>.workers.dev"

# ── 驗證整條鏈 ────────────────────────────
gh workflow run weekly-snapshot
gh workflow run watchdog

# ── 接上 Cloudflare Pages ─────────────────
# Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
#   Build output directory: docs
#   之後每次 push 自動部署
```
