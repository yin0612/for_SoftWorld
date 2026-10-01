-- MyCard is already a precise monitored brand; allow its RSS matches to publish.
UPDATE monitoring_rules
SET auto_publish_allowed_terms_json = json_insert(auto_publish_allowed_terms_json, '$[#]', 'MyCard')
WHERE id = 'softworld-brand'
  AND NOT EXISTS (SELECT 1 FROM json_each(auto_publish_allowed_terms_json) WHERE lower(value) = 'mycard');
