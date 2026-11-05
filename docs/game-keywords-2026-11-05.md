# 遊戲監測關鍵字補充（2026-11-05）

智冠集團的 `softworld-games` 新增「奧丁：神叛」「ODIN」「2026 中職王牌GO!」，與「遊戲」同時命中才成立。智凡迪、MCL電子競技／MCL、棕色塵埃2、上古世紀戰爭／ArcheageWar 已存在，維持原設定。

產業新聞的 `industry-game-platform` 補入 KAKAOGAMES／Kakao Games、NEOWIZ、NCSOFT／NC SOFT、WeMade；英文比對不區分大小寫。雖然部分品牌已在國際競業規則中，仍須加入這條產業規則才能歸入使用者指定的分類。條件維持同一標題或 RSS 首段摘要內同時出現「遊戲」與品牌詞。電競聯賽／電競賽事、暴雪／Blizzard 已存在，不重複加入。Google News 聚合仍僅比對標題。

規則來源為 `config/monitoring_rules.json`，版本為 `2026-11-05-game-keywords-v1`。新資料庫沿用 seed；既有 D1 更新使用 `worker/migrations/0010_game_keywords.sql`，並須同步發布 Worker 以更新內嵌規則及版本。RSS 備援與 Google News 聚合會讀取共用設定；本機設定更新不代表正式服務已發布。
