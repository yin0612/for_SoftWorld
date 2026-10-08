# RSS 關鍵字誤收修正（2026-10-08）

10/6 新增 IT之家整站 RSS 後，汽車、手機等文章命中既有行銷及平台規則。
XML 跳脫的 HTML 在去除標籤後才解碼，讓 `text-align` 等排版碼留在摘要；
英文詞採任意子字串比對，造成 IG 命中 align、LINE 命中 inline、IPO 命中 iPod。

共用解析器先解碼 HTML 實體，再去除標籤、屬性、script/style；規則引擎也清理
歷史 RSS 內容。英數單詞使用英數字邊界，保留中文旁的 MyCard、LINE 及全形別名。
IT之家 RSS 只允許集團、遊戲、競業與版號規則，不套用一般平台、行銷規則。

公開 API 對 D1 與 RSS 備援重新檢查原先已核准的規則，重算命中證據與分類，
無有效命中則不公開。備援排程也重新檢查歷史快照，避免誤收文章再次出現。
Google News 原有標題分類、台灣支付專用規則與中港澳來源保持原流程。
快取按政策版本隔離，部署後不會讀到前一版本的 API 快取。

清理前以 Wrangler 匯出近兩個月 approved match 作為稽核備份，再執行
`node scripts/revalidate_rss_data.mjs <D1-json> <correction.sql>` 產生修正 SQL。
只把無效的系統核准命中移回 pending，保留文章、原始證據及人工決定；
仍有其他 approved match 的文章保持公開。`node scripts/revalidate_rss_data.mjs`
清理 RSS 快照，保留原始 generated_at，避免把歷史補正標成剛完成收集。
版本 migration 使用 `worker/migrations/0008_rss_precision.sql`。

回歸測試涵蓋 HTML 跳脫、實際誤判、英文邊界、來源範圍、舊快照、版號與
人工覆核保護。部署後需核對所有 API 分頁及例示錯誤 URL，確認版號仍可見。
