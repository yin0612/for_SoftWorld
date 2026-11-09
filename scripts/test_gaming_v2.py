import unittest
import update_fintech_aggregated as aggregation


class GamingV2Tests(unittest.TestCase):
    def test_new_queries_are_opted_in_and_keep_old_default_topics(self):
        defaults = [topic for topic, _, _ in aggregation.source_queries({})]
        self.assertIn('game_approval', defaults)
        self.assertNotIn('game_store_policy', defaults)
        opted = [topic for topic, _, _ in aggregation.source_queries({'query_topics': ['game_store_policy']})]
        self.assertEqual(opted, ['game_store_policy'])

    def test_precise_title_rules_support_policy_games_and_reject_indexes(self):
        rules = aggregation.load_huike_rules()
        for title, expected in [('Apple宣布台灣App Store抽成調降', 'industry-game-store-policy'),
                                ('全新MMORPG手遊開放事前預約', 'industry-game-release'),
                                ('YouTube遊戲角落Playables登場', 'industry-game-instant')]:
            self.assertIn(expected, [rule['id'] for rule, _ in aggregation.classify_huike_title(title, rules)])
        self.assertEqual(aggregation.classify_huike_title('討論牆 | YouTube遊戲角落Playables登場', rules), [])


if __name__ == '__main__':
    unittest.main()
