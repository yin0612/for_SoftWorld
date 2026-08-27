# 台灣遊戲產業媒體曝光與公關分析平台 (Gaming Media Intelligence) — 完整建置與營運計劃書

本計劃旨在為**台灣八大遊戲上市櫃企業**建立一套兼具「日系清新美觀 (Japanese Light & Fresh)」與「大數據監測」的公開新聞稿與媒體曝光動態分析平台。

---

## 🎯 一、專案核心目標與特色亮點

1. **視覺美學與品質**：
   - 採用**日系清新莫蘭迪風格 (Morandi Soft Tones)**，結合純白卡片、深邃森林綠高對比按鈕 (`#2d5a3f`) 與流暢微動畫，提供高品質觀察體驗。
   - 保留大氣 Hero 區塊與單頁平滑滾動（Smooth Scroll）目錄，確保排版穩定不跑版。

2. **追蹤四大核心指標 (4 Core Metrics)**：
   - 📰 **新聞稿數量 (Press Release Count)**：追蹤官方公關發布動能。
   - 🗞️ **媒體報導篇數 (Media Coverage Count)**：監測產經、財經與各大遊戲新聞媒體聲量。
   - 💬 **社群網路聲量 (Social Mentions Volume)**：反應討論區、玩家論壇與社群提及度。
   - 🤝 **KOL 實況主合作數 (KOL Collaborations)**：評估網紅開箱與行銷推廣檔期。

3. **官方新聞來源與 MOPS 快捷跳轉**：
   - 每一家公司卡片與彈窗均整合專屬「📰 官方新聞專區」與「🏛️ MOPS 公開資訊觀測站」一鍵跳轉按鈕。

4. **GitHub Actions 免費定時自動更新系統**：
   - 使用 GitHub 免費 Actions 服務，定期執行 Python 腳本 (`scripts/update_data.py`)，自動推進與更新 32 個月四大指標數值與最新新聞動態。

---

## 🏢 二、八大目標企業與新聞來源對照表

| 企業名稱 | 股票代碼 | 官方新聞來源 / 觀測管道 | 核心代表作品 / 特質 |
| :--- | :--- | :--- | :--- |
| **智冠科技** | TPEx 5478 | [智冠新聞專區](https://www.soft-world.com/News) | MyCard點數平台、藍新金流、《金庸群俠傳Online》 |
| **大宇資訊** | TPEx 6111 | [大宇最新消息](https://km.softstar.com.tw/list.aspx?cid=2) | 《女鬼橋》系列、《咒》、更名光聚晶電轉型控股 |
| **橘子集團** | TPEx 6180 | [橘子新聞中心](https://www.gamania.com/news) | 《天堂M》、《新楓之谷》、《波拉西亞戰記》、Vyin AI |
| **網銀國際** | 未上市 | [網銀最新消息](http://wanin.tw/News/) | 《星城》、游e卡、閃電狼電競隊、入主威秀影城 |
| **華義國際** | TPEx 3086 | [MOPS 公開資訊觀測站](https://mops.twse.com.tw/mops/#/web/home) | 遊戲大亂鬥社群、BanaBana、印度手遊合資 |
| **宇峻奧汀** | TPEx 3546 | [宇峻新聞專區](https://www.userjoy.com.tw/news/news_01.aspx) | 《三國群英傳》系列、《FFXIV》繁中版代理 |
| **傳奇網路** | TWSE 4994 | [傳奇官方新聞](https://www.x-legend.tw/02news/news_1.php#/nl/undefined/undefined) | 《精靈樂章：ORIGIN》、《幻想神域》、《咻咻史萊姆》 |
| **泰偉電子** | TPEx 3064 | [MOPS 公開資訊觀測站](https://mops.twse.com.tw/mops/#/web/home) | 商用博弈機台、叫號叫我智慧醫療系統 |

---

## 📐 三、網站五大導覽模組規劃

### 1. 🏢 公司總覽 (`#companies`)
- **8 大企業品牌卡片**：展現股票代碼、成立年數、代表作品標籤與 2024-2026 最新重大動態。
- **直覺按鈕**：包含「官網 ↗」、「📰 官方新聞 ↗ / 🏛️ MOPS觀測站 ↗」與「完整剖析」彈窗按鈕。

### 2. 📰 新聞稿中心 (`#news`)
- **公關時間軸動態流**：支援公司多選 Toggle、新聞類別下拉選單、起始/結束日期區間與關鍵字即時搜尋。
- **顯示優化**：修復卡片動態渲染顯現機制，確保條件篩選後時間軸卡片 100% 清晰呈現在兩側。

### 3. 📈 數據分析 (`#analytics`)
- **4 大指標圖表**：
  - 月度媒體報導曝光量趨勢折線圖 (Line Chart)。
  - 媒體曝光通路比例圓餅圖 (Doughnut Chart)。
  - KOL 實況主合作宣傳排行榜 (Bar Chart)。
  - 官方公關發稿總篇數排行榜 (Bar Chart)。
- **💡 數據觀測洞察**：即時分析遊戲大作發行與公司股權/經營權重大事件對媒體聲量之影響。

### 4. ⚔️ 競品 PK 對比 (`#compare`)
- 勾選 2 至 8 家目標企業，即時繪製五維多角雷達圖（新聞稿數、媒體報導、社群聲量、KOL 合作、聲量成長率）與綜合比對資料表。

### 5. 💡 趨勢分析 (`#trends`)
- **4 大產業轉型焦點**：AI 轉型、經營權與泛娛樂資本、全球化授權、經典 IP 重塑。
- **2024–2026 重大產業歷史事件時間軸**：收錄網銀收購威秀、智冠改選換股、大宇售雙劍 IP、宇峻代理 FFXIV、星城品牌煥新與智冠二代接班。

---

## 🤖 四、GitHub Actions 免費定時自動更新機制

- **Python 數據更新腳本**：`scripts/update_data.py`
- **GitHub Workflow 設定檔**：`.github/workflows/auto_update_data.yml`
- **運行模式**：每週一台北時間 08:00 免費自動執行，更新 `js/data.js` 數據並自動 Commit & Push，觸發 GitHub Pages 發布最新網頁。

---

## 🛡️ 五、專案行為準則與開發鐵則

記錄於 `.agents/rules/user-preferences.md`：
1. **微創修改原則 (Surgical Edits)**：在任何更新中，**絕不覆蓋、重寫或破壞**原有已設計好的 HTML 頁面架構與 CSS 排版樣式。
2. **數據精準度**：所有資料更新須符合台灣遊戲產業真實歷史與發展脈絡。

---

## 🌐 六、專案發布資訊
- **GitHub 儲存庫**: https://github.com/yin0612/for_SoftWorld
- **線上網址**: https://yin0612.github.io/for_SoftWorld/
