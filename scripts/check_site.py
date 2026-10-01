"""Validate the deployed dataset and fail on missing or overdue updates."""
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = "https://softworld-monitoring-api.media-monitoring-worker.workers.dev"

def load(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "SoftWorldQuality/1.0"}), timeout=30) as response:
        return json.load(response)

def inspect_dataset(payload, status, now):
    errors, warnings = [], []
    rows = payload.get("articles", [])
    if payload.get("degraded") or payload.get("partial"):
        warnings.append("Dataset reports reduced coverage")
    seen = set()
    for row in rows:
        url = row.get("url", "")
        if not url.startswith(("https://", "http://")) or not row.get("title") or not row.get("source"):
            errors.append("Missing article title, source, or valid URL")
        if url in seen:
            errors.append("Duplicate article URL")
        seen.add(url)
        try:
            published = datetime.fromisoformat(row["published_at"].replace("Z", "+00:00"))
            if published > now:
                errors.append("Future article timestamp")
        except (KeyError, ValueError, TypeError):
            errors.append("Invalid article timestamp")
    rss_times = []
    for raw in [(status.get("source_summary") or {}).get("latest_success"), (payload.get("rss_snapshot") or {}).get("generated_at")]:
        try:
            rss_times.append(datetime.fromisoformat(raw.replace("Z", "+00:00")))
        except (AttributeError, ValueError, TypeError):
            pass
    rss_updated = max(rss_times).isoformat() if rss_times else None
    for label, raw, max_age in [
        ("RSS collection", rss_updated, 7200),
        ("Google News snapshot", (payload.get("aggregated_snapshot") or {}).get("generated_at"), 28800),
    ]:
        try:
            updated = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            if updated > now or (now - updated).total_seconds() > max_age:
                errors.append(label + " is overdue")
        except (AttributeError, ValueError, TypeError):
            errors.append(label + " time is unavailable")
    if (payload.get("aggregated_snapshot") or {}).get("error_count", 0):
        warnings.append("Some aggregation queries failed")
    fresh_backup = set()
    for row in (payload.get("rss_snapshot") or {}).get("results", []):
        try:
            checked = datetime.fromisoformat(row["checked_at"].replace("Z", "+00:00"))
            if row.get("result") == "success" and 0 <= (now - checked).total_seconds() <= 7200:
                fresh_backup.add(row["source_id"])
        except (KeyError, ValueError, TypeError):
            pass
    unhealthy = [source["name"] for source in status.get("enabled_sources", []) if source.get("health_status") != "healthy" and source.get("id") not in fresh_backup]
    if unhealthy:
        warnings.append("RSS sources requiring review: " + ", ".join(unhealthy))
    if not payload.get("has_more") and payload.get("total") != len(rows):
        errors.append("Article total differs from returned list")
    return {"checked_at": now.isoformat(), "result": "failed" if errors else "partial" if warnings else "passed",
        "articles_checked": len(rows), "has_more": payload.get("has_more", False),
        "errors": sorted(set(errors)), "warnings": warnings}

def main():
    payload = load(API + "/api/articles?limit=2000&v=20261001-quality")
    rows = list(payload.get("articles", []))
    seen_offsets = {0}
    page = payload
    while page.get("has_more"):
        offset = page.get("next_offset")
        if not isinstance(offset, int) or offset in seen_offsets or not page.get("articles"):
            raise RuntimeError("Incomplete pagination: invalid cursor")
        seen_offsets.add(offset)
        page = load(API + f"/api/articles?limit=2000&v=20261001-quality&offset={offset}")
        rows.extend(page.get("articles", []))
    payload["articles"] = rows
    payload["has_more"] = False
    report = inspect_dataset(payload, load(API + "/api/status"), datetime.now(timezone.utc))
    (ROOT / "data" / "site-health.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))
    return report["result"] != "passed"

if __name__ == "__main__":
    raise SystemExit(main())
