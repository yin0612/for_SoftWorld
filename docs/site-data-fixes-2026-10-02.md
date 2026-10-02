# 自動更新異常修正與驗證

修正與查核時間：2026-10-02 台北 09:45–09:49。範圍涵蓋網站共用資料 API、RSS 主收集、GitHub RSS 備援及正式站品質工作。

## 已完成修正

- **主收集來源隔離。** 原本 29 個來源共用一次執行，部分大型 RSS 長期留下 `running` 紀錄。現由受保護的 Worker 服務綁定分派獨立來源任務，最多四個並行，逐一保存結果並等待所有任務完成。單一來源失敗會記錄錯誤，其他來源繼續收集。
- **收集紀錄修正。** 完成時間改為實際結束時間；超過 30 分鐘未完成的歷史紀錄標示失敗，避免永遠顯示執行中。RSS 回應即使為 HTTP 200，也必須具有 RSS／Atom 格式，HTML 阻擋頁不會被標示成功。
- **減少資料庫查詢。** 文章狀態以 SQL 子查詢確認核准命中，省去逐篇額外的核准筆數查詢；保留人工拒絕狀態。
- **ABMedia 備援修復。** 改用正式 RSS 位址 `https://abmedia.io/feed`。GitHub 網路仍直接回傳 403 時，改經現有 Worker 取得相同官方 RSS。轉接僅允許配置中的 ABMedia，不能指定任意 URL；快取五分鐘。備援仍使用相同的來源網域、日期與發布規則驗證，並記錄 `transport: worker-relay` 及原始 `direct_error`。

## 實際驗證

| 驗證項目 | 結果 |
| --- | --- |
| Node 回歸測試 | 25 項通過，包含來源隔離、授權、RSS 格式、轉接限制、等待全部完成與時間紀錄 |
| Python 回歸測試 | 6 項通過 |
| 主收集實跑 | 29 個來源都有結束紀錄，28 成功、1 次自由時報 HTTP 403；原本卡住的六個來源全部成功 |
| 原本卡住的來源 | CryptoPotato、Payments Journal、4Gamers、巴哈姆特 GNN、科技報橘、遊戲基地均有本次成功時間 |
| GitHub RSS 備援 | 台北 09:45:22 快照，29/29 個來源成功，零收集錯誤；ABMedia 透過轉接成功 |
| 正式網站品質檢查 | 台北 09:45:57 檢查 1,853 篇，`passed`，零錯誤、零來源覆蓋警告、無未讀分頁 |
| GitHub 正式品質工作 | 成功 |
| GitHub Pages 部署 | 成功 |

上述篇數為當時已收錄的有效文章，會隨更新變動。主收集當次自由時報 403 由該來源成功的 RSS 備援提供更新覆蓋；主來源錯誤仍保留，不會偽裝為直接收集成功。備援每小時執行，GitHub 排程仍可能延遲。

驗證連結：[RSS 備援工作](https://github.com/yin0612/for_SoftWorld/actions/runs/36952428385)、[正式品質工作](https://github.com/yin0612/for_SoftWorld/actions/runs/36952393679)、[Pages 部署](https://github.com/yin0612/for_SoftWorld/actions/runs/36952452892)。Worker 正式部署版本：`31789e7e-0989-4f79-b734-3d36c33f448f`。

## 後續改善

1. 補上暫時性網路錯誤的有限重試與來源耗時統計；若兩條收集路徑都失敗，再提高告警層級。
2. 在管理者指定通知管道後，加入連續異常告警。現有 Actions 品質失敗與網站警示已保留。
3. 延續每週文章分類抽查及每月公司主檔核對，保存查核日期與覆核原因。自動收集與來源驗證不能替代新聞主張的人工事實查核。
4. 來源數增加時調整任務分批架構。[服務綁定單次請求最多 32 次 Worker 呼叫](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)；目前主收集加 29 個來源為 30 次呼叫。資料庫用量也應持續參照 [D1 限制](https://developers.cloudflare.com/d1/platform/limits/)。
