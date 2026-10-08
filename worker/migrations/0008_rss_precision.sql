-- Publication policy is enforced by the shared rule engine and source config.
-- Advance the version without replacing source health or review history.
UPDATE monitoring_rules SET version = '2026-10-08-rss-precision-v1';
UPDATE monitoring_folders SET version = '2026-10-08-rss-precision-v1';
