import json
import unittest
from datetime import datetime, timezone
from company_coverage import COMPANIES, ROOT, browser_config
from update_fintech_aggregated import source_queries, load_huike_rules, classify_huike_title, parse_feed, company_check
from check_site import inspect_company_checks


class CompanyCoverageTests(unittest.TestCase):
    def test_browser_registry_is_current(self):
        self.assertEqual((ROOT / 'js/coverage-companies.js').read_text(encoding='utf-8'), browser_config())

    def test_every_company_has_an_enabled_individual_query_and_publication_rule(self):
        config = json.loads((ROOT / 'config/fintech_media_sources.json').read_text(encoding='utf-8'))
        source = next(s for s in config['sources'] if s.get('company_queries'))
        self.assertTrue(source['enabled'] and source['auto_publish'])
        self.assertTrue(source['publisher_domains'])
        queries = source_queries(source)
        self.assertEqual({c['id'] for _, _, c in queries if c}, {c['id'] for c in COMPANIES})
        rules = load_huike_rules()
        for company in COMPANIES:
            self.assertTrue(company['reference_url'].startswith('https://'))
            for alias in company['aliases']:
                matches = classify_huike_title(alias + ' 發布消息', rules)
                self.assertTrue(any(r['id'] == 'softworld-brand' for r, _ in matches), alias)

    def test_individual_query_distinguishes_empty_results_from_failure(self):
        company = next(c for c in COMPANIES if c['id'] == 'cservice')
        self.assertEqual(company_check(company, 'https://news.google.com/rss', '2026-10-05T04:00:00Z', [])['status'], 'empty')
        self.assertEqual(company_check(company, 'https://news.google.com/rss', '2026-10-05T04:00:00Z', [], 'offline')['status'], 'unavailable')

    def test_daily_health_check_accepts_zero_news_but_detects_missing_and_stale_queries(self):
        now = datetime(2026, 10, 5, 4, tzinfo=timezone.utc)
        payload = {'companies': [company_check(c, 'https://news.google.com/rss/search?q=x', now.isoformat(), []) for c in COMPANIES]}
        self.assertEqual(inspect_company_checks(payload, now), [])
        payload['companies'][0]['checked_at'] = '2026-10-04T04:00:00Z'
        self.assertTrue(any('overdue' in e for e in inspect_company_checks(payload, now)))
        payload['companies'].pop()
        self.assertTrue(any('incomplete' in e for e in inspect_company_checks(payload, now)))

    def test_company_news_requires_approved_publisher_and_timestamp(self):
        source = {'id': 'test', 'name': '媒體', 'publisher_domains': ['udn.com'], 'strict_huike_only': True}
        def feed(domain, date='Mon, 05 Oct 2026 03:00:00 GMT'):
            return f'<rss><channel><item><title>群心網路推出服務</title><link>https://news.google.com/rss/articles/a</link><pubDate>{date}</pubDate><source url="https://{domain}">經濟日報</source></item></channel></rss>'.encode()
        rules = load_huike_rules()
        self.assertEqual(len(parse_feed(feed('money.udn.com'), source, '', '2026-10-05T04:00:00Z', rules)[0]), 1)
        self.assertEqual(parse_feed(feed('udn.com.evil.example'), source, '', '2026-10-05T04:00:00Z', rules)[0], [])
        self.assertEqual(parse_feed(feed('money.udn.com', 'invalid'), source, '', '2026-10-05T04:00:00Z', rules)[0], [])


if __name__ == '__main__':
    unittest.main()
