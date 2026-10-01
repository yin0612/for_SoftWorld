import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFeedDate, sourceIsFresh } from './time-quality.mjs';

const now = Date.parse('2026-10-01T09:30:00Z');
test('confirmed Gamebase GMT label means Taipei wall time, also for historical rows', () => {
  const source = { id: 'gamebase', region: 'TW' };
  assert.equal(normalizeFeedDate('Thu, 01 Oct 2026 16:55:48 GMT', source, now), '2026-10-01T08:55:48.000Z');
  assert.equal(normalizeFeedDate('Wed, 30 Sep 2026 16:55:48 GMT', source, now), '2026-09-30T08:55:48.000Z');
});
test('undesignated dates use Taipei only for Taiwanese feeds, explicit offsets remain intact', () => {
  assert.equal(normalizeFeedDate('2026-10-01  03:10:09', { id: 'ithome', region: 'TW' }, now), '2026-09-30T19:10:09.000Z');
  assert.equal(normalizeFeedDate('2026-10-01 03:10:09', { region: 'GLOBAL' }, now), null);
  assert.equal(normalizeFeedDate('Thu, 01 Oct 2026 08:55:48 GMT', { region: 'GLOBAL' }, now), '2026-10-01T08:55:48.000Z');
});
test('unparseable and future timestamps are never published', () => {
  for (const value of ['', 'invalid', '2026-10-02T00:00:00Z']) assert.equal(normalizeFeedDate(value, {}, now), null);
  assert.equal(sourceIsFresh({ health_status: 'healthy', last_success_at: '2026-09-15T00:00:00Z' }, now), false);
});
