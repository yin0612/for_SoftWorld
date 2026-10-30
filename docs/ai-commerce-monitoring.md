# AI 商務與生活服務監測

2026-10-30 新增 `industry-ai-commerce`，歸入「產業新聞」。在 RSS 標題或首段摘要的同一段內，AI 技術詞與商務／生活服務詞各命中至少一詞即自動收錄。Google News 聚合只比對標題。完整關鍵字以 `config/monitoring_rules.json` 為準。

涵蓋 AI Agent、代理式 AI、智慧助理結合購物、導購、電商、商家、官方帳號、客服、比價、訂位、訂餐、送禮與支付。一般購物促銷或單純 AI 晶片新聞不會因這條規則收錄。

XFastest 與既有台灣補位媒體增加 `ai_commerce` 專用 Google News RSS 查詢，使用「AI 詞組 AND 商務服務詞組」及既有來源網域限制。保留來源驗證、日期限制、去重與聚合來源標示，不抓取全文。Google 索引與 RSS 供稿範圍仍會影響實際取得的文章。

參考案例：[LINE 各項服務將融合更多 AI Agent](https://news.xfastest.com/168432/line-各項服務將融合更多-ai-agent-為個人、商家及線上購物/)。標題同時包含 `AI`／`AI Agent` 與 `商家`／`購物`，可命中新規則。

發布時須同步更新 Worker（內嵌規則），既有 D1 執行 `worker/migrations/0009_ai_commerce.sql`；新資料庫沿用 seed。GitHub 排程於更新程式後產生新聚合資料與 RSS 備援。不可把本機測試通過視為正式網站已更新。
