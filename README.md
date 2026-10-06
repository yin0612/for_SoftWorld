# 智冠相關產業監測網

## 📌 專案簡介
本專案以智冠年度關鍵字規則為核心，監測智冠集團、藍新科技、競業與遊戲／支付產業的官方 RSS 與 Google News RSS 聚合真實新聞；產業總覽同時整理遊戲與數位娛樂企業，以及綠界、紅陽、LINE Pay Money、街口支付、全支付等大型金融支付業者，並保留比較與視覺化工具作為延伸參考。

## ⚠️ 資料說明與規範
- **公司主檔**：公司簡介與產品清單由人工整理，介面標示「人工整理・待查核」與來源入口；公司近期新聞由全站真實新聞資料自動更新。
- **真實新聞分析**：`#/analytics`、`#/compare` 與 `#/trends` 只使用 Cloudflare Worker/D1 已收錄的文章，統計新聞量、監測分類、實際來源與關鍵字命中；不使用模型聲量或估算數字。
- **資料溯源 (Data Provenance)**：每則新聞保留來源、命中規則、發布日期與原文連結，圖表的日期區間與來源類型會同步顯示。

## 🚀 本機開發與預覽
```bash
# 於專案根目錄啟動本機伺服器
python3 -m http.server 8765

# 瀏覽器開啟預覽
http://127.0.0.1:8765/
```

## 📁 專案檔案結構
- `index.html` — 主網頁 HTML 結構與八大獨立區塊
- `css/` — 核心樣式表 (index.css, components.css, animations.css)
- `js/data.js` — 15 家遊戲與金融支付業者主檔、監測分類與關鍵字設定（新聞資料由 API 提供）
- `js/charts.js` — 真實監測圖表模組（進入分析頁時才載入 Chart.js）
- `js/compare.js` — 企業真實新聞數量、來源與分類比較工具
- `js/app.js` — SPA Hash 切頁路由器 (`#/companies`, `#/news`, `#/gaming`, `#/fintech`, `#/analytics`, `#/compare`, `#/trends`, `#/methodology`) 與 UI 邏輯
- `js/refresh.js` — 全站每 5 分鐘共用同步、台北日期邊界與新鮮度判定
- `config/` — `companies.yml` 公司主檔與 `sources.yml` 觀測媒體清單

## 🌐 部署
平台部署於 GitHub Pages（源自 `main` 分支根目錄）。
- **網址**: [https://yin0612.github.io/for_SoftWorld/](https://yin0612.github.io/for_SoftWorld/)

## 🔎 已驗證真實新聞監測

`#/news` 是與既有視覺化展示資料分離的真實監測頁。它只會顯示「官方 RSS 或 Google News RSS 聚合、近兩個月、命中『智冠 2025 年監測關鍵字清單』、附原文跳轉連結」的文章；服務不可用時會明確顯示不可驗證狀態，絕不以展示資料替代。Google News 聚合卡片會明確標記，不能視為媒體官方 RSS。

- `config/monitoring_rules.json`：監測文件完整的 6 個資料夾、20 組規則與關鍵字別名；台灣支付新增核心新聞與主管機關／支付基礎建設規則，A+B 條件以兩組皆命中實作，並套用「大宇紡織」排除詞；穩定幣另有高精準規則，奧丁丁／OwlPay 需搭配穩定幣或金融科技語境並列為優先。
- `config/media_catalog.json`：監測文件與補充專業來源的媒體候選清單。它是覆蓋範圍清單，不代表所有媒體都已自動擷取。
- `config/core_media_sources.json`：目前實測可用、近期仍更新且獲准自動收錄的官方／專業 RSS 白名單，包含 18 個台灣來源（含聯卡中心多頻道、卡優與自由）。其他媒體保留為 `manual_or_authorized`，必須先完成 RSS/API、條款或授權檢查。
- `config/fintech_media_sources.json`：由 `金融科技&穩定幣監測/關鍵字清單.xlsx` 與 `監測關鍵字及媒體.docx` 整理的金融科技媒體白名單。鉅亨、東森財經、工商時報、MoneyDJ、今周刊等無穩定官方 RSS 時，使用官方網域 Google News RSS 補位；不鏡像全文、不寫入 D1，且保留來源類型與原文跳轉連結。
- `scripts/update_fintech_aggregated.py` 與 `.github/workflows/update_fintech_aggregated.yml`：每 6 小時從白名單媒體的 Google News RSS 產生 `data/fintech-aggregated.json` 公開快照，並額外於台北時間 12:00、17:00 更新；Worker 讀取快照以避開 Google 對 Cloudflare 網路的節流，失敗來源會記錄在 `errors` 而不產生虛構文章。
- `scripts/update_rss_snapshot.mjs` 與 `.github/workflows/update_rss_snapshot.yml`：每小時第 23 分由 GitHub Actions 收集啟用的官方 RSS，使用與 Worker 相同的解析器、來源驗證、日期與規則引擎，產生 `data/rss-snapshot.json` 備援。原文 URL 去重，已拒絕文章不會重新公開；收集全部失敗時保留前一份快照並讓工作失敗。
- `worker/schema.sql`：媒體、規則、媒體清單、文章、命中證據、審核與收集執行紀錄。
- `worker/README.md`：D1 migration、部署、收集與資料品質政策。

為降低泛用詞誤報，只有高精準的品牌、台灣支付核心、主管機關／支付基礎建設、產品/IP 與國際金融科技規則會自動公開；原始支付生態寬鬆規則與易歧義別名則完整保留為待覆核資料。

## 自動更新與品質檢查

八個分頁共用同一份資料，每 5 分鐘同步；回到頁面、恢復網路或按「同步最新資料」時也會檢查更新。同步失敗保留上次成功資料並顯示警示，不會顯示成功狀態。日期範圍以台北時間的近兩個月計算，API 與前端都拒絕未來日期。

RSS 主收集每小時第 17 分及台北 12:00、17:00 執行，另有每小時第 23 分的 RSS 備援。Google News 每 6 小時及台北 12:00、17:00 更新。GitHub 排程可能排隊；RSS 超過 2 小時、Google 快照超過 8 小時或部分來源失敗時，網站會顯示待確認。來源覆蓋查核報告直接讀取 GitHub 原始檔，避免機器人提交不觸發 Pages 建置而停留在舊報告。

`.github/workflows/auto_update_data.yml` 在相關程式變更及每天台北 08:23 執行單元測試與線上完整資料檢查；檢查重複 URL、未來日期、分頁完整性、必填欄位、來源與快照新鮮度。異常使工作失敗，報告保留在 Actions 的 `site-data-health` artifact。這取代原本只印出成功、未更新資料的腳本。可用 GitHub Actions 既有通知接收失敗通知。

關鍵字命中、日期與來源驗證是資料品質檢查，無法代替逐則報導的事實查核。公司主檔仍需定期人工核對。詳細改善項目見 [全站資料更新查核報告](docs/site-data-audit-2026-10-01.md)。

## 金融科技與穩定幣監測

#/fintech 將台灣支付與藍新科技、國際金融科技、穩定幣與鏈上結算規則集中在一頁，預設優先顯示台灣支付。它可依主題、來源類型（官方 RSS／Google News 聚合）與文字條件篩選，並保留每則新聞的命中證據與原文連結。穩定幣採獨立高精準規則；奧丁丁／OwlPay 命中穩定幣語境時會優先置頂並顯示徽章；來源文件中的「虛擬貨幣／加密貨幣／區塊鏈」仍維持原本的 A+B 情境條件，不會被直接誤歸為穩定幣。

完整規劃與來源比對請見 [金融科技與穩定幣監測企畫書](docs/fintech-stablecoin-monitoring-plan.md)。

## 遊戲產業監測

`#/gaming` 重用全站已載入的已驗證新聞資料，不會額外發送遊戲專用的 RSS 或 Worker 請求。頁面採用五組可明確對應遊戲內容的規則：智冠集團與旗下遊戲／IP、台灣與國際遊戲競業、高營收手遊與重點手遊、遊戲平台／主機／電競，以及中國遊戲版號與審批；保留命中詞、來源類型與原文連結，並可依分類、來源或文字篩選。手遊項目僅以直接遊戲名稱或明確別名判定，不展示排名、合作狀態或內部標記。為避免雜訊，泛商業、支付、金融科技、發票、行銷，以及目前會命中加密貨幣內容的寬鬆市場規則均不會列入。

中國版號使用 `industry-cn-game-approval` 的繁簡雙群組條件：版號／遊戲審批加上遊戲、公司或作品語境。涵蓋國產、進口與審批變更；獲批不代表已上線。Google News 的 `game_approval` 專用查詢採中文簡體索引，既有台灣及其他主題查詢維持原設定。新增 IT之家（`ithome.com`，與台灣 iThome 不同）的官方 RSS，以及 IT之家、遊戲陀螺、遊民星空、國家新聞出版署的網域限定聚合來源；原有 17173 等中港來源也增加版號查詢。官方公告入口在遊戲頁說明中保留，聚合查詢無結果時不補造文章。現有 D1 以 `worker/migrations/0007_cn_game_approval.sql` 增量更新；新部署仍由設定 seed 建立。
