"""Generate idempotent D1 seed SQL from the versioned monitoring configuration.

Run from the repository root:
  python worker/scripts/build_seed_sql.py > worker/seed.sql
  npx wrangler d1 execute softworld-monitoring --remote --file=worker/seed.sql
"""
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RULES = json.loads((ROOT / 'config' / 'monitoring_rules.json').read_text(encoding='utf-8'))
SOURCES = json.loads((ROOT / 'config' / 'core_media_sources.json').read_text(encoding='utf-8'))
CATALOG = json.loads((ROOT / 'config' / 'media_catalog.json').read_text(encoding='utf-8'))


def sql_string(value):
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def emit_upsert(table, columns, values, update_columns):
    assignments = ', '.join(f'{column}=excluded.{column}' for column in update_columns)
    print(
        f"INSERT INTO {table} ({', '.join(columns)}) VALUES "
        f"({', '.join(sql_string(value) for value in values)}) "
        f"ON CONFLICT(id) DO UPDATE SET {assignments};"
    )


for folder in RULES['folders']:
    columns = ['id', 'name', 'region_scope_json', 'priority', 'description', 'version']
    values = [
        folder['id'], folder['name'], json.dumps(folder['region_scope'], ensure_ascii=False),
        folder['priority'], folder['description'], RULES['version']
    ]
    emit_upsert('monitoring_folders', columns, values, columns[1:])


for rule in RULES['rules']:
    groups = rule['required_any_groups']
    if not groups or len(groups) > 2:
        raise ValueError(f"Rule {rule['id']} must have one or two required_any_groups")
    # Existing D1 columns are retained for compatibility. They represent two OR-groups joined by AND.
    any_of = groups[0]
    all_of = groups[1] if len(groups) == 2 else []
    exclude = list(dict.fromkeys([*RULES.get('global_exclude_any', []), *rule.get('exclude_any', [])]))
    columns = ['id', 'folder_id', 'scope', 'any_of_json', 'all_of_json', 'exclude_any_json', 'version', 'auto_publish', 'active']
    values = [
        rule['id'], rule['folder_id'], rule['scope'], json.dumps(any_of, ensure_ascii=False),
        json.dumps(all_of, ensure_ascii=False), json.dumps(exclude, ensure_ascii=False), RULES['version'],
        int(rule['id'] in RULES.get('automatic_publication_rule_ids', [])), 1
    ]
    emit_upsert('monitoring_rules', columns, values, columns[1:])


# The three names below were superseded by the complete Word-derived rules.
# Retire them rather than deleting historical evidence should this seed be rerun.
retired_rule_ids = RULES.get('retired_rule_ids', [])
if retired_rule_ids:
    print(
        'UPDATE monitoring_rules SET active = 0, auto_publish = 0 '
        f"WHERE id IN ({', '.join(sql_string(rule_id) for rule_id in retired_rule_ids)});"
    )


for source in SOURCES['sources']:
    columns = ['id', 'name', 'domain', 'region', 'type', 'access_mode', 'feed_url', 'tier', 'enabled', 'auto_publish']
    values = [
        source['id'], source['name'], source['domain'], source['region'], source['type'],
        source['access_mode'], source.get('feed_url'), source['tier'],
        # An enabled source is published automatically only after its RSS has been
        # verified.  This prevents a future draft/manual source from silently
        # becoming a public news feed merely because its metadata is added here.
        int(source['enabled'] and source.get('auto_publish', False)),
        int(source.get('auto_publish', False))
    ]
    # UPSERT deliberately preserves last success, attempts, and error history.
    emit_upsert('media_sources', columns, values, columns[1:])


sources_by_document_name = {}
for source in SOURCES['sources']:
    if source.get('document_name'):
        sources_by_document_name.setdefault(source['document_name'], []).append(source)
new_in_2025 = set(CATALOG.get('new_in_2025', []))

for group in CATALOG['groups']:
    for index, item in enumerate(group['sources'], start=1):
        if isinstance(item, str):
            name, url = item, None
        else:
            name, url = item['name'], item.get('url')
        configured = [
            source for source in sources_by_document_name.get(name, [])
            if not url or not source.get('catalog_url') or source.get('catalog_url') == url
        ]
        verified = [
            source for source in configured
            if source['enabled'] and source.get('auto_publish', False) and source['access_mode'] == 'rss'
        ]
        columns = ['id', 'document_name', 'region', 'category', 'document_url', 'is_new_2025', 'onboarding_status', 'source_id', 'version']
        values = [
            f"{group['id']}-{index:03d}", name, group['region'], group['category'], url,
            int(name in new_in_2025), 'verified_rss' if verified else 'manual_or_authorized',
            verified[0]['id'] if verified else None, CATALOG['version']
        ]
        emit_upsert('monitoring_media_catalog', columns, values, columns[1:])
