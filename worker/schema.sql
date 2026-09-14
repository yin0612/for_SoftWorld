PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS media_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  region TEXT NOT NULL,
  type TEXT NOT NULL,
  access_mode TEXT NOT NULL,
  feed_url TEXT,
  tier TEXT NOT NULL DEFAULT 'B',
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
  last_success_at TEXT,
  last_attempt_at TEXT,
  health_status TEXT NOT NULL DEFAULT 'not_configured',
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS monitoring_rules (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('full_text', 'title_or_lead', 'title', 'lead', 'paragraph')),
  any_of_json TEXT NOT NULL,
  all_of_json TEXT NOT NULL,
  exclude_any_json TEXT NOT NULL,
  version TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  canonical_url TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL REFERENCES media_sources(id),
  title TEXT NOT NULL,
  excerpt TEXT,
  published_at TEXT,
  fetched_at TEXT NOT NULL,
  content_hash TEXT,
  language TEXT,
  raw_locator TEXT,
  duplicate_of TEXT REFERENCES articles(id),
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_articles_source_published ON articles(source_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_review_published ON articles(review_status, published_at DESC);

CREATE TABLE IF NOT EXISTS article_matches (
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES monitoring_rules(id),
  evidence_json TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TEXT,
  PRIMARY KEY (article_id, rule_id)
);

CREATE TABLE IF NOT EXISTS collection_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES media_sources(id),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  result TEXT NOT NULL CHECK (result IN ('running', 'success', 'failed', 'skipped')),
  items_seen INTEGER NOT NULL DEFAULT 0,
  items_new INTEGER NOT NULL DEFAULT 0,
  error TEXT
);

CREATE VIRTUAL TABLE IF NOT EXISTS article_search USING fts5(title, excerpt, content='articles', content_rowid='rowid');

CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
  INSERT INTO article_search(rowid, title, excerpt) VALUES (new.rowid, new.title, new.excerpt);
END;
CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE OF title, excerpt ON articles BEGIN
  INSERT INTO article_search(article_search, rowid, title, excerpt) VALUES ('delete', old.rowid, old.title, old.excerpt);
  INSERT INTO article_search(rowid, title, excerpt) VALUES (new.rowid, new.title, new.excerpt);
END;
CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
  INSERT INTO article_search(article_search, rowid, title, excerpt) VALUES ('delete', old.rowid, old.title, old.excerpt);
END;
