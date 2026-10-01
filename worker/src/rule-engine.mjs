function normalize(text = '') {
  return text.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
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


export { evaluateRule, ruleAutoPublishes, ruleAllowsSource };
