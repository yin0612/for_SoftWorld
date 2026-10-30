import json
import sqlite3
import unittest
from urllib.parse import parse_qs, urlparse
import update_fintech_aggregated as aggregation


class AICommerceTests(unittest.TestCase):
    def setUp(self):
        self.rules = [r for r in aggregation.load_huike_rules() if r['id'] == 'industry-ai-commerce']
        sources = json.loads(aggregation.SOURCE_CONFIG.read_text(encoding='utf-8'))['sources']
        self.source = next(s for s in sources if s['id'] == 'xfastest-google-news')

    def test_title_classification_requires_both_groups(self):
        for title in ['LINE 結合 AI，打造購物助手', 'AI Agent 為商家與線上購物提供服務', '人工智慧客服上線']:
            self.assertEqual(len(aggregation.classify_huike_title(title, self.rules)), 1)
        for title in ['LINE 購物促銷', 'AI 模型發布', 'Taiwan shopping festival']:
            self.assertEqual(aggregation.classify_huike_title(title, self.rules), [])

    def test_xfastest_query_requires_ai_and_commerce_and_keeps_domain(self):
        queries = [terms for topic, terms, _ in aggregation.source_queries(self.source) if topic == 'ai_commerce']
        self.assertEqual(len(queries), 1)
        params = parse_qs(urlparse(aggregation.google_feed_url('xfastest.com', '2026-08-30', '2026-10-30', queries[0])).query)
        query = params['q'][0]
        self.assertIn('site:xfastest.com', query)
        self.assertIn('AI', query)
        self.assertIn(') (購物 OR', query)
        self.assertIn('before:2026-10-31', query)

    def test_google_rss_accepts_news_subdomain_and_preserves_provenance(self):
        def feed(domain):
            return (f'<rss><channel><item><title>LINE AI Agent 提供購物推薦 - XFastest</title>'
                    f'<link>https://news.google.com/rss/articles/fixture</link>'
                    f'<pubDate>Tue, 13 Oct 2026 04:00:00 GMT</pubDate>'
                    f'<source url="https://{domain}">XFastest</source></item></channel></rss>').encode()
        rows, error = aggregation.parse_feed(feed('news.xfastest.com'), self.source, '', '2026-10-30T00:00:00Z', self.rules)
        self.assertIsNone(error)
        self.assertEqual(rows[0]['rule_ids'], 'industry-ai-commerce')
        self.assertEqual(rows[0]['folder_ids'], 'folder_4')
        self.assertEqual(rows[0]['source_kind'], 'google_news_rss')
        self.assertEqual(aggregation.parse_feed(feed('xfastest.com.evil.test'), self.source, '', '', self.rules)[0], [])

    def test_database_migration_matches_configuration_and_is_idempotent(self):
        db = sqlite3.connect(':memory:')
        db.executescript((aggregation.ROOT / 'worker/schema.sql').read_text(encoding='utf-8'))
        migration = (aggregation.ROOT / 'worker/migrations/0009_ai_commerce.sql').read_text(encoding='utf-8')
        for _ in range(2):
            db.executescript(migration)
        row = db.execute("SELECT any_of_json, all_of_json, auto_publish FROM monitoring_rules WHERE id='industry-ai-commerce'").fetchone()
        self.assertEqual([json.loads(row[0]), json.loads(row[1])], self.rules[0]['required_any_groups'])
        self.assertEqual(row[2], 1)
