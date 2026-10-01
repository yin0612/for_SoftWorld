import unittest
from update_fintech_aggregated import parse_feed
from verify_sources import allowed


class SourceVerificationTests(unittest.TestCase):
    def feed(self, publisher='https://money.udn.com', link='https://news.google.com/rss/articles/test'):
        return f'<rss><channel><item><title>藍新科技金流服務 - 經濟日報</title><link>{link}</link><pubDate>Thu, 01 Oct 2026 00:00:00 GMT</pubDate><source url="{publisher}">經濟日報</source></item></channel></rss>'.encode()

    def test_google_checks_actual_publisher(self):
        source = {'id': 'test', 'name': '經濟日報', 'domains': ['money.udn.com']}
        rows, error = parse_feed(self.feed(), source, 'https://news.google.com/rss', '2026-10-01T00:00:00Z', [])
        self.assertIsNone(error)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['source_kind'], 'google_news_rss')
        for publisher in ['https://money.udn.com.evil.test', 'https://evil.test', '', 'javascript:alert(1)']:
            self.assertEqual(parse_feed(self.feed(publisher), source, '', '', [])[0], [])
        self.assertEqual(parse_feed(self.feed(link='javascript:alert(1)'), source, '', '', [])[0], [])

    def test_domain_boundaries(self):
        self.assertTrue(allowed('https://ec.ltn.com.tw/a', ['ltn.com.tw']))
        self.assertFalse(allowed('https://ltn.com.tw.evil.test/a', ['ltn.com.tw']))
        self.assertFalse(allowed('https://ltn.com.tw@evil.test/a', ['ltn.com.tw']))


if __name__ == '__main__':
    unittest.main()
