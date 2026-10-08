const MAX_RSS_ITEMS_PER_SOURCE = 200;
function decodeEntities(text = '') {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
  let decoded = String(text);
  let previous;
  do {
    previous = decoded;
    decoded = decoded.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_match, entity) => {
      if (!entity.startsWith('#')) return entities[entity.toLowerCase()] || _match;
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : _match;
    });
  } while (decoded !== previous);
  return decoded;
}

function textFromXml(value = '') {
  // XML-escaped HTML must be decoded BEFORE removing markup; otherwise
  // text-align, hrefs and image URLs become keyword evidence.
  return decodeEntities(String(value))
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/?(?:p|div|br|li|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n[ \t]*\n+/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
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
      publisherName: extractTag(entry, 'source'),
      publisherUrl: decodeEntities((entry.match(/<source\b[^>]*url=["']([^"']+)/i) || [])[1] || ''),
      publishedAt: extractTag(entry, 'pubDate') || extractTag(entry, 'published') || extractTag(entry, 'updated'),
      // A number of publishers put their useful lead in description and the
      // attributable RSS body in content:encoded. Keep both for matching.
      excerpt: [...new Set(textParts)].join('\n\n')
    };
  }).filter((item) => item.title && item.link).slice(0, MAX_RSS_ITEMS_PER_SOURCE);
}


export { parseRss, textFromXml };
