const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
});

function cors(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = env.CORS_ORIGIN || '';
  return origin && origin === allowed ? { 'access-control-allow-origin': origin, vary: 'Origin' } : {};
}

function normalize(text = '') {
  return text.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function parseRss(xml) {
  const entries = xml.match(/<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/gi) || [];
  const text = (block, tag) => (block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i')) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
  return entries.map((entry) => ({
    title: text(entry, 'title'),
    link: (entry.match(/<link[^>]*>([^<]+)<\/link>/i) || entry.match(/<link[^>]*href=["']([^"']+)/i) || [])[1] || '',
    publishedAt: text(entry, 'pubDate') || text(entry, 'published') || text(entry, 'updated'),
    excerpt: text(entry, 'description') || text(entry, 'summary')
  })).filter((item) => item.title && item.link);
}

function evaluateRule(article, rule) {
  const scope = rule.scope === 'title' ? article.title : rule.scope === 'lead' ? article.excerpt : `${article.title}\n${article.excerpt}`;
  const target = normalize(scope);
  const anyOf = JSON.parse(rule.any_of_json);
  const allOf = JSON.parse(rule.all_of_json);
  const excluded = JSON.parse(rule.exclude_any_json);
  const hits = (terms) => terms.filter((term) => target.includes(normalize(term)));
  const anyHits = hits(anyOf);
  const allHits = hits(allOf);
  const excludedHits = hits(excluded);
  const anyPass = anyOf.length === 0 || anyHits.length > 0;
  const allPass = allOf.length === 0 || allHits.length > 0;
  return anyPass && allPass && excludedHits.length === 0 ? { matched: true, evidence: { any_hits: anyHits, all_hits: allHits, scope: rule.scope } } : { matched: false };
}

async function collectSource(source, env) {
  const runId = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare('INSERT INTO collection_runs (id, source_id, started_at, result) VALUES (?, ?, ?, ?)').bind(runId, source.id, now, 'running').run();
  try {
    const response = await fetch(source.feed_url, { headers: { 'user-agent': 'SoftWorldMonitoring/1.0 (+https://yin0612.github.io/for_SoftWorld/)' } });
    if (!response.ok) throw new Error(`RSS HTTP ${response.status}`);
    const items = parseRss(await response.text());
    const rules = await env.DB.prepare('SELECT * FROM monitoring_rules WHERE active = 1').all();
    let added = 0;
    for (const item of items) {
      const canonicalUrl = new URL(item.link).toString();
      const article = { title: item.title, excerpt: item.excerpt, canonicalUrl };
      const matches = rules.results.map((rule) => ({ rule, result: evaluateRule(article, rule) })).filter(({ result }) => result.matched);
      if (!matches.length) continue;
      const id = crypto.randomUUID();
      const parsedDate = new Date(item.publishedAt);
      const publishedAt = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
      const insert = await env.DB.prepare(`INSERT OR IGNORE INTO articles
        (id, canonical_url, source_id, title, excerpt, published_at, fetched_at, review_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`).bind(id, canonicalUrl, source.id, item.title, item.excerpt || null, publishedAt, now).run();
      if (!insert.meta.changes) continue;
      added++;
      for (const { rule, result } of matches) {
        await env.DB.prepare('INSERT INTO article_matches (article_id, rule_id, evidence_json) VALUES (?, ?, ?)').bind(id, rule.id, JSON.stringify(result.evidence)).run();
      }
    }
    await env.DB.batch([
      env.DB.prepare('UPDATE media_sources SET last_success_at = ?, last_attempt_at = ?, health_status = ?, last_error = NULL WHERE id = ?').bind(now, now, 'healthy', source.id),
      env.DB.prepare('UPDATE collection_runs SET finished_at = ?, result = ?, items_seen = ?, items_new = ? WHERE id = ?').bind(now, 'success', items.length, added, runId)
    ]);
  } catch (error) {
    await env.DB.batch([
      env.DB.prepare('UPDATE media_sources SET last_attempt_at = ?, health_status = ?, last_error = ? WHERE id = ?').bind(now, 'error', String(error).slice(0, 500), source.id),
      env.DB.prepare('UPDATE collection_runs SET finished_at = ?, result = ?, error = ? WHERE id = ?').bind(now, 'failed', String(error).slice(0, 500), runId)
    ]);
  }
}

async function collectAll(env) {
  const sources = await env.DB.prepare("SELECT * FROM media_sources WHERE enabled = 1 AND access_mode = 'rss' AND feed_url IS NOT NULL").all();
  for (const source of sources.results) await collectSource(source, env);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { headers: { ...headers, 'access-control-allow-methods': 'GET, OPTIONS' } });
    if (url.pathname === '/api/health') {
      const result = await env.DB.prepare('SELECT health_status, COUNT(*) AS count, MAX(last_success_at) AS latest_success FROM media_sources GROUP BY health_status').all();
      return json({ sources: result.results }, 200, headers);
    }
    if (url.pathname === '/api/articles') {
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 30), 1), 100);
      const folder = url.searchParams.get('folder');
      const status = url.searchParams.get('status') || 'approved';
      const today = new Date();
      const defaultFrom = new Date(today);
      defaultFrom.setMonth(defaultFrom.getMonth() - 2);
      const from = url.searchParams.get('from') || defaultFrom.toISOString();
      const to = url.searchParams.get('to') || today.toISOString();
      const statement = folder
        ? `SELECT DISTINCT a.id, a.title, a.excerpt, a.canonical_url AS url, a.published_at, a.fetched_at, a.review_status, s.name AS source, r.folder_id, r.id AS rule_id, m.evidence_json
           FROM articles a JOIN media_sources s ON s.id=a.source_id JOIN article_matches m ON m.article_id=a.id JOIN monitoring_rules r ON r.id=m.rule_id
           WHERE a.review_status=? AND r.folder_id=? AND COALESCE(a.published_at, a.fetched_at) BETWEEN ? AND ? ORDER BY COALESCE(a.published_at, a.fetched_at) DESC LIMIT ?`
        : `SELECT DISTINCT a.id, a.title, a.excerpt, a.canonical_url AS url, a.published_at, a.fetched_at, a.review_status, s.name AS source, r.folder_id, r.id AS rule_id, m.evidence_json
           FROM articles a JOIN media_sources s ON s.id=a.source_id JOIN article_matches m ON m.article_id=a.id JOIN monitoring_rules r ON r.id=m.rule_id
           WHERE a.review_status=? AND COALESCE(a.published_at, a.fetched_at) BETWEEN ? AND ? ORDER BY COALESCE(a.published_at, a.fetched_at) DESC LIMIT ?`;
      const result = await env.DB.prepare(statement).bind(...(folder ? [status, folder, from, to, limit] : [status, from, to, limit])).all();
      return json({ articles: result.results, data_mode: 'verified_monitoring' }, 200, headers);
    }
    return json({ error: 'Not found' }, 404, headers);
  },
  async scheduled(_controller, env, ctx) { ctx.waitUntil(collectAll(env)); }
};
