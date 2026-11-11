INSERT INTO monitoring_rules (id, folder_id, scope, any_of_json, all_of_json, exclude_any_json, version, auto_publish, auto_publish_allowed_terms_json, active)
VALUES ('fsc-payments', 'folder_2', 'full_text', '["行動支付", "電子支付", "行動付款", "電支機構", "mobile payment", "mobile payments", "electronic payment", "electronic payments"]', '[]', '["大宇紡織"]', '2026-11-09-gaming-v2', '1', '[]', '1')
ON CONFLICT(id) DO UPDATE SET folder_id=excluded.folder_id, scope=excluded.scope, any_of_json=excluded.any_of_json, all_of_json=excluded.all_of_json, exclude_any_json=excluded.exclude_any_json, version=excluded.version, auto_publish=excluded.auto_publish, auto_publish_allowed_terms_json=excluded.auto_publish_allowed_terms_json, active=excluded.active;

INSERT INTO monitoring_rules (id, folder_id, scope, any_of_json, all_of_json, exclude_any_json, version, auto_publish, auto_publish_allowed_terms_json, active)
VALUES ('fsc-stablecoin-vasp', 'folder_6', 'full_text', '["穩定幣", "stablecoin", "stablecoins", "stable coin", "stable coins", "VASP", "VASPs", "虛擬資產服務商", "虛擬資產服務提供者", "提供虛擬資產服務之事業或人員", "Virtual Asset Service Provider", "Virtual Asset Service Providers"]', '[]', '["大宇紡織"]', '2026-11-09-gaming-v2', '1', '[]', '1')
ON CONFLICT(id) DO UPDATE SET folder_id=excluded.folder_id, scope=excluded.scope, any_of_json=excluded.any_of_json, all_of_json=excluded.all_of_json, exclude_any_json=excluded.exclude_any_json, version=excluded.version, auto_publish=excluded.auto_publish, auto_publish_allowed_terms_json=excluded.auto_publish_allowed_terms_json, active=excluded.active;

INSERT INTO media_sources (id, name, domain, region, type, access_mode, feed_url, tier, enabled, auto_publish)
VALUES ('fsc-news', '金管會 新聞稿', 'fsc.gov.tw', 'TW', 'official', 'rss', 'https://www.fsc.gov.tw/RSS/Messages?serno=201202290009&language=chinese', 'A', '1', '1')
ON CONFLICT(id) DO UPDATE SET name=excluded.name, domain=excluded.domain, region=excluded.region, type=excluded.type, access_mode=excluded.access_mode, feed_url=excluded.feed_url, tier=excluded.tier, enabled=excluded.enabled, auto_publish=excluded.auto_publish;

INSERT INTO media_sources (id, name, domain, region, type, access_mode, feed_url, tier, enabled, auto_publish)
VALUES ('fsc-draft-regulations', '金管會 法規草案預告', 'fsc.gov.tw', 'TW', 'official', 'rss', 'https://www.fsc.gov.tw/RSS/Noticelaw?serno=201202290010&language=chinese', 'A', '1', '1')
ON CONFLICT(id) DO UPDATE SET name=excluded.name, domain=excluded.domain, region=excluded.region, type=excluded.type, access_mode=excluded.access_mode, feed_url=excluded.feed_url, tier=excluded.tier, enabled=excluded.enabled, auto_publish=excluded.auto_publish;
