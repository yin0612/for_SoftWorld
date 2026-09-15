# 真實新聞監測 Worker

此 Worker 將公開 RSS 條目的標題、摘要與媒體在 RSS 中提供的內容（不擷取原新聞網站頁面）套用監測文件規則，保存原文連結與命中證據。GitHub Pages 的 `#/news` 與 `#/fintech` 只讀取可公開的已驗證結果。

## 資料品質政策

- 收集和公開 API 都硬性限制在台北時間「今天往前兩個月」。無發布日期或超出區間的 RSS 項目不會入庫。
- 媒體來源必須同時是 `enabled=1`、`auto_publish=1`、`access_mode='rss'`，才會收集並自動公開。
- 每個來源每次最多處理 RSS 提供的前 200 個條目，避免剛啟用且保留大量歷史項目的來源壓垮資料庫；後續排程會持續補入新條目。
- 規則也有獨立的 `auto_publish` 與精準詞保護。只有 `monitoring_rules.json` 中列出的高精準規則，且命中指定的高信心別名，才會自動公開；較寬鬆或易歧義的詞仍會以 `pending` 儲存，避免泛用詞誤報。穩定幣採獨立詞組，不會把泛稱加密貨幣直接當成穩定幣。
- 公開 API 固定只回傳 `articles.review_status='approved'` 且 `article_matches.status='approved'` 的資料，忽略外部傳入的 `status` 參數。
- 不鏡像未取得授權的全文。資料庫僅保存原始 URL、標題、RSS 摘要、發布／擷取時間與規則命中證據。

## 初始部署或更新

1. 在 `wrangler.jsonc` 設定 D1 資料庫 ID 與 GitHub Pages 的 `CORS_ORIGIN`。
2. 若 D1 是舊版資料庫，先各執行一次 migration；全新資料庫不需要這兩步：

```bash
npx wrangler d1 execute softworld-monitoring --remote --file=./migrations/0001_add_auto_publish.sql
npx wrangler d1 execute softworld-monitoring --remote --file=./migrations/0002_add_rule_auto_publish.sql
npx wrangler d1 execute softworld-monitoring --remote --file=./migrations/0003_add_rule_auto_publish_terms.sql
```

3. 建立新表、產生設定 seed，並匯入：

```bash
npx wrangler d1 execute softworld-monitoring --remote --file=./schema.sql
python -X utf8 ./scripts/build_seed_sql.py > ./seed.sql
npx wrangler d1 execute softworld-monitoring --remote --file=./seed.sql
```

在 Windows PowerShell 執行時務必保留 `-X utf8`，避免中文關鍵字被舊版主控台編碼轉成亂碼。

4. 設定僅供管理者立即收集用的 secret，然後部署：

```bash
npx wrangler secret put MONITORING_ADMIN_TOKEN
npx wrangler deploy
```

## API

- `GET /api/articles?limit=30&folder=folder_1`：只回傳可公開的已驗證文章；日期參數一律限制近兩個月。
- `GET /api/status`：規則版本、來源健康、已公開／待覆核數量與監測媒體清單覆蓋狀態；前端會將最後成功更新時間顯示在全站狀態列。
- `GET /api/health`：來源健康摘要。
- `POST /api/internal/collect`：須附帶 `Authorization: Bearer <MONITORING_ADMIN_TOKEN>`；用於立即執行收集，不對公開前端開放。

排程每小時第 17 分鐘執行一次，寫入為冪等，並保留每次收集紀錄。
