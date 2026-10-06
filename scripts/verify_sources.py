"""Check both RSS and Google publisher metadata; never claim article factual accuracy."""
import concurrent.futures
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from update_fintech_aggregated import google_feed_url, AGGREGATE_QUERIES

ROOT = Path(__file__).resolve().parents[1]


def host(url):
    parts = urllib.parse.urlparse(url or "")
    return (parts.hostname or "").lower().removeprefix("www.") if parts.scheme in ("http", "https") and not parts.username and not parts.password else ""


def allowed(url, domains):
    value = host(url)
    return bool(value) and any(value == domain or value.endswith("." + domain) for domain in domains)


def check(source):
    kind = source["access_mode"]
    now = datetime.now(timezone(timedelta(hours=8))).date()
    domains = source.get("publisher_domains") or source.get("domains") or [source.get("domain", "")]
    domains = [domain.lower().removeprefix("www.") for domain in domains if domain]
    feed = source.get("feed_url")
    if kind == "google_news_rss":
        topics = dict(AGGREGATE_QUERIES)
        topic = (source.get("query_topics") or ["payment"])[0]
        feed = google_feed_url((source.get("domains") or [""])[0], str(now - timedelta(days=62)), str(now), topics.get(topic, ()), source)
    result = {"source_id": source["id"], "name": source.get("document_name") or source["name"], "kind": kind, "feed": feed}
    try:
        request = urllib.request.Request(feed, headers={"User-Agent": "SoftWorldMonitoring/1.0"})
        with urllib.request.urlopen(request, timeout=18) as response:
            raw = response.read(20_000_001)
            result["http_status"] = response.status
            result["final_feed_url"] = response.url
        if len(raw) > 20_000_000:
            raise ValueError("feed_too_large")
        root = ET.fromstring(raw)
        if root.tag.split("}")[-1].lower() not in ("rss", "rdf", "feed"):
            raise ValueError("not_rss_or_atom")
        items = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")
        valid = invalid = 0
        reasons = {}
        for item in items[:200]:
            atom = "{http://www.w3.org/2005/Atom}"
            link = item.findtext("link") or ""
            if not link:
                node = item.find(atom + "link")
                link = node.get("href", "") if node is not None else ""
            link = urllib.parse.urljoin(feed, link.strip())
            publisher = item.find("source")
            attribution = publisher.get("url", "") if publisher is not None else ""
            date = item.findtext("pubDate") or item.findtext(atom + "published") or item.findtext(atom + "updated")
            title = item.findtext("title") or item.findtext(atom + "title")
            reason = ""
            if not title or not date:
                reason = "missing_title_or_date"
            else:
                try:
                    try:
                        parsed = parsedate_to_datetime(date)
                    except (ValueError, TypeError):
                        parsed = datetime.fromisoformat(" ".join(date.split()).replace("Z", "+00:00"))
                    if parsed.tzinfo is None:
                        reason = "date_timezone_missing"
                except (ValueError, TypeError, OverflowError):
                    reason = "invalid_date"
            if kind == "google_news_rss":
                if not allowed(attribution, domains) or publisher is None or not publisher.text:
                    reason = "publisher_domain_mismatch"
                elif host(link) != "news.google.com":
                    reason = "invalid_google_link"
            elif not allowed(link, domains):
                reason = "article_domain_mismatch"
            if reason:
                invalid += 1
                reasons[reason] = reasons.get(reason, 0) + 1
            else:
                valid += 1
        result.update(status="warning" if invalid else "passed" if items else "empty", items_checked=min(len(items), 200), valid=valid, invalid=invalid, reasons=reasons)
    except Exception as exc:
        result.update(status="unavailable", error=str(exc)[:240])
    return result


def main():
    sources = []
    for filename in ("core_media_sources.json", "fintech_media_sources.json"):
        config = json.loads((ROOT / "config" / filename).read_text(encoding="utf-8"))
        sources.extend(source for source in config["sources"] if source.get("enabled") and source.get("auto_publish") and source.get("access_mode") in ("rss", "google_news_rss"))
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(check, sources))
    payload = {"checked_at": datetime.now(timezone.utc).isoformat(), "scope": "feed availability, article metadata and publisher domains; Google samples one topic per source; no article fact or full-text verification", "results": results}
    (ROOT / "data" / "source-verification.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({status: sum(row["status"] == status for row in results) for status in ("passed", "warning", "empty", "unavailable")}))


if __name__ == "__main__":
    main()
