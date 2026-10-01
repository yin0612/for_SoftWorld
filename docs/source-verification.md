# RSS 與 Google News 自動來源驗證

2026-10-01：啟用兩種管線的來源網域核對及定期檢查報告。

- RSS：Worker 每小時第 17 分鐘蒐集，台北 12:00、17:00 加跑。文章原文 URL 必須符合來源設定網域，歷史資料在公開 API 也重新核對。自由時報核准範圍改為 ltn.com.tw，涵蓋財經 ec.ltn.com.tw。
- Google News：現有 GitHub Actions 每 6 小時及台北 12:00、17:00 蒐集，逐則核對 RSS 的 source URL 與核准出版者網域。搜尋 site 條件不能取代逐則核對；不符來源與非 Google 跳轉 URL 不公開。
- scripts/verify_sources.py：同一排程檢查啟用 RSS 與 Google 來源，輸出 data/source-verification.json。每個來源最多檢查 200 則；Google 每個來源抽查一組主題，完整蒐集仍按設定執行多主題。網站分析頁可展開檢查結果與異常原因。
- 企業媒體覆蓋：已設定的媒體按網域統一名稱，中央社、經濟日報、聯卡中心等不同 RSS 頻道不重複算成多家；Google 與 RSS 保留來源類型。

檢查「通過」表示當次 feed 可讀取、抽查標題／日期及來源網域符合設定，不代表新聞內容已查證或原文頁仍可開啟。日期缺時區會標示待確認，不把它當成來源網域錯誤。Google 無結果不等於來源失效。聯卡中心活動可能連到外部銀行，保留檢查告警，但這類外部連結不計為聯卡中心原站報導。

來源正確性驗證以核准設定為依據，新增媒體仍需維護白名單。沒有擷取全文，也未驗證文章敘述、轉載授權或原始作者。跨 Google 與 RSS 的不同 URL 仍可能指向同一新聞。

驗證指令：python scripts/test_source_verification.py；node --test worker/src/source-verification.test.mjs。
