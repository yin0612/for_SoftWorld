-- Apply once only to a D1 database created before the rule-level precision
-- allowlist was added. New databases receive this column from schema.sql.
ALTER TABLE monitoring_rules ADD COLUMN auto_publish_allowed_terms_json TEXT NOT NULL DEFAULT '[]';
