import json
import unittest
from urllib.parse import urlparse, parse_qs
import update_fintech_aggregated as aggregation


class GameApprovalTests(unittest.TestCase):
    def setUp(self):
        self.rules = [rule for rule in aggregation.load_huike_rules()
                      if rule['id'] == 'industry-cn-game-approval']

    def test_real_headlines_and_official_announcements_match_both_scripts(self):
        for title in ['九月份版号名单出炉！米哈游《源初之结》过审',
                      '2026 年 9 月 209 款游戏版号下发，米哈游《源初之结》过审',
                      '9月209款游戏版号下发，米哈游《源初之结》、祖龙《诡秘之主：愚者》在列',
                      '國產遊戲版號公布：《熱血江湖：重啟》獲批',
                      '2026年9月份国产网络游戏审批信息',
                      '2026年进口网络游戏审批信息', '2026年游戏审批变更信息']:
            with self.subTest(title=title):
                self.assertEqual(len(aggregation.classify_huike_title(title, self.rules)), 1)

    def test_unrelated_approval_and_book_version_numbers_do_not_match(self):
        for title in ['国产电影版号获批', '进口图书版号下发', '现代坦克通过军事验收',
                      '游戏客户端版本号更新', '米哈游新作开始预约', '国家新闻出版署公布图书ISBN',
                      '上市公司IPO获批', '源初之结加速器与充值优惠']:
            with self.subTest(title=title):
                self.assertEqual(aggregation.classify_huike_title(title, self.rules), [])

    def test_dedicated_query_does_not_change_existing_taiwan_queries(self):
        approval = parse_qs(urlparse(aggregation.google_feed_url(
            'news.17173.com', '2026-08-06', '2026-10-06', aggregation.QUERY_GAME_APPROVAL_TERMS)).query)
        self.assertEqual(approval['hl'], ['zh-CN'])
        self.assertIn('before:2026-10-07', approval['q'][0])
        existing = parse_qs(urlparse(aggregation.google_feed_url(
            '17173.com', '2026-08-06', '2026-10-06', aggregation.QUERY_COMPETITOR_TERMS)).query)
        self.assertEqual(existing['hl'], ['zh-TW'])
        self.assertEqual(existing['gl'], ['TW'])

    def test_google_provenance_and_domain_validation_are_preserved(self):
        source = {'id': 'ithome-cn-google-news', 'name': 'IT之家', 'domains': ['ithome.com']}
        def feed(domain):
            return ('<rss><channel><item><title>209款游戏版号下发 - IT之家</title>'
                    '<link>https://news.google.com/rss/articles/test</link>'
                    '<pubDate>Wed, 30 Sep 2026 10:04:11 GMT</pubDate>'
                    f'<source url="https://{domain}">IT之家</source>'
                    '</item></channel></rss>').encode()
        rows, error = aggregation.parse_feed(feed('www.ithome.com'), source, '',
                                             '2026-10-06T00:00:00Z', self.rules)
        self.assertIsNone(error)
        self.assertEqual(rows[0]['rule_ids'], 'industry-cn-game-approval')
        self.assertEqual(rows[0]['source_kind'], 'google_news_rss')
        self.assertEqual(aggregation.parse_feed(feed('ithome.com.evil.test'), source, '', '', self.rules)[0], [])


if __name__ == '__main__':
    unittest.main()
