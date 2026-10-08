import { textFromXml } from './rss-parser.mjs';

function normalize(text = '') {
  return text.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function parseJson(value, fallback) {
  try { return JSON.parse(value); } catch (_) { return fallback; }
}

function ruleTargets(article, scope) {
  const title = textFromXml(article.title || '');
  const excerpt = textFromXml(article.excerpt || '');
  const paragraphs = excerpt.split(/\n{2,}/).map((text) => text.trim()).filter(Boolean);
  const lead = paragraphs[0] || excerpt;
  if (scope === 'title') return [{ label: 'title', text: title }];
  if (scope === 'lead') return [{ label: 'rss_excerpt', text: lead }];
  if (scope === 'title_or_lead') return [{ label: 'title', text: title }, { label: 'rss_excerpt', text: lead }];
  if (scope === 'paragraph') return [{ label: 'title', text: title }, ...paragraphs.map((text, index) => ({ label: `rss_paragraph_${index + 1}`, text }))];
  return [{ label: 'title_and_rss_excerpt', text: `${title}\n${excerpt}` }];
}

function containsTerm(target, term) {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return false;
  if (/^[a-z0-9]+$/.test(normalizedTerm)) {
    return new RegExp(`(?<![a-z0-9])${normalizedTerm}(?![a-z0-9])`).test(target);
  }
  return target.includes(normalizedTerm);
}

function evaluateRule(article, rule) {
  const requiredAnyGroups = [parseJson(rule.any_of_json, []), parseJson(rule.all_of_json, [])].filter((group) => group.length);
  const excluded = parseJson(rule.exclude_any_json, []);
  for (const target of ruleTargets(article, rule.scope)) {
    const normalizedTarget = normalize(target.text);
    const hits = (terms) => terms.filter((term) => containsTerm(normalizedTarget, term));
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
  if (Array.isArray(source.allowed_rule_ids) && !source.allowed_rule_ids.includes(rule.id)) return false;
  const allowedRegions = parseJson(rule.region_scope_json || '[]', []);
  return allowedRegions.length === 0 || allowedRegions.includes(source.region);
}

function configuredRules(config) {
  return config.rules.map(rule => ({ ...rule,
    any_of_json: JSON.stringify(rule.required_any_groups[0]),
    all_of_json: JSON.stringify(rule.required_any_groups[1] || []),
    exclude_any_json: JSON.stringify([...(config.global_exclude_any || []), ...(rule.exclude_any || [])]),
    auto_publish: config.automatic_publication_rule_ids.includes(rule.id) ? 1 : 0,
    auto_publish_allowed_terms_json: JSON.stringify(config.automatic_publication_allowed_terms?.[rule.id] || []),
    region_scope_json: JSON.stringify(config.folders.find(folder => folder.id === rule.folder_id)?.region_scope || [])
  }));
}

// Recheck only previously approved rule IDs: never resurrect a rejected match
// or add an unreviewed rule while reading old database/snapshot content.
function revalidateArticle(article, source, rules) {
  if (!source || !source.enabled || !source.auto_publish || article.review_status !== 'approved') return null;
  const approvedIds = new Set(String(article.rule_ids || '').split(','));
  const clean = { ...article, title: textFromXml(article.title || ''), excerpt: textFromXml(article.excerpt || '') };
  const target = article.source_kind === 'google_news_rss' ? { title: clean.title } : clean;
  const matches = rules.filter(rule => approvedIds.has(rule.id) && ruleAllowsSource(rule, source))
    .map(rule => ({ rule, result: evaluateRule(target, rule) })).filter(({ result }) => result.matched);
  if (!matches.length) return null;
  return { ...clean,
    rule_ids: matches.map(({ rule }) => rule.id).join(','),
    folder_ids: [...new Set(matches.map(({ rule }) => rule.folder_id))].join(','),
    evidence_jsons: matches.map(({ result }) => JSON.stringify(result.evidence)).join('|||'),
    matched_terms: [...new Set(matches.flatMap(({ result }) => result.evidence.required_any_group_hits.flat()))]
  };
}


export { evaluateRule, ruleAutoPublishes, ruleAllowsSource, configuredRules, revalidateArticle };
