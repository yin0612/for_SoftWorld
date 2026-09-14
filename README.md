# 台灣遊戲公司新聞稿與媒體曝光比較平台

## 📌 專案簡介
本專案為台灣八大指標遊戲企業（智冠科技、大宇資訊/光聚晶電、橘子集團、網銀國際、華義國際、宇峻奧汀、傳奇網路、泰偉電子）之公關新聞稿發布、媒體報導曝光、社群聲量與 KOL 合作之比較與視覺化分析平台。

## ⚠️ 資料說明與規範
- **公司主檔與重大動態**：整理自 TWSE/TPEx 公開資訊觀測站 (MOPS) 與各公司官方新聞專區。
- **媒體曝光與聲量數據**：依據 `COMPANY_PROFILES` 參數與公司發稿權重生成，呈現月度趨勢、通路分佈與比對雷達圖。
- **下鑽溯源 (Data Provenance)**：點擊數據分析頁面之曝光趨勢圖資料點，可彈出原始新聞來源清單與可點擊連結。

## 🚀 本機開發與預覽
```bash
# 於專案根目錄啟動本機伺服器
python3 -m http.server 8765

# 瀏覽器開啟預覽
http://127.0.0.1:8765/
```

## 📁 專案檔案結構
- `index.html` — 主網頁 HTML 結構與五大獨立區塊
- `css/` — 核心樣式表 (index.css, components.css, animations.css)
- `js/data.js` — 8 大公司主檔、媒體與指標數據集
- `js/charts.js` — 數據分析圖表模組 (Chart.js v4)
- `js/compare.js` — 企業 PK 多維度雷達圖與比對工具
- `js/app.js` — SPA Hash 切頁路由器 (`#/companies`, `#/news`, `#/analytics`, `#/compare`, `#/trends`) 與 UI 邏輯
- `config/` — `companies.yml` 公司主檔與 `sources.yml` 觀測媒體清單

## 🌐 部署
平台部署於 GitHub Pages（源自 `main` 分支根目錄）。
- **網址**: [https://yin0612.github.io/for_SoftWorld/](https://yin0612.github.io/for_SoftWorld/)

## 🔎 已驗證真實新聞監測

`#/news` 是與既有視覺化展示資料分離的真實監測頁。它只會顯示「已驗證公開 RSS、近兩個月、命中 Word 規則、附原文連結」的文章；服務不可用時會明確顯示不可驗證狀態，絕不以展示資料替代。

- `config/monitoring_rules.json`：Word 文件完整的 5 個資料夾、15 組規則與關鍵字別名；A+B 條件以兩組皆命中實作，並套用「大宇紡織」排除詞。
- `config/media_catalog.json`：Word 文件的完整 171 家媒體候選清單（148 家在地、23 家國際金融科技媒體）。它是覆蓋範圍清單，不代表所有媒體都已自動擷取。
- `config/core_media_sources.json`：目前實測可用且獲准自動收錄的官方 RSS 白名單。其他媒體保留為 `manual_or_authorized`，必須先完成 RSS/API、條款或授權檢查。
- `worker/schema.sql`：媒體、規則、媒體清單、文章、命中證據、審核與收集執行紀錄。
- `worker/README.md`：D1 migration、部署、收集與資料品質政策。

為降低泛用詞誤報，只有高精準的品牌、產品/IP 與國際金融科技規則會自動公開；支付生態、競業與產業寬鬆規則仍會保留為待覆核資料，而不會出現在公開新聞頁。
