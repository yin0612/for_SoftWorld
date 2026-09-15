const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
});

// Some publisher feeds retain years of entries. Bound each run to the most
// recent feed entries so a newly enabled source cannot overwhelm D1.
const MAX_RSS_ITEMS_PER_SOURCE = 200;

function cors(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = env.CORS_ORIGIN || '';
  return origin && origin === allowed ? { 'access-control-allow-origin': origin, vary: 'Origin' } : {};
}

function normalize(text = '') {
  return text.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function decodeEntities(text = '') {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
  let decoded = String(text);
  let previous;
  do {
    previous = decoded;
    decoded = decoded.replace(/&(#39|amp|lt|gt|quot|apos|nbsp);/gi, (_match, entity) => entities[entity.toLowerCase()] || _match);
  } while (decoded !== previous);
  return decoded;
}

function textFromXml(value = '') {
  return decodeEntities(value
    .replace(/<\/?(?:p|div|br|li|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n[ \t]*\n+/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim());
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? textFromXml(match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '')) : '';
}

function parseRss(xml) {
  const entries = xml.match(/<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/gi) || [];
  return entries.map((entry) => {
    // RSS publishers commonly wrap links in CDATA, while Atom uses href.
    // extractTag handles both plain and CDATA-wrapped RSS text links.
    const rawLink = (entry.match(/<link[^>]*href=["']([^"']+)/i) || [])[1] || extractTag(entry, 'link');
    const textParts = [
      extractTag(entry, 'description'),
      extractTag(entry, 'summary'),
      extractTag(entry, 'content:encoded')
    ].filter(Boolean);
    return {
      title: extractTag(entry, 'title'),
      link: decodeEntities(rawLink).trim(),
      publishedAt: extractTag(entry, 'pubDate') || extractTag(entry, 'published') || extractTag(entry, 'updated'),
      // A number of publishers put their useful lead in description and the
      // attributable RSS body in content:encoded. Keep both for matching.
      excerpt: [...new Set(textParts)].join('\n\n')
    };
  }).filter((item) => item.title && item.link).slice(0, MAX_RSS_ITEMS_PER_SOURCE);
}

function taipeiDate(date = new Date()) {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function subtractCalendarMonths(dateString, months) {
  const [year, month, day] = dateString.split('-').map(Number);
  const monthIndex = year * 12 + month - 1 - months;
  const targetYear = Math.floor(monthIndex / 12);
  const targetMonth = (monthIndex % 12) + 1;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

function parseTaipeiDate(value, fallback) {
  if (!value) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00+08:00`);
    return Number.isNaN(parsed.getTime()) || taipeiDate(parsed) !== value ? fallback : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : taipeiDate(parsed);
}

function articleQueryRange(searchParams) {
  const today = taipeiDate();
  const earliest = subtractCalendarMonths(today, 2);
  const clamp = (date) => date < earliest ? earliest : date > today ? today : date;
  let fromDate = clamp(parseTaipeiDate(searchParams.get('from'), earliest));
  let toDate = clamp(parseTaipeiDate(searchParams.get('to'), today));
  if (fromDate > toDate) toDate = fromDate;
  const boundary = (date, endOfDay) => new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}+08:00`).toISOString();
  return { fromDate, toDate, from: boundary(fromDate, false), to: boundary(toDate, true) };
}

function isWithinCollectionWindow(publishedAt) {
  const publishedDay = parseTaipeiDate(publishedAt, '');
  if (!publishedDay) return false;
  const today = taipeiDate();
  const earliest = subtractCalendarMonths(today, 2);
  return publishedDay >= earliest && publishedDay <= today;
}

function parseJson(value, fallback) {
  try { return JSON.parse(value); } catch (_) { return fallback; }
}

function ruleTargets(article, scope) {
  const title = article.title || '';
  const paragraphs = (article.excerpt || '').split(/\n{2,}/).map((text) => text.trim()).filter(Boolean);
  const lead = paragraphs[0] || article.excerpt || '';
  if (scope === 'title') return [{ label: 'title', text: title }];
  if (scope === 'lead') return [{ label: 'rss_excerpt', text: lead }];
  if (scope === 'title_or_lead') return [{ label: 'title', text: title }, { label: 'rss_excerpt', text: lead }];
  if (scope === 'paragraph') return [{ label: 'title', text: title }, ...paragraphs.map((text, index) => ({ label: `rss_paragraph_${index + 1}`, text }))];
  return [{ label: 'title_and_rss_excerpt', text: `${title}\n${article.excerpt || ''}` }];
}

function evaluateRule(article, rule) {
  const requiredAnyGroups = [parseJson(rule.any_of_json, []), parseJson(rule.all_of_json, [])].filter((group) => group.length);
  const excluded = parseJson(rule.exclude_any_json, []);
  for (const target of ruleTargets(article, rule.scope)) {
    const normalizedTarget = normalize(target.text);
    const hits = (terms) => terms.filter((term) => normalizedTarget.includes(normalize(term)));
    const groupHits = requiredAnyGroups.map(hits);
    const excludedHits = hits(excluded);
    const matched = groupHits.every((group) => group.length > 0) && excludedHits.length === 0;
    if (matched) {
      return {
        matched: true,
        evidence: {
          matched_scope: target.label,
          required_any_group_hits: groupHits,
          any_hits: groupHits[0] || [],
          all_hits: groupHits[1] || [],
          excluded_hits: excludedHits
        }
      };
    }
  }
  return { matched: false };
}

function ruleAutoPublishes(rule, evidence) {
  if (Number(rule.auto_publish) !== 1) return false;
  const allowedTerms = parseJson(rule.auto_publish_allowed_terms_json, []);
  if (!Array.isArray(allowedTerms) || allowedTerms.length === 0) return true;
  const allowed = new Set(allowedTerms.map(normalize));
  const groupHits = Array.isArray(evidence?.required_any_group_hits)
    ? evidence.required_any_group_hits.flat()
    : [];
  return groupHits.some((term) => allowed.has(normalize(term)));
}

function ruleAllowsSource(rule, source) {
  const allowedRegions = parseJson(rule.region_scope_json || '[]', []);
  return allowedRegions.length === 0 || allowedRegions.includes(source.region);
}

async function activeRules(env) {
  const result = await env.DB.prepare(`SELECT r.*, f.region_scope_json
    FROM monitoring_rules r
    LEFT JOIN monitoring_folders f ON f.id = r.folder_id
    WHERE r.active = 1`).all();
  return result.results;
}

async function collectSource(source, rules, env) {
  const runId = crypto.randomUUID();
  const now = new Date().toISOString();
  let started = false;
  try {
    await env.DB.prepare('INSERT INTO collection_runs (id, source_id, started_at, result) VALUES (?, ?, ?, ?)').bind(runId, source.id, now, 'running').run();
    started = true;
    const response = await fetch(source.feed_url, {
      headers: {
        'user-agent': 'SoftWorldMonitoring/1.0 (+https://yin0612.github.io/for_SoftWorld/)',
        accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.8'
      }
    });
    if (!response.ok) throw new Error(`RSS HTTP ${response.status}`);
    const items = parseRss(await response.text());
    const sourceRules = rules.filter((rule) => ruleAllowsSource(rule, source));
    let added = 0;

    for (const item of items) {
      const parsedDate = new Date(item.publishedAt);
      if (Number.isNaN(parsedDate.getTime())) continue;
      const publishedAt = parsedDate.toISOString();
      // The database itself observes the same rolling two-month window as the public API.
      if (!isWithinCollectionWindow(publishedAt)) continue;
      const canonicalUrl = new URL(item.link, source.feed_url).toString();
      const article = { title: item.title, excerpt: item.excerpt, canonicalUrl };
      const matches = sourceRules.map((rule) => ({ rule, result: evaluateRule(article, rule) })).filter(({ result }) => result.matched);
      if (!matches.length) continue;
      const hasPublishableMatch = matches.some(({ rule, result }) => ruleAutoPublishes(rule, result.evidence));

      const existing = await env.DB.prepare('SELECT id FROM articles WHERE canonical_url = ?').bind(canonicalUrl).first();
      const articleId = existing?.id || crypto.randomUUID();
      if (existing) {
        await env.DB.prepare(`UPDATE articles
          SET title = ?, excerpt = ?, published_at = COALESCE(?, published_at), fetched_at = ?,
              review_status = CASE
                WHEN review_status = 'rejected' THEN 'rejected'
                ELSE review_status
              END
          WHERE id = ?`).bind(item.title, item.excerpt || null, publishedAt, now, articleId).run();
      } else {
        await env.DB.prepare(`INSERT INTO articles
          (id, canonical_url, source_id, title, excerpt, published_at, fetched_at, review_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(articleId, canonicalUrl, source.id, item.title, item.excerpt || null, publishedAt, now, 'pending').run();
        added++;
      }

      await env.DB.batch(matches.map(({ rule, result }) => {
        const autoPublish = ruleAutoPublishes(rule, result.evidence);
        return env.DB.prepare(`INSERT INTO article_matches
        (article_id, rule_id, evidence_json, status, reviewed_by, reviewed_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(article_id, rule_id) DO UPDATE SET
          evidence_json = excluded.evidence_json,
          status = CASE WHEN article_matches.status = 'rejected' THEN 'rejected' ELSE excluded.status END,
          reviewed_by = CASE WHEN article_matches.status = 'rejected' THEN article_matches.reviewed_by ELSE excluded.reviewed_by END,
          reviewed_at = CASE WHEN article_matches.status = 'rejected' THEN article_matches.reviewed_at ELSE excluded.reviewed_at END`).bind(
          articleId, rule.id, JSON.stringify(result.evidence), autoPublish ? 'approved' : 'pending',
          autoPublish ? 'system:verified-rss' : null, autoPublish ? now : null
        );
      }));

      // Recompute the article status after the match upsert. This lets a
      // precision-policy update safely demote former system approvals while
      // preserving an explicitly rejected article.
      if (existing || hasPublishableMatch) {
        const approval = await env.DB.prepare(`SELECT COUNT(*) AS approved_matches
          FROM article_matches WHERE article_id = ? AND status = 'approved'`).bind(articleId).first();
        await env.DB.prepare(`UPDATE articles SET review_status = CASE
          WHEN review_status = 'rejected' THEN 'rejected'
          WHEN ? = 1 THEN 'approved'
          ELSE 'pending'
        END WHERE id = ?`).bind(Number(approval?.approved_matches || 0) > 0 ? 1 : 0, articleId).run();
      }
    }

    await env.DB.batch([
      env.DB.prepare('UPDATE media_sources SET last_success_at = ?, last_attempt_at = ?, health_status = ?, last_error = NULL WHERE id = ?').bind(now, now, 'healthy', source.id),
      env.DB.prepare('UPDATE collection_runs SET finished_at = ?, result = ?, items_seen = ?, items_new = ? WHERE id = ?').bind(now, 'success', items.length, added, runId)
    ]);
    return { source_id: source.id, result: 'success', items_seen: items.length, items_new: added };
  } catch (error) {
    const errorText = String(error).slice(0, 500);
    const statements = [env.DB.prepare('UPDATE media_sources SET last_attempt_at = ?, health_status = ?, last_error = ? WHERE id = ?').bind(now, 'error', errorText, source.id)];
    if (started) statements.push(env.DB.prepare('UPDATE collection_runs SET finished_at = ?, result = ?, error = ? WHERE id = ?').bind(now, 'failed', errorText, runId));
    await env.DB.batch(statements);
    return { source_id: source.id, result: 'failed', error: errorText };
  }
}

async function collectAll(env) {
  const [sources, rules] = await Promise.all([
    env.DB.prepare("SELECT * FROM media_sources WHERE enabled = 1 AND auto_publish = 1 AND access_mode = 'rss' AND feed_url IS NOT NULL").all(),
    activeRules(env)
  ]);
  return Promise.all(sources.results.map((source) => collectSource(source, rules, env)));
}

async function monitoringStatus(env) {
  const [sources, articles, latestRun, catalog, ruleCount, enabledSources] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN enabled = 1 AND auto_publish = 1 THEN 1 ELSE 0 END) AS enabled,
      SUM(CASE WHEN enabled = 1 AND auto_publish = 1 AND health_status = 'healthy' THEN 1 ELSE 0 END) AS healthy,
      MAX(CASE WHEN enabled = 1 AND auto_publish = 1 THEN last_success_at END) AS latest_success FROM media_sources`).first(),
    env.DB.prepare(`SELECT COUNT(*) AS total,
      SUM(CASE WHEN review_status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN review_status = 'rejected' THEN 1 ELSE 0 END) AS rejected FROM articles`).first(),
    env.DB.prepare("SELECT finished_at, result, items_seen, items_new FROM collection_runs WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1").first(),
    env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN onboarding_status = 'verified_rss' THEN 1 ELSE 0 END) AS verified_rss FROM monitoring_media_catalog").first(),
    env.DB.prepare(`SELECT COUNT(*) AS active,
      SUM(CASE WHEN auto_publish = 1 THEN 1 ELSE 0 END) AS auto_publish FROM monitoring_rules WHERE active = 1`).first(),
    env.DB.prepare(`SELECT id, name, region, health_status, last_success_at
      FROM media_sources
      WHERE enabled = 1 AND auto_publish = 1 AND access_mode = 'rss'
      ORDER BY region, name`).all()
  ]);
  return {
    rules_version: env.RULES_VERSION || null,
    source_summary: sources,
    article_summary: articles,
    media_catalog_summary: catalog,
    enabled_sources: enabledSources.results,
    active_rule_count: ruleCount?.active || 0,
    auto_publish_rule_count: ruleCount?.auto_publish || 0,
    latest_run: latestRun || null,
    publication_policy: '只顯示已驗證公開 RSS 且命中高精準自動發布規則的文章；不顯示展示資料或待覆核內容。'
  };
}

function isInternalRequest(request, env) {
  const expected = env.MONITORING_ADMIN_TOKEN;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(expected && supplied && supplied === expected);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { headers: { ...headers, 'access-control-allow-methods': 'GET, POST, OPTIONS' } });

    if (url.pathname === '/api/health') {
      const result = await env.DB.prepare('SELECT health_status, COUNT(*) AS count, MAX(last_success_at) AS latest_success FROM media_sources GROUP BY health_status').all();
      return json({ sources: result.results }, 200, headers);
    }
    if (url.pathname === '/api/status') return json(await monitoringStatus(env), 200, headers);

    if (url.pathname === '/api/internal/collect' && request.method === 'POST') {
      if (!isInternalRequest(request, env)) return json({ error: 'Not found' }, 404, headers);
      return json({ runs: await collectAll(env) }, 200, headers);
    }

    if (url.pathname === '/api/articles') {
      const requestedLimit = Number(url.searchParams.get('limit') || 30);
      const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100) : 30;
      const requestedOffset = Number(url.searchParams.get('offset') || 0);
      const offset = Number.isFinite(requestedOffset) ? Math.max(Math.trunc(requestedOffset), 0) : 0;
      const folder = url.searchParams.get('folder');
      const { fromDate, toDate, from, to } = articleQueryRange(url.searchParams);
      const where = [
        "a.review_status = 'approved'",
        "m.status = 'approved'",
        'COALESCE(a.published_at, a.fetched_at) BETWEEN ? AND ?'
      ];
      const values = [from, to];
      if (folder) {
        where.push('r.folder_id = ?');
        values.push(folder);
      }
      const joins = 'FROM articles a JOIN media_sources s ON s.id = a.source_id JOIN article_matches m ON m.article_id = a.id JOIN monitoring_rules r ON r.id = m.rule_id';
      const whereSql = `WHERE ${where.join(' AND ')}`;
      const articlesSql = `SELECT a.id, a.title, a.excerpt, a.canonical_url AS url, a.published_at, a.fetched_at, a.review_status,
          s.name AS source, GROUP_CONCAT(DISTINCT r.folder_id) AS folder_ids, GROUP_CONCAT(DISTINCT r.id) AS rule_ids,
          GROUP_CONCAT(m.evidence_json, '|||') AS evidence_jsons
          ${joins} ${whereSql}
          GROUP BY a.id ORDER BY MAX(COALESCE(a.published_at, a.fetched_at)) DESC LIMIT ? OFFSET ?`;
      const totalSql = `SELECT COUNT(DISTINCT a.id) AS total ${joins} ${whereSql}`;
      const [result, totalResult] = await Promise.all([
        env.DB.prepare(articlesSql).bind(...values, limit, offset).all(),
        env.DB.prepare(totalSql).bind(...values).first()
      ]);
      const total = Number(totalResult?.total || 0);
      const nextOffset = offset + result.results.length;
      return json({
        articles: result.results,
        total,
        has_more: nextOffset < total,
        next_offset: nextOffset,
        data_mode: 'verified_rss_monitoring',
        range: { from: fromDate, to: toDate }
      }, 200, headers);
    }
    return json({ error: 'Not found' }, 404, headers);
  },
  async scheduled(_controller, env, ctx) { ctx.waitUntil(collectAll(env)); }
};
