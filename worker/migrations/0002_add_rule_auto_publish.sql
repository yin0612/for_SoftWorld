-- Apply once only to a D1 database created before auto_publish was added to monitoring_rules.
-- New databases receive this column directly from schema.sql.
ALTER TABLE monitoring_rules ADD COLUMN auto_publish INTEGER NOT NULL DEFAULT 0 CHECK (auto_publish IN (0, 1));
