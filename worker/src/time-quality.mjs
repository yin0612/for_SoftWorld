// Only the confirmed Gamebase feed labels Taipei wall time as GMT.
export function normalizeFeedDate(value, source = {}, now = Date.now()) {
  if (!value) return null;
  let raw = String(value).trim().replace(/\s+/g, ' ');
  if (source.id === 'gamebase' && /\bGMT\s*$/i.test(raw)) raw = raw.replace(/GMT\s*$/i, '+0800');
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?$/.test(raw)) {
    if (source.region !== 'TW') return null;
    raw = raw.replace(' ', 'T') + '+08:00';
  }
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) && timestamp <= now ? new Date(timestamp).toISOString() : null;
}

export function sourceIsFresh(source, now = Date.now()) {
  const time = Date.parse(source.last_success_at);
  return source.health_status === 'healthy' && Number.isFinite(time) && time <= now && now - time <= 2 * 60 * 60 * 1000;
}
