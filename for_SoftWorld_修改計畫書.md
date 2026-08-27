# for_SoftWorld 網站修改計畫書

| 項目 | 內容 |
|---|---|
| 專案 | `yin0612/for_SoftWorld` |
| 線上位址 | https://yin0612.github.io/for_SoftWorld/ |
| 對應版本 | commit `dc3fef8`（本文件所有行號以此版本為準） |
| 撰寫日期 | 2026-08-27 |
| 檢查範圍 | 全 repo 34 個檔案；其中線上實際載入的是 10 個（HTML×1、CSS×3、JS×6，約 154 KB） |
| 發現問題 | 20 項（P0×3、P1×5、P2×8、P3×4） |

---

## 0. 這份文件怎麼用

每一項問題都用同一個格式寫：

- **位置** — 檔案與行號（以 commit `dc3fef8` 為準）
- **現況** — 現在的程式碼長什麼樣
- **為什麼要改** — 造成什麼實際後果，附實測證據
- **怎麼改** — 改前 / 改後的完整程式碼
- **驗收** — 改完之後怎麼確認真的好了

優先級的意思：

| 等級 | 意義 | 建議時機 |
|---|---|---|
| **P0** | 畫面壞掉，使用者一定會遇到 | 立刻 |
| **P1** | 畫面正常但數字不可信，會影響論文／簡報說服力 | 口試或交件前必做 |
| **P2** | 不影響畫面，但會讓每次修改變慢、容易改錯地方 | 有空就做 |
| **P3** | 細節與品質 | 最後 |

> **重要：行號會位移。** 只要你刪掉或插入了行，後面所有行號都會跟著跑。建議兩種作法擇一：
> 1. **由後往前改**（同一個檔案裡先改行號大的），行號就不會亂；
> 2. 不要盯著行號，改用**搜尋文件裡列出的「現況」程式碼字串**來定位。

---

## 1. 一句話結論

「數據分析」和「對比工具」沒有畫面，**不是 CSS、不是 Chart.js、不是 GitHub Pages 的問題**，而是 `js/charts.js`、`js/compare.js`、`js/timeline.js` 這三支檔案各有一個語法錯誤。瀏覽器碰到 `SyntaxError` 會**整支檔案放棄執行**，所以裡面的函式一個都沒被定義，而 `app.js` 裡的防呆判斷又把錯誤靜靜吞掉，畫面就停在空白。

修好這三個語法錯誤，兩個頁面就會回來（已在本機驗證）。但修好之後你會看到**第二層問題**：圖表畫出來了，顏色卻全是灰藍色、圓餅圖每次重新整理數字都不一樣、新聞稿日期和事實對不上。那是 P1 的部分。

---

## 2. 部署真相與檔案地圖（先看這段，否則你會改錯檔案）

這個 repo 裡**同一份程式碼存在三份副本**，而且三份的內容不一樣：

```
for_SoftWorld/
├── index.html          ← GitHub Pages 實際服務的頁面
├── js/                 ← ★ 線上實際載入的就是這一份 ★
│   ├── data.js
│   ├── animations.js
│   ├── charts.js       ← 有語法錯誤
│   ├── timeline.js     ← 有語法錯誤
│   ├── compare.js      ← 有語法錯誤
│   └── app.js
├── css/
├── docs/
│   ├── index.html      ← 沒有被服務
│   ├── js/*.js         ← 舊的「深色主題」版本，語法正常
│   └── *.js            ← 另一份副本，帶著和 js/ 一模一樣的三個語法錯誤
├── config/             ← companies.yml、sources.yml（目前程式碼完全沒讀）
├── scripts/update_data.py
├── .github/workflows/auto_update_data.yml
├── implementation_plan.md
└── implementation_plan_v3_final.md
```

**怎麼確認 Pages 服務的是 root 而不是 `docs/`：** 線上載入的 `charts.js` 內容和 root 的 `js/charts.js` 逐字相同（含那個語法錯誤），而 `docs/js/charts.js` 是語法正常的舊版。若 Pages 來源設成 `/docs`，線上就會載到那份正常的舊版、畫面也不會壞。

**所以：所有修改都改 root 的 `js/`、`css/`、`index.html`。`docs/` 是待清理的殘骸（見 F-09）。**

---

## 3. 問題總表

| 編號 | 級別 | 檔案 | 行號 | 問題 |
|---|---|---|---|---|
| F-01 | P0 | `js/charts.js` | 238–241 | 重複貼上的殘骸切斷物件字面值 |
| F-02 | P0 | `js/compare.js` | 331–367 | 舊版表格殘留在函式外 |
| F-03 | P0 | `js/timeline.js` | 全檔 | 反引號跳脫字元沒還原 |
| F-04 | P1 | `js/data.js` 等 | 118 | 品牌色欄位名稱不一致，八家公司顏色全失效 |
| F-05 | P1 | `js/data.js` | 297–315 | 媒體佔比用亂數、多出 NaN 欄位、合計 ≠ 100% |
| F-06 | P1 | `js/data.js` | 200–201 | 新聞稿日期與來源是亂數，與事實矛盾 |
| F-07 | P1 | `js/data.js` | 207–226 | 下鑽溯源 `loadSources()` 實質失效 |
| F-08 | P1 | `scripts/update_data.py` | 全檔 | 每週自動生成虛構新聞並掛真實媒體名 |
| F-09 | P2 | `docs/` | — | 三份不一致的程式碼副本 |
| F-10 | P2 | `js/timeline.js` | 全檔 | 死碼，且內含深色主題行內樣式 |
| F-11 | P2 | `js/charts.js` | 243、306 | 顏色有兩個來源（`brightPalette`） |
| F-12 | P2 | 專案根目錄 | — | 沒有 README，卻有兩份過期計畫文件 |
| F-13 | P2 | `js/compare.js` | 20 | 對比工具預設全選 8 家，雷達圖疊成一團 |
| F-14 | P2 | `js/compare.js` | 403–405 | 「下載圖表圖片」是假按鈕，只跳 alert |
| F-15 | P2 | `js/charts.js` | 131 | 公司下拉選單還是深色版行內樣式 |
| F-16 | P2 | `js/app.js` / `charts.js` | 66–84 / 435–443 | 每次切頁全部銷毀重建圖表 |
| F-17 | P3 | `index.html` | 100、104 | Hero 統計數字寫死，會和資料脫節 |
| F-18 | P3 | `index.html` | 23 | Chart.js CDN 無 SRI，載入失敗時無提示 |
| F-19 | P3 | `index.html` / `app.js` | 271 等 | 無障礙：canvas 無替代文字、缺 `aria-expanded` |
| F-20 | P3 | `js/timeline.js` / `data.js` | 161 / 54 | 連結衛生：缺 `rel="noopener"`、http 連結 |

---

# 4. P0：讓畫面回來

> 這三項彼此獨立，改哪一個都不會影響另外兩個的行號。

## F-01 — `js/charts.js` 重複貼上的殘骸

**位置** `js/charts.js` 第 238–241 行，在 `initKolRankChart()` 函式內

**現況**

```js
220  function initKolRankChart(canvasId) {
...
235      // 排序降冪
236      kolData.sort((a, b) => b.total - a.total);
237
238      charts[canvasId] = new Chart(canvas, {   ← 多餘
239          type: 'bar',                          ← 多餘
240      // 排序降冪                                ← 多餘
241      kolData.sort((a, b) => b.total - a.total); ← 多餘
242
243      const brightPalette = {
...
254      charts[canvasId] = new Chart(canvas, {   ← 這才是真正在用的那一個
```

**為什麼要改** 第 238 行開啟了一個物件字面值 `{`，第 240 行卻塞進註解和一般敘述句，JavaScript 解析器在第 241 行的 `.sort` 上炸掉：

```
Uncaught SyntaxError: Unexpected token '.'    charts.js:241
```

`charts.js` 整支不執行 → `initExposureTrendChart`、`initMediaChannelChart`、`initKolRankChart`、`initPressReleaseChart`、`forceResizeAllCharts` 全都不存在 → 「數據分析」四張圖全空白。

**怎麼改** 刪掉 238–241 這四行（含第 237 行後多出來的那個空行也可一併整理）。改完長這樣：

```js
    // 排序降冪
    kolData.sort((a, b) => b.total - a.total);

    const brightPalette = {
        'soft-world': '#e76f51',
        ...
    };

    charts[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: kolData.map(d => d.name),
            ...
```

**驗收** `js/charts.js` 用 `node --check` 通過；瀏覽器 console 不再出現 `Unexpected token '.'`。

---

## F-02 — `js/compare.js` 舊版表格殘留在函式外

**位置** `js/compare.js` 第 331–367 行

**現況** `renderComparisonTable()` 這支函式被改寫成淺色版之後，**舊的深色版表格內容沒有刪乾淨**：

```js
329      container.innerHTML = tableHtml;
330  }                                              ← 新版函式在這裡就結束了
331                  ${statsData.map(d => ...)}     ← 從這裡開始是舊版殘留
332              </tr>
...              （37 行深色主題的表格 HTML，裸露在任何函式之外）
366      container.innerHTML = tableHtml;
367  }                                              ← 舊版的結尾
368
369  /**
370   * 強制重算尺寸並重繪對比工具圖表 ...
```

**為什麼要改** 第 331 行的 `${` 出現在函式外、也不在樣板字串裡，解析器在這裡炸掉：

```
Uncaught SyntaxError: Unexpected token '{'    compare.js:331
```

`compare.js` 整支不執行 → `initCompare`、`updateComparison`、`forceResizeCompareCharts` 都不存在 → 「對比工具」整區空白，`#compareContainer` 停在 56 個字元的佔位內容。

**怎麼改** 刪除第 **331 行到第 367 行**（共 37 行）。判斷邊界的方法：`container.innerHTML = tableHtml;` 在原檔中出現**兩次**（329 與 366），保留第一次、連同第二次那一整段一起刪掉。改完之後 330 行的 `}` 會直接接上原本 368 行的空行與 369 行的註解。

**驗收** `js/compare.js` 語法檢查通過；切到「對比工具」看得到雷達圖、長條圖與比較表格。

---

## F-03 — `js/timeline.js` 跳脫字元沒還原

**位置** `js/timeline.js` 全檔（10 個反引號、18 個 `${`）

**現況**

```js
135  item.className = \`timeline-item \${alignment} hidden-timeline-item\`;
136  item.style.cssText = \`
137      position: relative;
```

反引號被寫成 `\``、`${` 被寫成 `\${`。這是用 shell heredoc 或某些自動化工具寫檔時留下的跳脫殘留 —— 在 JavaScript 裡 `\` 出現在字串外面是非法字元。

**為什麼要改**

```
Uncaught SyntaxError: Invalid or unexpected token    timeline.js:135
```

目前這支檔案**沒有任何地方呼叫**（新聞稿中心是由 `app.js` 的 `renderNews()` 畫的），所以只會在 console 噴一行紅字，不影響畫面。但它會干擾除錯 —— 你以後看到 console 有錯，會分不清是新問題還是這個老毛病。

**怎麼改** 兩個選擇：

- **選項 A（建議，見 F-10）**：既然是死碼，直接刪檔，並移除 `index.html` 第 523 行的 `<script src="js/timeline.js"></script>`。
- **選項 B（保留檔案）**：全檔取代 `\`` → `` ` ``、`\${` → `${`。用文字編輯器的「全部取代」即可，或跑這段 Python：

```python
import io
BS = chr(92)
p = 'js/timeline.js'
s = io.open(p, encoding='utf-8', newline='').read()
s = s.replace(BS + '`', '`').replace(BS + '${', '${')
io.open(p, 'w', encoding='utf-8', newline='').write(s)
```

**驗收** console 完全沒有紅字。

---

## 4.4 P0 的完整操作流程

```bash
# 1. 在本機 clone（如果還沒有）
git clone https://github.com/yin0612/for_SoftWorld.git
cd for_SoftWorld

# 2. 開一個分支，不要直接改 main
git checkout -b fix/syntax-errors

# 3. 依 F-01 / F-02 / F-03 修改三個檔案

# 4. 語法檢查（需要 Node；沒有 Node 就跳到第 5 步用瀏覽器檢查）
for f in js/*.js; do node --check "$f" || echo "FAIL: $f"; done

# 5. 本機預覽
python -m http.server 8765
#    瀏覽器開 http://127.0.0.1:8765/index.html
#    F12 打開 console，確認沒有紅字
#    點「數據分析」→ 四張圖要有內容
#    點「對比工具」→ 雷達圖 + 長條圖 + 表格要出現

# 6. 確認無誤後 commit
git add js/charts.js js/compare.js js/timeline.js
git commit -m "fix: 修正 charts/compare/timeline 三支 JS 的語法錯誤，恢復數據分析與對比工具頁面"
git push -u origin fix/syntax-errors
```

推上去之後在 GitHub 開 PR 合併，或直接推 `main`。Pages 通常 1–2 分鐘後生效，**記得用無痕視窗確認**（一般視窗會拿到瀏覽器快取的舊 JS）。

---

# 5. P1：讓數字站得住腳

> 這五項是修好語法之後才會浮現的第二層問題。做完 P0 之後，先做 F-04（一行就修好、效果最明顯），其餘依序。

## F-04 — 八家公司的品牌色全部失效

**位置** `js/data.js` 第 118 行插入；牽涉 `js/charts.js`、`js/compare.js`、`js/app.js`

**現況** `data.js` 定義公司資料時，顏色欄位叫 **`color`**：

```js
// js/data.js:4 起
const COMPANIES = [
    {
        id: 'soft-world',
        name: '智冠科技',
        ...
        color: '#e63946',          ← 欄位名稱是 color
        ...
    },
    ...
];
```

但 `charts.js`、`compare.js` 讀的是 **`brandColor`**：

```js
// js/charts.js:23
function getBrandColor(companyId) {
    const company = COMPANIES.find(c => c.id === companyId);
    return company ? company.brandColor : '#ffffff';   ← 永遠是 undefined
}

// js/charts.js:44-45
borderColor: company.brandColor,        ← undefined
backgroundColor: company.brandColor,    ← undefined

// js/compare.js:166-167
backgroundColor: d.company.brandColor + '20',   ← 字串 "undefined20"
borderColor: d.company.brandColor,              ← undefined
```

**為什麼要改** 實測證據：

```js
> COMPANIES.filter(c => c.brandColor !== undefined).length
0                      // 八家公司沒有一家有 brandColor
> COMPANIES[0].color
'#e63946'              // 顏色其實一直都在，只是沒人讀它
```

後果：

- 曝光趨勢折線圖八條線全變成 Chart.js 預設灰藍，分不出是哪家公司
- 對比工具雷達圖的填色是非法的 `"undefined20"`
- 比較表格標題色、PK 按鈕背景色全部失效
- 點公司卡片的「完整剖析」彈窗，股票代號徽章背景變成 `undefined15`、公司名稱沒有顏色（`js/app.js:226-227`，這兩處沒有加 `|| company.color` 的保險）

而公司卡片本身有顏色 —— 因為 `app.js` 第 150、167、180、181 行寫的是 `company.brandColor || company.color`。**卡片有色、圖表沒色**，就是這個原因。

**怎麼改** 最小侵入的作法：**不改任何呼叫端，只在 `data.js` 產生完 `COMPANIES` 之後補一次正規化**。

在 `js/data.js` 第 117 行的 `];` 之後、第 120 行的 `const SOURCES` 之前插入：

```js
];                                    // ← 這是原本第 117 行

// ▼ 新增：統一品牌色欄位名稱（charts.js / compare.js 讀的是 brandColor）
COMPANIES.forEach(c => {
    c.brandColor = c.brandColor || c.color;
});

// 觀測媒體來源清單 (包含新增之財經與科技媒體)
const SOURCES = [...];                // ← 這是原本第 120 行
```

這樣做的好處：`color` 欄位保留不動（`app.js` 有地方在用）、所有既有呼叫端一行都不用改、符合專案自訂的「微創原則」。

**（可選，更徹底）** 如果願意做一次性整理，也可以反過來把 `data.js` 的欄位直接改名成 `brandColor`，然後把 `app.js` 的 4 處 `brandColor || color` 簡化。但這會動到 8 筆資料 + 4 處程式碼，風險比上面那三行高，不建議在交件前做。

**驗收** 進「數據分析」，折線圖的八條線顏色各不相同且與公司卡片顏色一致；進「對比工具」，雷達圖每家公司有自己的顏色；點「完整剖析」彈窗標題有顏色。

---

## F-05 — 媒體通路佔比是亂數，還多出一個 NaN 欄位

**位置** `js/data.js` 第 297–315 行

**現況**

```js
297      // 產生媒體分佈比例
298      let remaining = 100;
299      const distribution = {};
300      channels.forEach((channel, index) => {
301          if (index === channels.length - 1) {
302              distribution[channel] = remaining;
303          } else {
304              const pct = Math.floor(Math.random() * (remaining * 0.5));   ← 亂數
305              distribution[channel] = pct;
306              remaining -= pct;
307          }
308      });
309
310      // 稍微調整讓比較知名的媒體比例高一點
311      if (distribution['巴哈姆特'] < 15) {
312          const diff = 15 - distribution['巴哈姆特'];
313          distribution['巴哈姆特'] += diff;
314          distribution['其他'] = Math.max(0, distribution['其他'] - diff);   ← '其他' 不存在
315      }
```

而通路清單（第 277 行）是：

```js
const channels = ['經濟日報', '天下雜誌', '數位時代', '鉅亨網', '巴哈姆特',
                  '4Gamers', 'Yahoo新聞', '聯合新聞網', 'ETtoday', '社群媒體'];
```

**裡面根本沒有「其他」這個項目。**

**為什麼要改** 兩個獨立的 bug 疊在一起。實測同一家公司（智冠）連續兩次載入：

```
第 1 次   [29, 28, 1, 16, 15, 3, 3, 0, 2, 6, NaN]    合計 103%   11 個項目
第 2 次   [20,  7, 26, 17, ...]                       每次都不同
```

- **亂數**：第 304 行讓佔比每次載入都重新擲骰，你截的圖和口試當天螢幕上的圖不會一樣，也沒有任何一份數字是可重現的。
- **NaN**：第 314 行的 `distribution['其他']` 是 `undefined`，`undefined - diff` 得到 `NaN`，於是圓餅圖多出一個叫「其他」、畫不出來的空切片（圖例會顯示但沒有扇形）。
- **合計不是 100%**：第 313 行加了 `diff` 卻沒有從任何地方扣掉（因為要扣的對象不存在），總和被推到 103%。

**怎麼改** 建議直接把佔比寫成固定值。在 `COMPANY_PROFILES`（第 242 行起）每家公司加一個 `channelMix`，然後把 297–315 行整段換掉：

```js
// 第 242 行起，每家公司補上 channelMix（數字加總必須 = 100）
const COMPANY_PROFILES = {
    'soft-world': {
        basePR: 8, baseMedia: 48, baseSocial: 280, baseKol: 4,
        spikes: { '2024-05': 2.2, '2024-06': 2.7, '2026-08': 2.4 },
        channelMix: {
            '經濟日報': 18, '天下雜誌': 6,  '數位時代': 9,  '鉅亨網': 14,
            '巴哈姆特': 16, '4Gamers': 8,  'Yahoo新聞': 9, '聯合新聞網': 7,
            'ETtoday': 6,  '社群媒體': 7
        }
    },
    ...
};
```

```js
// 第 297–315 行整段換成：
    // 媒體通路分佈（固定值，總和 100%）
    MEDIA_CHANNELS[company.id] = { ...(prof.channelMix || {}) };
```

**如果暫時不想一家一家填**，最小修正是保留亂數但至少把 NaN 和合計問題修掉 —— 把第 310–315 行整段刪除即可（總和自然是 100，也不會出現「其他」）。但重新整理數字仍會變，**不建議用在要交件的版本**。

**驗收** 圓餅圖沒有畫不出來的切片、圖例沒有「其他」；重新整理三次，四家不同公司的佔比數字完全相同；把每塊百分比加起來等於 100。

---

## F-06 — 新聞稿日期與來源是亂數，和事實矛盾

**位置** `js/data.js` 第 200–201 行（產生邏輯）、第 140–187 行（`NEWS_TEMPLATES` 資料）

**現況**

```js
189  // 產生所有新聞稿資料
190  COMPANIES.forEach(company => {
191      const templates = NEWS_TEMPLATES[company.id] || [];
192      templates.forEach(t => {
193          PRESS_RELEASES.push({
194              companyId: company.id,
195              companyName: company.name,
196              companyColor: company.color,
197              title: t.t,
198              category: t.c,
199              excerpt: t.e,
200              date: formatDate(getRandomDate()),                        ← 亂數日期
201              source: SOURCES[Math.floor(Math.random() * SOURCES.length)] ← 亂數來源
202          });
203      });
204  });
```

而 `getRandomDate()`（第 128 行）是在 2024-01-01 到 2026-08-31 之間隨機取一天。

**為什麼要改** 實測同一則新聞在兩次載入的樣子：

```
標題    「智冠科技宣布二代接班，創辦人王俊博交棒王思淳接任董事長」

第 1 次   2025-09-10 ／ 工商時報
第 2 次   2024-01-13 ／ 4Gamers
事實      2026 年 8 月（這也是網站自己在公司卡片上寫的）
```

而且最可惜的是：**`NEWS_TEMPLATES` 裡面 30 則有 26 則早就寫好了正確的來源欄位 `s`**，卻完全沒被用到：

```js
{ t: "智冠科技宣布二代接班...", c: "人事異動", e: "...", s: "經濟日報" }
                                                          ↑ 這個欄位從沒被讀過
```

**怎麼改** 分兩步。

**步驟 1：讓程式碼改讀範本既有的欄位**

```js
// 第 200–201 行改成：
            date: t.d || formatDate(getRandomDate()),   // 有填 d 就用真實日期
            source: t.s || SOURCES[Math.floor(Math.random() * SOURCES.length)]
```

用 `||` 保底的好處是：**你可以一則一則慢慢補，補到哪裡就正確到哪裡，中途任何時間點網站都不會壞。**

**步驟 2：在 `NEWS_TEMPLATES` 每則補上 `d:` 真實日期**

```js
{ t: "智冠科技宣布二代接班，創辦人王俊博交棒王思淳接任董事長",
  c: "人事異動",
  e: "...",
  d: "2026-08-15",        // ← 新增：填該則新聞的實際發布日
  s: "經濟日報" }
```

**日期怎麼決定？** 兩個原則：

1. **有查到真實發布日就填真實的**（去該媒體或公司新聞頁確認）。
2. **查不到的，先留空不要填 `d`** —— 讓它繼續走亂數，總比填一個你自己編的日期好。要填也請對齊 `COMPANY_PROFILES` 裡已經標註的 spike 月份（那是網站聲量高峰的設定），至少讓「新聞高峰」和「聲量高峰」對得起來。

完整的 30 則工作表放在 **附錄 C**，可以直接拿來逐項打勾。

**另外注意**：傳奇網路（2 則）與泰偉電子（2 則）的範本連 `s` 欄位都沒有，補 `d` 的時候順手把 `s` 也補上。

**驗收** 重新整理三次，新聞稿的日期與來源完全不變；「智冠二代接班」顯示 2026 年而非 2024／2025；新聞稿的月份分佈和曝光趨勢圖的高峰月份對得上。

---

## F-07 — 下鑽溯源 `loadSources()` 實質失效

**位置** `js/data.js` 第 207–226 行；使用者入口在 `js/charts.js` 第 66–79 行

**這個功能長什麼樣** 在「數據分析」的曝光趨勢折線圖上**點任何一個資料點**，會呼叫 `loadSources(公司, 月份)`，然後彈出溯源視窗列出該公司該月的新聞來源（`js/app.js:261` 的 `showProvenanceModal()`）：

```js
// js/charts.js:66-78
onClick: function(evt, elements) {
    ...
    const docs = typeof loadSources === 'function' ? loadSources(company.id, month) : [];
    showProvenanceModal(company.name, month, docs);
}
```

**現況**

```js
206  // 溯源 API 函式 (v3.0 核心規格：下鑽溯源 loadSources)
207  function loadSources(companyId, month) {
...
212      return PRESS_RELEASES.filter(news => {
213          const matchComp  = (news.companyId === companyId);
214          const matchMonth = news.date && news.date.startsWith(month);   ← 比對亂數日期
215          return matchComp && matchMonth;
216      })...
```

**為什麼要改** 實測：

```js
> loadSources('soft-world', '2026-08')
[]        // 空的。而 2026-08 正是 COMPANY_PROFILES 裡標註智冠聲量最高的月份
```

問題有兩層：

1. **命中率本來就低**：30 則新聞稿要散落在 8 家公司 × 32 個月 = **256 個格子**裡，絕大多數格子必然是空的。使用者點十下大概有九下會看到「該月份暫無登記之原始新聞來源清單」。
2. **命中哪一格是隨機的**（F-06）：同一個點，這次點進去有資料、重新整理後再點就沒有。註解寫著「v3.0 核心規格」，但這個核心功能實際上不可靠。

**怎麼改** 這一項**不需要單獨修 `loadSources()`** —— F-06 修好之後，命中就會變成穩定、可預期的。另外建議做兩件事：

1. **讓空狀態更有用**：空狀態的 UI 已經存在了（`js/app.js:268`：「該月份暫無登記之原始新聞來源清單。」），不需要新增。要改的是措辭 —— 改成一併告訴使用者可以去哪裡看，例如附上該公司的官方新聞頁連結，讓點空格子的人不會覺得功能壞了。
2. **補真實連結**：目前 `loadSources()` 回傳的 `url` 是退而求其次用公司的 `newsUrl`（整個新聞列表頁），不是那一則新聞本身，而回傳物件卻標了 `is_original: true` —— 這個標記目前並不成立。若要做到名副其實的「溯源」，在 `NEWS_TEMPLATES` 每則再加一個 `u:` 欄位放原文網址：

```js
{ t: "...", c: "...", e: "...", d: "2026-08-15", s: "經濟日報",
  u: "https://money.udn.com/money/story/....." }
```

然後在第 193 行的 `PRESS_RELEASES.push({...})` 裡加上 `url: t.u || null`。

**驗收** `loadSources('soft-world', '2026-08')` 回傳非空陣列，且筆數與該月的新聞稿數量一致；在折線圖上點 2026-08 的智冠資料點，溯源視窗列得出新聞；重新整理後再點同一個點，結果相同。

---

## F-08 — 每週自動生成虛構新聞稿，並掛上真實媒體的名字

**位置** `scripts/update_data.py` 全檔、`.github/workflows/auto_update_data.yml`

**現況** GitHub Actions 每週一 00:00 UTC（台北 08:00）自動執行 `update_data.py`：

```python
comp   = random.choice(companies)                      # 隨機挑一家公司
cat    = random.choice(comp[3])                        # 隨機挑一個分類
source = random.choice(["巴哈姆特", "4Gamers", "Yahoo新聞",
                        "聯合新聞網", "ETtoday"])       # 隨機掛一家真實媒體

news_topics = {
    "財務報告": f"{comp[1]}公佈最新營運財報，受惠於旺季效應，單月營收表現亮眼",
    ...
}
```

產生的內容會被插進 `data.js` 的 `PRESS_RELEASES` 最前面，然後以 Bot 身分自動 commit 推上 `main`。

**為什麼要改** 三個層面的問題：

1. **資料誠信（最重要）** —— 產出的句子（例如「受惠於旺季效應，單月營收表現亮眼」）會被標記成「某某真實媒體」在「某個具體日期」對「某家上市櫃公司」的報導。網站首頁的標語是「台灣遊戲產業 2024 — 2026 **數據監測報告**」，只有 footer 一行小字說明是示範工具。這個落差在口試或公開展示時很難解釋，尤其對象是具名的上市櫃公司與具名媒體。
2. **同步不完整** —— 腳本只寫入 `js/data.js` 與 `docs/js/data.js`，`docs/*.js` 那一份不會同步，三份副本會越差越多（見 F-09）。
3. **無限膨脹** —— 每週固定新增一則、沒有上限，`data.js` 會逐年變大，而且首頁「監測新聞稿數量」會不斷往上跳，和 Hero 寫死的「32 個月」等數字越來越不一致（見 F-17）。

**怎麼改 — 三個選項，擇一**

**選項 A：停用排程（最安全，建議交件前採用）**

```yaml
# .github/workflows/auto_update_data.yml
on:
  # schedule:                    ← 註解掉這兩行
  #   - cron: '0 0 * * 1'
  workflow_dispatch:             ← 保留手動觸發即可
```

資料改為手動維護，每筆都對得起來源。

**選項 B：保留自動化，但誠實標示**

1. `update_data.py` 產生的項目加上標記與中性來源：

```python
new_entry = f"""        {{
            companyId: '{comp[0]}',
            companyName: '{comp[1]}',
            companyColor: '{comp[2]}',
            title: '{title}',
            category: '{cat}',
            excerpt: '{excerpt}',
            date: '{date_str}',
            source: '系統模擬',
            synthetic: true
        }},"""
```

2. `app.js` 的 `renderNews()` 在卡片上顯示徽章：

```js
${pr.synthetic ? '<span class="badge badge-synthetic">模擬資料</span>' : ''}
```

3. Hero 或 footer 加一行明確說明：「標示為『模擬資料』的項目由系統自動生成，非真實新聞報導。」

**選項 C：改抓真實資料（工程量最大，可列為後續）**

`config/sources.yml` 裡其實已經把 RSS 來源列好了（經濟日報、天下雜誌、數位時代、鉅亨網、巴哈姆特 GNN、4Gamers…），但目前**整個專案沒有任何程式碼在讀這個檔案**。把 `update_data.py` 改成用 `feedparser` 抓這些 RSS、依公司關鍵字過濾、只寫入「標題 + 原文連結 + 發布日 + 來源」，就能得到真實可溯源的資料。

**建議**：交件前先做 **A** 或 **B**；**C** 當作論文的「未來工作」或有餘力再做。

**驗收** 網站上任何一則自動產生的內容，讀者都能一眼辨識為模擬資料；或排程已停用、資料全為人工確認。

---

# 6. P2：架構與使用體驗

## F-09 — 刪掉 `docs/`，消滅三份不一致的副本

**位置** `docs/` 整個目錄（16 個檔案：`index.html`、6 支根目錄 JS、`js/` 6 支、`css/` 3 支）

**現況** 同一份程式碼有三套，內容互不一致：

| 路徑 | 版本 | 語法 | 是否被服務 |
|---|---|---|---|
| `js/*.js` | 最新（淺色主題） | 有三個錯誤 | ✅ 線上就是這份 |
| `docs/js/*.js` | 舊版（深色主題） | 正常 | ❌ |
| `docs/*.js` | 另一份副本 | 有同樣三個錯誤 | ❌ |

**為什麼要改** 這是「改半天沒反應」最典型的來源 —— 你有 2/3 的機率改到不會被載入的檔案。而且 `update_data.py` 只同步其中兩份，差異會越拉越大。

**怎麼改**

```bash
# 1. 先到 GitHub → Settings → Pages 確認 Source 是 "Deploy from a branch"、
#    Branch = main、Folder = "/ (root)"。確認之後：

git rm -r docs
git commit -m "chore: 移除 docs/ 重複副本，統一以 root 為唯一程式碼來源"
```

若想保留舊版做紀念，先打個 tag 再刪：

```bash
git tag archive/dark-theme-version
git push origin archive/dark-theme-version
```

**驗收** repo 裡只剩一份 `js/`；線上網站行為不變。

---

## F-10 — 移除死碼 `js/timeline.js`

**位置** `js/timeline.js` 全檔、`index.html` 第 523 行

**現況** `initTimeline()`（`timeline.js:24`）**沒有任何呼叫端**。「新聞稿中心」現在是由 `app.js` 的 `initNewsSection()` → `renderNews()` 繪製的。檔案末尾雖然有 `window.initTimeline = initTimeline;`，但沒人叫它。

同時這支檔案裡寫死了 4 處深色主題的行內樣式：

```js
background: #1a1a24;      // 深色圓點
background: #252533;      // 深色卡片
color: #fff;              // 白字
box-shadow: 0 4px 15px rgba(0,0,0,0.3);
```

若哪天真的把它接回去，畫面會在淺色背景上冒出一塊黑卡片。

**怎麼改**

```bash
git rm js/timeline.js
```

並刪除 `index.html` 第 523 行：

```html
<script src="js/timeline.js"></script>      ← 刪掉這行
```

這樣 F-03 和 F-20 也一併解決了。

**驗收** 「新聞稿中心」顯示正常（本來就是 `app.js` 在畫）；console 沒有 404。

---

## F-11 — 顏色統一由 `data.js` 提供

**位置** `js/charts.js` 第 243–252 行、第 306–315 行

**現況** `charts.js` 自己維護了兩份硬編碼的 `brightPalette`：

```js
243  const brightPalette = {
244      'soft-world': '#e76f51',      // data.js 裡是 #e63946
245      'softstar':   '#2a9d8f',      // data.js 裡是 #457b9d
246      'gamania':    '#f4a261',      // data.js 裡是 #f77f00
...
```

注意色碼和 `data.js` **不一樣** —— 同一家公司在不同圖表會是不同顏色。

**為什麼要改** 兩個來源代表改一次品牌色要記得改三個地方（`data.js` + 兩份 `brightPalette`），而且目前已經對不上了。

**怎麼改** F-04 修好之後，`brandColor` 就會有值，可以直接刪掉這兩份 palette：

```js
// 第 261 行
backgroundColor: kolData.map(d => brightPalette[d.id] || d.color || '#3a86ff'),
// 改成
backgroundColor: kolData.map(d => d.color || '#3a86ff'),

// 第 324 行
color: brightPalette[company.id] || company.brandColor || '#3a86ff'
// 改成
color: company.brandColor
```

然後刪除 243–252、306–315 兩段宣告。

**如果覺得 `data.js` 的原色太暗**（`brightPalette` 當初大概就是為了這個而生），正確作法是**去改 `data.js` 的 `color` 值**，而不是在別的檔案再開一份。

**驗收** 同一家公司在折線圖、長條圖、雷達圖、公司卡片上是同一個顏色。

---

## F-12 — 補 README，收掉過期文件

**位置** 專案根目錄

**現況** 沒有 `README.md`；卻有 `implementation_plan.md` 和 `implementation_plan_v3_final.md` 兩份，新讀者無從判斷哪份有效。

**怎麼改** 新增 `README.md`，至少寫清楚這五件事：

```markdown
# 台灣遊戲公司新聞稿與媒體曝光比較平台

## 這是什麼
（一段話說明用途與範圍）

## ⚠️ 資料性質
- 公司基本資料、重大事件：人工整理自公開資訊，附來源連結
- 月度聲量數據（MONTHLY_STATS）：依 COMPANY_PROFILES 參數模擬生成，非實際統計
- （若採用 F-08 選項 B）標示「模擬資料」的新聞稿：系統自動生成

## 本機預覽
python -m http.server 8765
# 開 http://127.0.0.1:8765

## 部署
GitHub Pages，來源為 main 分支的 root 目錄。推上 main 後約 1–2 分鐘生效。

## 檔案結構
（簡述 js/ 各檔負責什麼）
```

`implementation_plan*.md` 移到 `archive/` 或直接刪除。

**驗收** 打開 repo 首頁就看得懂這是什麼、資料哪來的、怎麼跑起來。

---

## F-13 — 對比工具預設全選八家，雷達圖看不出東西

**位置** `js/compare.js` 第 19–20 行

**現況**

```js
19      // 預設全選
20      compareState.selectedCompanyIds = COMPANIES.map(c => c.id);
```

**為什麼要改** 八組半透明多邊形疊在同一張雷達圖上，實際上什麼都看不出來 —— 而「能比較」正是這個工具存在的理由。而且畫面上的說明文字寫的是「最少選擇 2 家」（`compare.js:40`），卻沒有上限。

**怎麼改**

```js
    // 預設選 3 家（規模與類型有代表性的組合）
    compareState.selectedCompanyIds = ['soft-world', 'gamania', 'wanin'];
```

再加一個上限。在切換選取的事件處理裡（`compare.js` 第 85 行附近的按鈕 click handler）加：

```js
const MAX_COMPARE = 4;
if (!compareState.selectedCompanyIds.includes(id)
    && compareState.selectedCompanyIds.length >= MAX_COMPARE) {
    alert(`雷達圖最多同時比較 ${MAX_COMPARE} 家，請先取消一家再選。`);
    return;
}
```

並把第 40 行的說明文字改成「請選擇 2–4 家進行對比」。

**（進階）** 若希望表格能全選、只有雷達圖限制數量，就讓表格照 `selectedCompanyIds` 全畫，雷達圖只取前 4 家並加註「雷達圖僅顯示前 4 家」。

**驗收** 進入對比工具預設看到 3 家、雷達圖清晰可辨；選到第 5 家時有提示。

---

## F-14 — 「下載圖表圖片」是假按鈕

**位置** `js/compare.js` 第 403–405 行

**現況**

```js
403  function exportComparisonImg() {
404      alert('此功能需要引入 html2canvas 函式庫，若已引入則可將比較區域匯出為圖片！');
405  }
```

按鈕本身長得像真的（`compare.js:45`），點下去卻只是彈出一段開發者筆記。

**為什麼要改** 按了沒反應比沒有按鈕更傷信任 —— 尤其如果口試現場有人點到。

**怎麼改** 好消息是**不需要 html2canvas**。Chart.js 內建就能匯出 canvas：

```js
function exportComparisonImg() {
    const chart = compareCharts['compareRadarChart'];
    if (!chart) {
        alert('請先選擇要比較的企業。');
        return;
    }
    const link = document.createElement('a');
    link.download = `企業對比_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = chart.toBase64Image('image/png', 1);
    link.click();
}
```

若想連表格一起匯出才需要 html2canvas —— 那就**先做上面這版（只匯出雷達圖），把按鈕文字改成「📸 下載雷達圖」**，名實相符。

**不打算做的話**：直接刪掉第 45 行那顆按鈕，以及第 99 行的事件綁定。

**驗收** 點按鈕真的下載到一個 PNG 檔；或按鈕已移除。

---

## F-15 — 公司下拉選單還是深色版遺留

**位置** `js/charts.js` 第 131 行

**現況**

```js
<select id="${canvasId}-select" class="company-selector"
        style="margin-bottom: 10px; padding: 5px;
               background: #1a1a24; color: #fff; border: 1px solid #333;
               border-radius: 4px;">
```

整站是淺色主題，這個選單卻是黑底白字，看起來像個突兀的黑塊。

**怎麼改** 換成與整站一致的淺色：

```js
<select id="${canvasId}-select" class="company-selector"
        style="margin-bottom: 12px; padding: 6px 10px;
               background: #ffffff; color: #334155; border: 1px solid #cbd5e1;
               border-radius: 6px; font-family: inherit; font-size: 0.9rem;">
```

**（更好的作法）** 把這段樣式搬進 `css/components.css` 的 `.company-selector`，`charts.js` 只留 class：

```css
/* css/components.css */
.company-selector {
  margin-bottom: 12px;
  padding: 6px 10px;
  background: #fff;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
}
.company-selector:focus-visible { outline: 2px solid #0e7c7b; outline-offset: 2px; }
```

**驗收** 「數據分析」的媒體通路圖上方的下拉選單是淺色，和周圍卡片協調。

---

## F-16 — 每次切頁都把圖表全部銷毀重建

**位置** `js/app.js` 第 66–84 行、`js/charts.js` 第 389–443 行

**現況** 路由切頁時：

```js
// app.js:68-74
requestAnimationFrame(() => {
    if (targetPage === 'analytics') {
        if (typeof forceResizeAllCharts === 'function') {
            forceResizeAllCharts();
            setTimeout(forceResizeAllCharts, 60);     // 再一次
            setTimeout(forceResizeAllCharts, 250);    // 再一次
        }
    }
    ...
```

而 `forceResizeAllCharts()`（`charts.js:439`）實際上是 `renderAnalyticsCharts()`，內容是 **destroy + new Chart**：

```js
// charts.js:399 起，四張圖都是這個模式
if (charts['exposureTrendChart']) {
    try { charts['exposureTrendChart'].destroy(); } catch (e) {}
    delete charts['exposureTrendChart'];
}
initExposureTrendChart('exposureTrendChart');
```

**為什麼要改** 每次切到「數據分析」都會把四張圖砍掉重建**三次**，每次都重跑 1500ms 的進場動畫。切頁有明顯延遲，動畫也會抖。

這整套是當初為了解決「切頁後 canvas 寬度是 0、圖畫不出來」而做的補償 —— 問題的**根**在於路由用 `display: none` 隱藏區塊，被隱藏的 canvas 量不到尺寸。

**怎麼改 — 兩個層次**

**改法 1（治標，風險低）**：只在第一次進入時建立，之後改用 resize。

```js
// charts.js
function forceResizeAllCharts() {
    const hasCharts = Object.keys(charts).length > 0;
    if (!hasCharts) {
        renderAnalyticsCharts();        // 第一次：建立
    } else {
        Object.values(charts).forEach(c => { try { c.resize(); } catch (e) {} });
    }
}
```

同時把 `app.js` 那三次連續呼叫縮成一次（保留 `requestAnimationFrame` 即可）。

**改法 2（治本，風險中）**：路由改成不用 `display: none`。

```css
/* css/index.css */
.page-section { position: absolute; left: -9999px; visibility: hidden; }
.page-section.is-active { position: static; left: auto; visibility: visible; }
```

這樣區塊一直保有寬度，canvas 尺寸永遠正確，整套 destroy/rebuild/三次重試的補償機制都可以拿掉。**但這會動到路由與版面，違反專案自訂的「微創原則」，建議等交件之後再做。**

**驗收** 在「公司總覽 ↔ 數據分析」之間來回切五次，圖表都在、沒有空白、沒有明顯延遲，進場動畫只在第一次播放。

---

# 7. P3：品質細節

## F-17 — Hero 統計數字寫死，會和資料脫節

**位置** `index.html` 第 100、104 行

**現況**

```html
92    <span class="hero-stat-number" data-target="8">8</span>
93    <span class="hero-stat-label">指標上市櫃企業</span>
96    <span class="hero-stat-number" data-target="0" id="totalPressReleases">0</span>   ← 這個是動態的
97    <span class="hero-stat-label">監測新聞稿數量</span>
100   <span class="hero-stat-number" data-target="32">32</span>                        ← 寫死
101   <span class="hero-stat-label">追蹤歷史月份</span>
104   <span class="hero-stat-number" data-target="7">7</span>                          ← 寫死，而且是錯的
105   <span class="hero-stat-label">核心媒體觀測頻道</span>
```

**為什麼要改**

- 「32 追蹤歷史月份」：`update_data.py` 每週會推進 `data.js` 的 `END_MONTH`，`MONTHS_LIST` 會變成 33、34…，但首頁永遠寫 32。
- 「7 核心媒體觀測頻道」：`channels` 陣列實際有 **10** 個（外加 F-05 造成的假「其他」＝11 個），首頁寫 7，對不上。

**怎麼改** 比照已經動態化的 `#totalPressReleases`。先給這兩個 span 加 id：

```html
<span class="hero-stat-number" data-target="0" id="totalMonths">0</span>
...
<span class="hero-stat-number" data-target="0" id="totalChannels">0</span>
```

再在 `js/app.js` 的 `initStatsOverview()`（第 316 行）末尾、第 346 行之後補上：

```js
    const elMonths   = document.getElementById('totalMonths');
    const elChannels = document.getElementById('totalChannels');

    if (elMonths && typeof MONTHS_LIST !== 'undefined') {
        elMonths.textContent = MONTHS_LIST.length;
        elMonths.setAttribute('data-target', MONTHS_LIST.length);
    }
    if (elChannels && typeof MEDIA_CHANNELS !== 'undefined') {
        const n = Object.keys(MEDIA_CHANNELS[COMPANIES[0].id] || {}).length;
        elChannels.textContent = n;
        elChannels.setAttribute('data-target', n);
    }
```

**驗收** 首頁四個數字都和實際資料一致；改 `END_MONTH` 之後首頁跟著變。

---

## F-18 — Chart.js CDN 沒有 SRI，載入失敗時無提示

**位置** `index.html` 第 23 行

**現況**

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
```

**為什麼要改** 校園網路、公司防火牆或審查環境擋掉 jsDelivr 時，`Chart` 會是 `undefined`。`charts.js:390` 有一行 `if (typeof Chart === 'undefined') return;` —— 會安靜地跳過、**什麼提示都沒有**，畫面症狀和這次的 bug 幾乎一模一樣，屆時很難分辨是哪個原因。

**怎麼改** 三選一（可疊加）：

**A. 加上完整性檢查**

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"
        integrity="sha384-（到 https://www.srihash.org/ 產生）"
        crossorigin="anonymous"></script>
```

**B. 載入失敗時給明確訊息**（改 `charts.js:390`）

```js
function renderAnalyticsCharts() {
    if (typeof Chart === 'undefined') {
        document.querySelectorAll('#analytics canvas').forEach(c => {
            c.insertAdjacentHTML('afterend',
                '<p style="text-align:center;color:#94a3b8;padding:40px;">' +
                '圖表元件載入失敗，請檢查網路連線後重新整理。</p>');
        });
        return;
    }
    ...
```

**C. 最保險：把檔案放進 repo**

```bash
mkdir -p vendor
curl -o vendor/chart.umd.min.js https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js
```

```html
<script src="vendor/chart.umd.min.js"></script>
```

口試或展示場合建議直接用 **C**，不依賴外部網路。

**驗收** DevTools 用 Network 面板把 jsdelivr 擋掉後重新整理，畫面出現明確錯誤說明（或圖表照常顯示，因為改成本地檔案了）。

---

## F-19 — 無障礙細節

**位置** `index.html` 第 271、294、307、321 行（canvas）、第 57 行（toggle）；`js/app.js` 第 126–130 行

**現況與改法**

**(a) 四個 `<canvas>` 沒有文字替代** —— 螢幕閱讀器完全讀不到任何數據。

```html
<canvas id="exposureTrendChart"
        role="img"
        aria-label="2024 至 2026 年八家遊戲公司每月媒體報導則數趨勢折線圖"></canvas>
```

四個 canvas 都加上對應描述。若要更完整，在旁邊放一份視覺隱藏的資料表：

```html
<table class="sr-only">
  <caption>各公司月度媒體報導則數</caption>
  ...
</table>
```

```css
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```

**(b) 漢堡選單缺 `aria-expanded`** —— `index.html:57` 已有 `aria-label="選單"`，但開合狀態沒有告訴輔助技術。

```html
<button class="navbar-toggle" id="navbarToggle" aria-label="選單"
        aria-expanded="false" aria-controls="navbarMenu">
```

```js
// js/app.js:127-129
mobileMenuBtn.addEventListener('click', () => {
    const open = navMenu.classList.toggle('active');
    mobileMenuBtn.setAttribute('aria-expanded', String(open));
});
```

（第 133–137 行那個「點連結自動關閉」的處理也要一併把 `aria-expanded` 設回 `false`。）

**(c) 圖表只用顏色區分公司** —— 色覺障礙者難以分辨八條同樣粗細的折線。長條圖直接標上數值，或折線圖給不同的 `pointStyle`：

```js
pointStyle: ['circle', 'triangle', 'rect', 'star', 'cross', 'rectRot', 'line', 'dash'][idx]
```

**驗收** 用鍵盤 Tab 可以走完整個頁面且看得到 focus 框；螢幕閱讀器唸得出每張圖在講什麼。

---

## F-20 — 連結衛生

**位置** `js/timeline.js` 第 161 行、`js/data.js` 第 54 行、`index.html` 第 472 行

**現況**

- 全站 26 個 `target="_blank"` 有 25 個都加了 `rel="noopener"`，唯獨 `timeline.js:161` 漏掉。
- 網銀國際的新聞連結是 `http://wanin.tw/News/`（非加密）。

**怎麼改**

- 第一項：採用 F-10 直接刪檔就一併解決；若保留檔案，補上 `rel="noopener"`。
- 第二項：`js/data.js:54` 與 `index.html:472` 的 `http://wanin.tw/News/` 改成 `https://www.wanin.tw/News/`（改之前先在瀏覽器開一次確認可連）。

**驗收** `grep -o 'target="_blank"' index.html js/*.js | wc -l` 的數字，與 `rel="noopener"` 的數字相同；全站沒有 `http://` 開頭的外部連結。

---

# 8. 執行順序與 commit 切分建議

一次一個主題，每個 commit 都能獨立回退。

| 順序 | Commit 訊息 | 內容 | 預估 |
|---|---|---|---|
| 1 | `fix: 修正三支 JS 的語法錯誤，恢復數據分析與對比工具頁面` | F-01、F-02、F-03 | 30 分 |
| 2 | `fix: 統一品牌色欄位，恢復圖表配色` | F-04、F-11 | 30 分 |
| 3 | `fix: 媒體通路佔比改為固定分佈並修正 NaN 欄位` | F-05 | 40 分 |
| 4 | `fix: 新聞稿改用真實日期與來源，修復下鑽溯源` | F-06、F-07 | 1–2 小時 |
| 5 | `chore: 調整自動更新腳本的資料標示方式` | F-08 | 30 分（需先決策） |
| 6 | `chore: 移除 docs/ 重複副本與死碼 timeline.js` | F-09、F-10、F-20 | 20 分 |
| 7 | `docs: 新增 README，整理過期計畫文件` | F-12 | 30 分 |
| 8 | `feat: 對比工具預設 3 家並限制上限；匯出圖片改用 Chart.js 內建` | F-13、F-14 | 40 分 |
| 9 | `style: 下拉選單改淺色；圖表切頁改為 resize 不重建` | F-15、F-16 | 40 分 |
| 10 | `chore: 統計數字動態化、CDN 保險、無障礙補強` | F-17、F-18、F-19 | 1 小時 |

**時間有限的話，做到第 4 項就足以應付口試**：畫面正常、顏色正確、數字可重現、新聞稿對得上事實。

**建議額外做一件事** —— 加一個語法檢查的 GitHub Action，讓 F-01～F-03 這種錯誤不可能再被推上線：

```yaml
# .github/workflows/js-syntax-check.yml
name: JS 語法檢查
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: 檢查每支 JS 的語法
        run: |
          for f in js/*.js; do
            echo "checking $f"
            node --check "$f"
          done
```

---

# 9. 驗收清單

每個階段做完後逐項確認。

**P0 完成後**

- [ ] DevTools console 沒有任何紅色錯誤
- [ ] 點「數據分析」，四張圖都有內容
- [ ] 點「對比工具」，雷達圖、長條圖、比較表格都出現
- [ ] 切到別頁再切回來，圖表仍在

**P1 完成後**

- [ ] 折線圖八條線顏色各不相同，且與公司卡片顏色一致
- [ ] 點「完整剖析」彈窗，股票代號徽章與公司名稱有顏色
- [ ] 圓餅圖沒有畫不出來的切片，圖例沒有「其他」
- [ ] 圓餅圖各項百分比加總等於 100
- [ ] 重新整理三次，所有數字與新聞稿日期完全相同
- [ ] 「智冠二代接班」顯示 2026 年，不是 2024／2025
- [ ] `loadSources('soft-world', '2026-08')` 回傳非空陣列
- [ ] 網站上任何自動生成的內容都能明確辨識為模擬資料

**P2／P3 完成後**

- [ ] repo 裡只剩一份 `js/`
- [ ] 對比工具預設 3 家，雷達圖清晰可辨
- [ ] 「下載圖表圖片」真的下載到檔案（或按鈕已移除）
- [ ] 手機寬度 375px 下導覽選單可開合，圖表不溢出畫面
- [ ] 首頁四個統計數字都和實際資料一致
- [ ] 用鍵盤 Tab 可走完整個頁面且看得到 focus 框

---

# 附錄 A：本機驗證方法

```bash
# 起本機預覽（在 repo 根目錄執行）
python -m http.server 8765
# 瀏覽器開 http://127.0.0.1:8765/index.html
```

**用 Node 檢查語法**（最快，建議每次改完 JS 都跑）

```bash
for f in js/*.js; do node --check "$f" || echo "FAIL: $f"; done
```

**沒有 Node 的話，用瀏覽器 console 檢查**

在網站頁面的 console 貼上：

```js
(async () => {
  const files = ['data','animations','charts','timeline','compare','app'];
  for (const f of files) {
    const t = await (await fetch(`js/${f}.js?v=${Date.now()}`)).text();
    try { new Function(t); console.log(`✅ ${f}.js`); }
    catch (e) { console.error(`❌ ${f}.js — ${e.message}`); }
  }
})();
```

**檢查資料是否可重現**（連續重新整理兩次，兩次結果應完全相同）

```js
JSON.stringify({
  佔比: Object.values(MEDIA_CHANNELS['soft-world']),
  第一則新聞: PRESS_RELEASES[0].date + ' / ' + PRESS_RELEASES[0].source,
  溯源: loadSources('soft-world', '2026-08').length
})
```

**檢查品牌色是否生效**

```js
COMPANIES.filter(c => c.brandColor !== undefined).length   // 應該是 8
```

---

# 附錄 B：行號速查表（commit `dc3fef8`）

### `js/data.js`（全長 318 行）

| 行號 | 內容 |
|---|---|
| 4–117 | `COMPANIES` 八家公司資料（顏色欄位是 `color`） |
| **118** | **F-04 在這裡插入品牌色正規化** |
| 120 | `SOURCES` 媒體清單 |
| 123–125 | `PRESS_RELEASES` / `MONTHLY_STATS` / `MEDIA_CHANNELS` 空容器 |
| 128–133 | `getRandomDate()` ← F-06 的亂數來源 |
| 140–187 | `NEWS_TEMPLATES` 30 則新聞範本 ← F-06 要補 `d:` |
| **190–204** | **產生新聞稿，第 200–201 行是 F-06 要改的兩行** |
| 207–226 | `loadSources()` ← F-07 |
| 228–231 | `START_YEAR` / `END_YEAR` / `END_MONTH`（`update_data.py` 會改這裡） |
| 233–240 | `MONTHS_LIST` 產生（32 個月） |
| 242–275 | `COMPANY_PROFILES` ← F-05 要加 `channelMix` |
| 277 | `channels` 十個通路 |
| 279–318 | 產生月度數據與媒體分佈 |
| **297–315** | **F-05 要改的區段** |

### `js/charts.js`（全長 484 行）

| 行號 | 內容 |
|---|---|
| 23–26 | `getBrandColor()` ← 死碼，且回傳 undefined |
| 31–114 | `initExposureTrendChart()`，第 44–45 行用 `brandColor` |
| 66–79 | 折線圖 `onClick` ← 下鑽溯源的入口（F-07） |
| 116–218 | `initMediaChannelChart()` |
| **131** | **F-15 深色下拉選單** |
| 220–300 | `initKolRankChart()` |
| **238–241** | **F-01 要刪的四行** |
| 243–252 | `brightPalette` ← F-11 |
| 302–387 | `initPressReleaseChart()` |
| 306–315 | 第二份 `brightPalette` ← F-11 |
| 389–429 | `renderAnalyticsCharts()`（destroy + rebuild） |
| 435–443 | `initAllChartsNow()` / `forceResizeAllCharts()` ← F-16 |
| 446–478 | `initAllCharts()` + IntersectionObserver |

### `js/compare.js`（全長 430 行）

| 行號 | 內容 |
|---|---|
| 6–8 | `compareState` |
| 15–24 | `initCompare()` |
| **19–20** | **F-13 預設全選** |
| 29–105 | `renderCompareUI()` |
| 40 | 「最少選擇 2 家」說明文字 |
| 45–46 | 匯出按鈕 |
| 80–104 | 公司選取與按鈕的事件綁定 ← F-13 的上限要加在這裡 |
| 106–116 | `updateComparison()` |
| 138–219 | `renderRadarChart()`，datasets 在 160–180（用 `brandColor`） |
| 220–280 | `renderComparisonBarChart()` |
| 281–330 | `renderComparisonTable()` 新版（淺色） |
| **331–367** | **F-02 要刪的舊版殘留** |
| 372–400 | `forceResizeCompareCharts()` |
| **403–405** | **F-14 假的匯出圖片功能** |
| 410–428 | `exportComparisonSummary()`（這個是真的可用） |

### `js/app.js`（全長 518 行）

| 行號 | 內容 |
|---|---|
| 1–14 | `DOMContentLoaded` 進入點 |
| 17–110 | `initHashRouter()` |
| **66–84** | **F-16 切頁時的三次重繪** |
| 113–139 | `initNavbar()` ← F-19 的 `aria-expanded` |
| 141–207 | `renderCompanyCards()`（有 `brandColor \|\| color` 保險） |
| 208–258 | `showCompanyModal()` 公司詳情彈窗 ← **F-04：226–227 行沒有保險** |
| 261–314 | `showProvenanceModal()` 溯源視窗（空狀態在 268 行） |
| 316–347 | `initStatsOverview()` ← F-17 要在末尾補兩段 |
| 354–369 | `initNewsSection()`（新聞稿中心真正的繪製者） |
| 440–498 | `renderNews()` ← F-08 選項 B 的「模擬資料」徽章加在這裡 |
| 500–518 | `initBackToTop()` |

### `index.html`（全長 527 行）

| 行號 | 內容 |
|---|---|
| 23 | Chart.js CDN ← F-18 |
| 25–28 | CSS 引入 |
| 45–52 | 導覽列連結 |
| 57 | `navbarToggle` ← F-19 |
| 92–105 | Hero 四個統計數字 ← **F-17：100、104 行寫死** |
| 132–147 | 公司總覽的四張統計卡（已動態化） |
| 253 | `<section id="analytics">` |
| 271、294、307、321 | 四個 `<canvas>` ← F-19 |
| 330 | `<section id="compare">` |
| 338 | `#compareContainer` |
| 347 | `<section id="trends">`（純靜態內容） |
| 472 | 網銀 http 連結 ← F-20 |
| 520–525 | 六支 JS 引入 ← **523 行是 timeline.js，F-10 要刪** |

---

# 附錄 C：新聞稿日期補正工作表（F-06 用）

共 30 則。查到真實發布日就填，查不到的先留空（留空會走亂數，但至少你知道哪幾則還沒處理）。
「建議對齊月份」欄是 `COMPANY_PROFILES` 裡已經設定的聲量高峰，可作為交叉檢查。

### 智冠科技 `soft-world`　高峰月份：2024-05、2024-06、2026-08

| # | 標題（節錄） | 分類 | 既有來源 `s` | 真實日期 `d` |
|---|---|---|---|---|
| 1 | 宣布二代接班，王俊博交棒王思淳 | 人事異動 | 經濟日報 | ☐ 2026-08? |
| 2 | 結盟榮剛換股案正式生效 | 策略合作 | 鉅亨網 | ☐ 2024-06? |
| 3 | MyCard 導入生成式 AI 智能客服 | 技術創新 | 數位時代 | ☐ |
| 4 | 《金庸群俠傳Online》25 週年慶典 | 社群活動 | 巴哈姆特 | ☐ |
| 5 | 藍新金流 2025 年交易額破千億 | 財務報告 | 經濟日報 | ☐ |
| 6 | 擴大東南亞支付佈局，結盟泰國業者 | 策略合作 | 天下雜誌 | ☐ |

### 大宇資訊 `softstar`　高峰月份：2024-05、2024-09、2026-01

| # | 標題（節錄） | 分類 | 既有來源 `s` | 真實日期 `d` |
|---|---|---|---|---|
| 7 | 股東會通過更名「光聚晶電聯合」 | 產業趨勢 | 經濟日報 | ☐ 2026-01? |
| 8 | 處分雙劍 IP 完成交割，5 億挹注 | 財務報告 | 鉅亨網 | ☐ 2024-09? |
| 9 | 《咒》登陸 Steam，全球熱銷十萬套 | 新品發布 | 4Gamers | ☐ |
| 10 | 併購 AI 散熱模組廠 | 策略合作 | 數位時代 | ☐ |
| 11 | 《女鬼橋二》奪 Best Narrative | 產業趨勢 | 天下雜誌 | ☐ 2024-05? |

### 橘子 `gamania`　高峰月份：2024-06、2025-01、2026-02

| # | 標題（節錄） | 分類 | 既有來源 `s` | 真實日期 `d` |
|---|---|---|---|---|
| 12 | 宣告 2026 為「AI 商轉元年」 | 技術創新 | 數位時代 | ☐ 2026-02? |
| 13 | 《波拉西亞戰記》台港澳開服 | 新品發布 | 巴哈姆特 | ☐ 2024-06? |
| 14 | 《新楓之谷》20 週年嘉年華 | 社群活動 | ETtoday | ☐ |
| 15 | 《天堂M》改版帶動營收年增 18% | 財務報告 | 經濟日報 | ☐ |
| 16 | 橘子支付結合 AI 試穿 | 技術創新 | 鉅亨網 | ☐ |

### 網銀國際 `wanin`　高峰月份：2024-06、2025-07、2026-07

| # | 標題（節錄） | 分類 | 既有來源 `s` | 真實日期 `d` |
|---|---|---|---|---|
| 17 | 12.49 億收購威秀影城 35.69% 股權 | 策略合作 | 經濟日報 | ☐ 2024-06? |
| 18 | 《星城Online》更名為《星城》 | 產業趨勢 | 天下雜誌 | ☐ 2026-07? |
| 19 | 閃電狼奪國際電競大賽季軍 | 電競賽事 | 4Gamers | ☐ |
| 20 | 成立影視投資部門，每年投資 3-5 部國片 | 策略合作 | 數位時代 | ☐ |

### 華義國際 `wayi`　高峰月份：2024-11、2025-06、2026-03

| # | 標題（節錄） | 分類 | 既有來源 `s` | 真實日期 `d` |
|---|---|---|---|---|
| 21 | 合資成立「華智」進軍印度手遊 | 策略合作 | 經濟日報 | ☐ 2025-06? |
| 22 | 子公司取得離岸 B2B 遊戲執照 | 產業趨勢 | 鉅亨網 | ☐ 2026-03? |
| 23 | 「遊戲大亂鬥」導入創作者分潤 | 技術創新 | 數位時代 | ☐ |

### 宇峻奧汀 `userjoy`　高峰月份：2025-01、2025-02、2026-08

| # | 標題（節錄） | 分類 | 既有來源 `s` | 真實日期 `d` |
|---|---|---|---|---|
| 24 | Q1 營收 5.19 億創新高，《FFXIV》熱銷 | 財務報告 | 經濟日報 | ☐ |
| 25 | 《三國群英傳：策定九州》雙平台公測 | 新品發布 | 巴哈姆特 | ☐ |
| 26 | UE5 打造的次世代武俠 RPG 新作 | 技術創新 | 數位時代 | ☐ |

### 傳奇網路 `xlegend`　高峰月份：2024-03、2025-05、2026-04

| # | 標題（節錄） | 分類 | 既有來源 `s` | 真實日期 `d` |
|---|---|---|---|---|
| 27 | 雙軌策略奏效，毛利率突破 60% | 財務報告 | **缺，需補** | ☐ |
| 28 | 《咻咻史萊姆》全球下載破千萬 | 新品發布 | **缺，需補** | ☐ |

### 泰偉電子 `astro`　高峰月份：2024-08、2025-10、2026-05

| # | 標題（節錄） | 分類 | 既有來源 `s` | 真實日期 `d` |
|---|---|---|---|---|
| 29 | 完成減資 70%，每股淨值回升 | 財務報告 | **缺，需補** | ☐ |
| 30 | 「叫號叫我」智慧系統獲醫學中心採用 | 產業趨勢 | **缺，需補** | ☐ |

> **提醒**：帶「?」的建議月份是從公司卡片的「2024-2026 重大動態」文字推得的，**不是查證過的發布日**。填進去之前請到該媒體或公司官網確認實際日期 —— 這正是 F-08 想避免的那種問題，不要在修 F-06 的時候又製造一次。

---

# 附錄 D：不要做的事（相容性守則）

專案的 `.agents/rules/user-preferences.md` 明訂了「微創原則」。本計畫書的 20 項修改都刻意留在這個範圍內：

**都沒有動到的東西**

- HTML 版面結構（區塊順序、class 命名、grid 佈局）
- CSS 版型與配色系統
- `COMPANIES` / `MONTHLY_STATS` / `PRESS_RELEASES` / `MEDIA_CHANNELS` 的**資料結構與欄位名稱**
- Hash 路由的網址格式（`#/companies`、`#/analytics`…）

**唯二會改變畫面「內容」的**

| 項目 | 改變 | 為什麼可以接受 |
|---|---|---|
| F-05 | 媒體佔比由亂數變固定值 | 結構不變，只是從「不可重現」變成「可重現」 |
| F-06 | 新聞稿日期由亂數變真實日期 | 結構不變，只是從「與事實矛盾」變成「與事實相符」 |

**建議延後、不要在交件前做的**

- F-16 的「改法 2」（把路由從 `display:none` 改成 `visibility`）—— 會動到版面行為
- F-04 的「可選作法」（把 `data.js` 欄位直接改名）—— 牽動 8 筆資料 + 4 處程式碼
- F-08 的「選項 C」（改抓真實 RSS）—— 屬於新功能開發，適合列為論文的未來工作

---

*本文件依 commit `dc3fef8` 的程式碼撰寫。所有「實測證據」皆為在本機起 HTTP server、於瀏覽器實際執行後取得的輸出。*
