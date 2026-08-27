# 專案保護規範與自動化準則 (User Preferences & Strict Locks)

1. **現有架構與數據永久鎖定 (Strict Structural & Data Lock)**：
   - 目前的「日系清新全頁面架構」（包含固定導覽列、Hero 首頁粒子、8大公司卡片、新聞時間軸、四大指標視覺化圖表、競品 PK 對比、產業趨勢與 Footer）已完全修復並通過驗證。
   - 未來任何內容更新或功能調整，**絕對不得變動、覆蓋或破壞現有的 HTML/CSS 佈局與現有的數據結構**。
   - 所有更動一律遵守「微創原則 (Surgical Edits)」，僅在既有框架內進行資料增量補強。

2. **自動定時數據推送 (Automated Scheduled Push)**：
   - 透過 Python 定時腳本 `scripts/update_data.py` 與 GitHub Actions / Cloudflare 混合排程，定期自動推進最新月份的媒體聲量數據與公關新聞動態，並自動 commit/push 至 GitHub 主分支發布。
