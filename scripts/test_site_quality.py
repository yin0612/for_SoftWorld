import unittest
import tempfile
import json
from pathlib import Path
from unittest.mock import patch
import update_fintech_aggregated as aggregation
from datetime import datetime, timezone
from check_site import inspect_dataset
from update_fintech_aggregated import parse_feed

class SiteQualityTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 10, 1, 9, tzinfo=timezone.utc)
        self.status = {"source_summary": {"latest_success": "2026-10-01T08:17:00Z"}, "enabled_sources": []}
        self.payload = {"total": 1, "articles": [{"title": "藍新科技", "source": "媒體", "url": "https://example.com/news", "published_at": "2026-10-01T08:00:00Z"}], "aggregated_snapshot": {"generated_at": "2026-10-01T04:00:00Z"}}

    def test_valid_dataset_and_stale_checks(self):
        self.assertEqual(inspect_dataset(self.payload, self.status, self.now)["errors"], [])
        self.payload["aggregated_snapshot"]["generated_at"] = "2026-09-30T04:00:00Z"
        self.assertIn("Google News snapshot is overdue", inspect_dataset(self.payload, self.status, self.now)["errors"])

    def test_future_dates_duplicates_and_wrong_totals_fail(self):
        self.payload["articles"][0]["published_at"] = "2026-10-02T08:00:00Z"
        self.payload["articles"] *= 2
        errors = inspect_dataset(self.payload, self.status, self.now)["errors"]
        self.assertIn("Future article timestamp", errors)
        self.assertIn("Duplicate article URL", errors)
        self.assertIn("Article total differs from returned list", errors)

    def test_google_future_date_rejected(self):
        source = {"id": "test", "name": "媒體", "domains": ["example.com"]}
        raw = b'<rss><channel><item><title>LINE Pay</title><link>https://news.google.com/rss/articles/abc</link><pubDate>Fri, 02 Oct 2026 00:00:00 GMT</pubDate><source url="https://example.com">Media</source></item></channel></rss>'
        self.assertEqual(parse_feed(raw, source, '', '2026-10-01T09:00:00Z', [])[0], [])

    def test_total_upstream_failure_preserves_previous_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            config = Path(directory) / 'sources.json'
            output = Path(directory) / 'snapshot.json'
            config.write_text(json.dumps({'sources': [{'id': 'test', 'enabled': True, 'auto_publish': True, 'access_mode': 'google_news_rss', 'domains': ['example.com'], 'query_topics': ['payment']}]}), encoding='utf-8')
            output.write_text('{"previous": true}', encoding='utf-8')
            with patch.object(aggregation, 'SOURCE_CONFIG', config), patch.object(aggregation, 'OUTPUT', output), patch.object(aggregation.urllib.request, 'urlopen', side_effect=OSError('offline')):
                with self.assertRaisesRegex(RuntimeError, 'preserving'):
                    aggregation.main()
            self.assertEqual(output.read_text(encoding='utf-8'), '{"previous": true}')

if __name__ == '__main__':
    unittest.main()
