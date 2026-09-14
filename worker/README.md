# 真實新聞監測 Worker

此資料夾提供第一版 Cloudflare Worker + D1 的新聞監測管線。公開前端維持 GitHub Pages；Worker 只提供已審核文章與來源健康資料。

## 部署前準備

1. 在 Cloudflare 建立 D1 資料庫 `softworld-monitoring`。
2. 將資料庫 ID 寫入 `wrangler.jsonc` 的 `database_id`，並依實際 Worker 網址更新 `CORS_ORIGIN`。
3. 在此資料夾執行：

```bash
npx wrangler d1 execute softworld-monitoring --remote --file=./schema.sql
```

4. 產生並匯入版本化的設定資料：

```bash
python worker/scripts/build_seed_sql.py > worker/seed.sql
npx wrangler d1 execute softworld-monitoring --remote --file=./seed.sql
```

第一版刻意將所有來源設為 `enabled: false`；逐一確認 RSS/API 授權、robots 與條款後，才可啟用。
5. 執行 `npx wrangler deploy`，再將 Worker URL 設至 `js/monitoring.js` 的 `window.MONITORING_API_BASE`。

## API

* `GET /api/articles?limit=30&folder=folder_1&status=approved`：已審核文章。
* `GET /api/health`：來源健康摘要。

排程每小時第 17 分鐘執行一次。它只擷取 D1 中 `enabled=1`、`access_mode='rss'` 且具有 `feed_url` 的來源；寫入為冪等，並保留收集執行紀錄。

## 安全與資料品質

* Worker 不提供公開寫入端點；匯入、來源啟用與文章審核應透過受保護的管理流程處理。
* 不鏡像未取得授權的全文。最小保存欄位是原始 URL、標題、摘要、發布／擷取時間與規則命中證據。
* 文章在 `approved` 前不會出現在公開前端，避免寬鬆關鍵字帶來的誤收錄。
