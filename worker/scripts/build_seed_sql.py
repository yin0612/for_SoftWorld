"""Generate idempotent D1 seed SQL from the versioned monitoring configuration.

Usage (from repository root):
  python worker/scripts/build_seed_sql.py > worker/seed.sql
  npx wrangler d1 execute softworld-monitoring --remote --file=worker/seed.sql
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RULES = json.loads((ROOT / 'config' / 'monitoring_rules.json').read_text(encoding='utf-8'))
SOURCES = json.loads((ROOT / 'config' / 'core_media_sources.json').read_text(encoding='utf-8'))


def sql_string(value):
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


for rule in RULES['rules']:
    values = [
        rule['id'], rule['folder_id'], rule['scope'],
        json.dumps(rule['any_of'], ensure_ascii=False),
        json.dumps(rule['all_of'], ensure_ascii=False),
        json.dumps(rule['exclude_any'], ensure_ascii=False),
        RULES['version']
    ]
    print('INSERT OR REPLACE INTO monitoring_rules '
          '(id, folder_id, scope, any_of_json, all_of_json, exclude_any_json, version, active) VALUES '
          f"({', '.join(sql_string(v) for v in values)}, 1);")

for source in SOURCES['sources']:
    values = [
        source['id'], source['name'], source['domain'], source['region'], source['type'],
        source['access_mode'], source.get('feed_url'), source['tier'], int(source['enabled'])
    ]
    print('INSERT OR REPLACE INTO media_sources '
          '(id, name, domain, region, type, access_mode, feed_url, tier, enabled) VALUES '
          f"({', '.join(sql_string(v) for v in values)});")
