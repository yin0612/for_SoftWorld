"""更新金融科技、穩定幣、競業與產業的 Google News RSS 聚合 metadata。

這條管線只保存 Google News RSS 回傳的標題、發布時間、來源網域與
Google News 原文跳轉連結；不抓取或鏡像新聞全文，也不把結果標成官方 RSS。
"""
from __future__ import annotations

import hashlib
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_CONFIG = ROOT / "config" / "fintech_media_sources.json"
RULE_CONFIG = ROOT / "config" / "monitoring_rules.json"
OUTPUT = ROOT / "data" / "fintech-aggregated.json"
TAIPEI = timezone(timedelta(hours=8))
MAX_ITEMS_PER_SOURCE = 80

PAYMENT_TERMS = (
    "藍新科技", "藍新金流", "newebpay", "簡單付", "ezpay", "歐付寶", "o'pay", "opay",
    "街口支付", "街口電子支付", "綠界科技", "ecpay", "全支付", "全盈支付", "台灣pay",
    "悠遊付", "一卡通", "ipass money", "line pay", "line pay money", "pi拍錢包",
    "pchomepay", "hami pay", "friday錢包", "蝦皮支付", "電子支付", "行動支付",
    "數位支付", "第三方支付", "支付基礎設施", "跨境支付", "金流", "收單", "代收付",
    "電子票證", "信用卡支付", "信用卡", "刷卡", "電子錢包", "數位錢包", "掃碼支付",
    "twqr", "bnpl", "先買後付",
)
STABLECOIN_TERMS = (
    "穩定幣", "stablecoin", "stable coin", "usdt", "usdc", "usde", "pyusd", "rlusd",
    "fdusd", "eurc", "usdg", "gusd", "tether", "鏈上結算", "鏈上支付", "代幣化存款",
    "代幣化貨幣", "tokenized deposit", "tokenized deposits", "stablecoin settlement",
    "stablecoin payment", "stablecoin payments", "奧丁丁", "owlpay",
)
QUERY_PAYMENT_TERMS = ("支付", "電子支付", "行動支付", "金流", "信用卡", "第三方支付", "電子票證", "跨境支付", "BNPL", "先買後付", "街口支付", "LINE Pay", "台灣Pay")
QUERY_STABLECOIN_TERMS = ("穩定幣", "stablecoin", "USDT", "USDC", "鏈上支付", "鏈上結算", "代幣化")
# 聚合查詢只使用能有效縮小結果集的代表詞；實際是否歸入分類，仍須
# 再通過 monitoring_rules.json 的完整雙群組條件。
QUERY_COMPETITOR_TERMS = ("遊戲", "遊戲橘子", "鈊象", "宇峻奧汀", "網銀國際", "Garena", "騰訊", "網易", "NEXON", "SEGA", "CAPCOM")
QUERY_INDUSTRY_TERMS = ("遊戲", "遊戲市場", "遊戲產值", "Steam", "PS5", "SWITCH", "電競", "雲端遊戲", "GameFi", "數位廣告", "Martech", "發票載具", "發票存摺", "AI", "Google", "Meta", "LINE", "TikTok")
AGGREGATE_QUERIES = (
    ("payment", QUERY_PAYMENT_TERMS),
    ("stablecoin", QUERY_STABLECOIN_TERMS),
    ("competitor", QUERY_COMPETITOR_TERMS),
    ("industry", QUERY_INDUSTRY_TERMS),
)


def taipei_now() -> datetime:
    return datetime.now(TAIPEI)


def google_feed_url(domain: str, start: str, end: str, topic_terms: tuple[str, ...] = ()) -> str:
    end_exclusive = (datetime.strptime(end, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    topic = f"({' OR '.join(topic_terms)}) " if topic_terms else ""
    query = f"site:{domain} {topic}after:{start} before:{end_exclusive}"
    params = {"q": query, "hl": "zh-TW", "gl": "TW", "ceid": "TW:zh-Hant"}
    return "https://news.google.com/rss/search?" + urllib.parse.urlencode(params)


def text(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def contains_term(target: str, term: str) -> bool:
    """Match short Latin terms as words to avoid e.g. AI matching Taiwan."""
    normalized_target = target.casefold()
    normalized_term = text(term).casefold()
    if not normalized_term:
        return False
    if re.fullmatch(r"[a-z0-9]+", normalized_term):
        return re.search(rf"(?<![a-z0-9]){re.escape(normalized_term)}(?![a-z0-9])", normalized_target) is not None
    return normalized_term in normalized_target


def load_huike_rules() -> list[dict]:
    config = json.loads(RULE_CONFIG.read_text(encoding="utf-8"))
    return [
        rule for rule in config.get("rules", [])
        if rule.get("folder_id") in {"folder_3", "folder_4"}
    ]


def classify_huike_title(title: str, rules: list[dict]) -> list[tuple[dict, list[str]]]:
    """Apply the same required-group semantics to title-only aggregate metadata."""
    target = title.casefold()
    matches: list[tuple[dict, list[str]]] = []
    for rule in rules:
        groups = rule.get("required_any_groups") or []
        if not groups or any(contains_term(target, term) for term in rule.get("exclude_any", [])):
            continue
        hits = [term for group in groups for term in group if contains_term(target, term)]
        if all(any(contains_term(target, term) for term in group) for group in groups):
            matches.append((rule, list(dict.fromkeys(hits))))
    return matches


def parse_datetime(value: str) -> str | None:
    try:
        parsed = datetime.strptime(text(value), "%a, %d %b %Y %H:%M:%S %Z")
    except ValueError:
        try:
            parsed = datetime.strptime(text(value), "%a, %d %b %Y %H:%M:%S %z")
        except ValueError:
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def strip_suffix(title: str, source: dict) -> str:
    result = text(title)
    suffixes = [source.get("name"), source.get("document_name"), *(source.get("domains") or [])]
    for suffix in filter(None, (text(value) for value in suffixes)):
        marker = f" - {suffix}"
        if result.endswith(marker):
            return result[: -len(marker)].rstrip()
    return result


def parse_feed(
    raw: bytes,
    source: dict,
    feed_url: str,
    fetched_at: str,
    huike_rules: list[dict],
) -> tuple[list[dict], str | None]:
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as exc:
        return [], f"xml_parse_error:{exc}"
    rows: list[dict] = []
    for item in root.findall(".//item")[:MAX_ITEMS_PER_SOURCE]:
        title = strip_suffix(item.findtext("title"), source)
        link = text(item.findtext("link"))
        published_at = parse_datetime(item.findtext("pubDate"))
        if not title or not link or not published_at:
            continue
        target = title.casefold()
        payment = any(contains_term(target, term) for term in PAYMENT_TERMS)
        stablecoin = any(contains_term(target, term) for term in STABLECOIN_TERMS)
        huike_matches = classify_huike_title(title, huike_rules)
        if not payment and not stablecoin and not huike_matches:
            continue
        folders = ["folder_2"] if payment else []
        if stablecoin:
            folders.append("folder_6")
        folders.extend(rule["folder_id"] for rule, _ in huike_matches)
        rule_ids = []
        if payment:
            rule_ids.append("taiwan-payment-google-news")
        if stablecoin:
            rule_ids.append("stablecoin-core")
        rule_ids.extend(rule["id"] for rule, _ in huike_matches)
        matched_terms = [
            term for term in (*PAYMENT_TERMS, *STABLECOIN_TERMS)
            if contains_term(target, term)
        ]
        matched_terms.extend(term for _, terms in huike_matches for term in terms)
        rows.append({
            "id": "google-news-" + hashlib.sha256(link.encode("utf-8")).hexdigest()[:20],
            "title": title,
            "excerpt": "Google News RSS 聚合僅提供標題與發布時間；請開啟原文閱讀完整內容。",
            "url": link,
            "published_at": published_at,
            "fetched_at": fetched_at,
            "source_id": source["id"],
            "source": source["name"],
            "source_region": source.get("region", "TW"),
            "source_feed": feed_url,
            "source_homepage": source.get("homepage"),
            "source_kind": "google_news_rss",
            "source_access_mode": "google_news_rss",
            "verification_status": "aggregated",
            "url_kind": "google_news_redirect",
            "review_status": "approved",
            "folder_ids": ",".join(sorted(set(folders))),
            "rule_ids": ",".join(dict.fromkeys(rule_ids)),
            "matched_terms": list(dict.fromkeys(matched_terms))[:20],
        })
    return rows, None


def main() -> int:
    config = json.loads(SOURCE_CONFIG.read_text(encoding="utf-8"))
    huike_rules = load_huike_rules()
    now = taipei_now()
    end = now.date()
    start = (end - timedelta(days=62))
    fetched_at = now.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    articles: dict[str, dict] = {}
    errors: list[dict] = []
    for source in config.get("sources", []):
        if not source.get("enabled") or source.get("access_mode") != "google_news_rss":
            continue
        domain = (source.get("domains") or [""])[0]
        # 分主題查詢，避免只取媒體最新的一小段泛新聞內容；競業／產業
        # 結果仍須通過完整規則，且只保留公開 metadata。
        for _topic_name, topic_terms in AGGREGATE_QUERIES:
            feed_url = google_feed_url(domain, start.isoformat(), end.isoformat(), topic_terms)
            try:
                request = urllib.request.Request(feed_url, headers={"User-Agent": "SoftWorldMonitoring/1.0"})
                with urllib.request.urlopen(request, timeout=25) as response:
                    rows, error = parse_feed(response.read(), source, feed_url, fetched_at, huike_rules)
                if error:
                    errors.append({"source_id": source["id"], "error": error})
                for row in rows:
                    existing = articles.get(row["url"])
                    if existing is None:
                        articles[row["url"]] = row
                        continue
                    # 同一篇文章可能在多個主題查詢中出現，合併分類、規則
                    # 與命中詞，避免前端重複列出或遺失分類。
                    for field in ("folder_ids", "rule_ids"):
                        values = [
                            value.strip()
                            for value in f'{existing.get(field, "")},{row.get(field, "")}'.split(",")
                            if value.strip()
                        ]
                        existing[field] = ",".join(dict.fromkeys(values))
                    existing["matched_terms"] = list(dict.fromkeys([
                        *(existing.get("matched_terms") or []),
                        *(row.get("matched_terms") or []),
                    ]))[:20]
            except Exception as exc:  # noqa: BLE001 - record per-source failure, continue others
                errors.append({"source_id": source["id"], "error": str(exc)[:240]})
    ordered = sorted(articles.values(), key=lambda row: row["published_at"], reverse=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "schema_version": "1.0",
        "generated_at": fetched_at,
        "range": {"from": start.isoformat(), "to": end.isoformat()},
        "method": "google-news-rss-site-query",
        "provenance": "public metadata only; Google News wrapper URLs retained; not official publisher RSS",
        "source_count": len(config.get("sources", [])),
        "article_count": len(ordered),
        "errors": errors,
        "articles": ordered,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"article_count": len(ordered), "errors": len(errors), "output": str(OUTPUT)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
