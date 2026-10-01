export function httpHost(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.hostname.toLowerCase().replace(/^www\./, '') : '';
  } catch (_) { return ''; }
}

export function domainMatches(value, domains) {
  const host = httpHost(value);
  return Boolean(host) && domains.filter(Boolean).some((domain) => {
    const normalized = String(domain).toLowerCase().replace(/^www\./, '');
    return host === normalized || host.endsWith(`.${normalized}`);
  });
}

export function verifyItemSource(item, source, google = false) {
  const domains = source.publisher_domains?.length ? source.publisher_domains
    : source.domains?.length ? source.domains : [source.domain];
  if (google) {
    return httpHost(item.link) === 'news.google.com'
      && Boolean(item.publisherName) && domainMatches(item.publisherUrl, domains);
  }
  return domainMatches(item.link, domains);
}
