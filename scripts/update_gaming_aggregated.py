"""Refresh gaming queries concurrently while retaining all existing non-gaming metadata."""
import concurrent.futures
import json
import urllib.request
from datetime import timezone
from update_fintech_aggregated import (SOURCE_CONFIG, OUTPUT, RULE_CONFIG, taipei_now,
    google_feed_url, source_queries, parse_feed, load_huike_rules)


def main():
    previous = json.loads(OUTPUT.read_text(encoding='utf-8'))
    sources = json.loads(SOURCE_CONFIG.read_text(encoding='utf-8'))['sources']
    rules = load_huike_rules()
    fetched_at = taipei_now().astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
    start, end = previous['range']['from'], previous['range']['to']
    topics = {'game_new_release', 'game_ip_business', 'game_store_policy', 'game_platform_service', 'game_product_watch'}
    tasks = [(source, topic, terms) for source in sources if source.get('enabled') and source.get('auto_publish')
             and source.get('access_mode') == 'google_news_rss'
             for topic, terms, _ in source_queries(source) if topic in topics]

    def collect(task):
        source, topic, terms = task
        url = google_feed_url((source.get('domains') or [''])[0], start, end, terms, source)
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'SoftWorldMonitoring/1.0'})
            with urllib.request.urlopen(request, timeout=25) as response:
                rows, error = parse_feed(response.read(), source, url, fetched_at, rules)
            rows = [row for row in rows if start <= row['published_at'][:10] <= end]
            return rows, {'source_id': source['id'], 'topic': topic, 'checked_at': fetched_at,
                          'result': 'failed' if error else 'success', 'articles': len(rows), **({'error': error} if error else {})}
        except Exception as error:
            return [], {'source_id': source['id'], 'topic': topic, 'checked_at': fetched_at,
                        'result': 'failed', 'articles': 0, 'error': str(error)[:200]}

    articles = {row['url']: row for row in previous['articles']}
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        for rows, result in executor.map(collect, tasks):
            results.append(result)
            for row in rows:
                old = articles.get(row['url'])
                if old:
                    for key in ('rule_ids', 'folder_ids'):
                        row[key] = ','.join(dict.fromkeys(filter(None, (old.get(key, '') + ',' + row.get(key, '')).split(','))))
                    row['matched_terms'] = list(dict.fromkeys([*old.get('matched_terms', []), *row.get('matched_terms', [])]))
                articles[row['url']] = row
    if not any(result['result'] == 'success' for result in results):
        raise RuntimeError('All gaming queries failed; existing snapshot preserved')
    previous['articles'] = sorted(articles.values(), key=lambda row: row['published_at'], reverse=True)
    previous['article_count'] = len(articles)
    previous['quality_rules_version'] = json.loads(RULE_CONFIG.read_text(encoding='utf-8'))['version']
    # The global timestamp remains unchanged: only this subset has just been queried.
    previous['gaming_refresh'] = {'checked_at': fetched_at, 'queries': len(tasks), 'results': results}
    temporary = OUTPUT.with_suffix('.tmp')
    temporary.write_text(json.dumps(previous, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(OUTPUT)
    print(json.dumps({'queries': len(tasks), 'success': sum(r['result'] == 'success' for r in results),
                      'articles': len(articles), 'failed': [r for r in results if r['result'] == 'failed']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
