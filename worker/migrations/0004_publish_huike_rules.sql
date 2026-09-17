-- 競業／產業規則改為自動公開後，將近兩個月內已命中的待覆核項目
-- 一併轉為系統驗證，避免既有資料必須等下一輪 RSS 才會出現。
UPDATE article_matches
SET status = 'approved',
    reviewed_by = 'system:verified-rss',
    reviewed_at = datetime('now')
WHERE status = 'pending'
  AND rule_id IN (
    'competitor-brand', 'competitor-tw-game', 'competitor-global-game',
    'industry-game-platform', 'industry-game-market', 'industry-platform-business',
    'industry-new-business', 'industry-einvoice', 'industry-martech'
  )
  AND article_id IN (
    SELECT id FROM articles
    WHERE COALESCE(published_at, fetched_at) >= '2026-07-17T00:00:00.000Z'
      AND COALESCE(published_at, fetched_at) <= '2026-09-17T23:59:59.999Z'
  );

UPDATE articles
SET review_status = 'approved'
WHERE review_status = 'pending'
  AND id IN (
    SELECT DISTINCT article_id FROM article_matches
    WHERE status = 'approved'
      AND rule_id IN (
        'competitor-brand', 'competitor-tw-game', 'competitor-global-game',
        'industry-game-platform', 'industry-game-market', 'industry-platform-business',
        'industry-new-business', 'industry-einvoice', 'industry-martech'
      )
  );
