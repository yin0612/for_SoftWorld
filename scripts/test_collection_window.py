import unittest
from datetime import datetime
import update_fintech_aggregated as aggregation


class CollectionWindowTests(unittest.TestCase):
    def test_calendar_month_clamps_month_end_and_crosses_year(self):
        for today, expected in [
            ('2026-11-20', '2026-10-20'), ('2026-01-31', '2025-12-31'),
            ('2026-03-31', '2026-02-28'), ('2024-03-31', '2024-02-29'),
        ]:
            start, end = aggregation.collection_date_range(datetime.fromisoformat(today))
            self.assertEqual(start.isoformat(), expected)
            self.assertEqual(end.isoformat(), today)

    def test_fresh_and_preserved_rows_use_taipei_dates_and_reject_future(self):
        now = datetime.fromisoformat('2026-11-20T12:00:00+08:00')
        start, end = aggregation.collection_date_range(now)
        for published, expected in [
            ('2026-10-19T15:59:59Z', False), ('2026-10-19T16:00:00Z', True),
            ('2026-09-20T00:00:00Z', False), ('2026-11-20T04:00:01Z', False),
            ('invalid', False),
        ]:
            self.assertEqual(aggregation.within_collection_range(
                {'published_at': published}, start, end, now), expected, published)
