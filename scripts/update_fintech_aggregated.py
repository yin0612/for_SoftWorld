"""更新金融科技／穩定幣的 Google News RSS 聚合 metadata。

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


def parse_feed(raw: bytes, source: dict, feed_url: str, fetched_at: str) -> tuple[list[dict], str | None]:
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
        payment = any(term.casefold() in target for term in PAYMENT_TERMS)
        stablecoin = any(term.casefold() in target for term in STABLECOIN_TERMS)
        if not payment and not stablecoin:
            continue
        folders = ["folder_2"] if payment else []
        if stablecoin:
            folders.append("folder_6")
        rows.append({
            "id": "google-news-" + hashlib.sha256(link.encode("utf-8")).hexdigest()[:20],
            "title": title,
            "excerpt": "Google News RSS 聚合僅提供標題與發布時間；請開啟原文查看完整內容。",
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
            "rule_ids": "taiwan-payment-google-news" if payment else "stablecoin-core",
            "matched_terms": [term for term in (*PAYMENT_TERMS, *STABLECOIN_TERMS) if term.casefold() in target][:12],
        })
    return rows, None


def main() -> int:
    config = json.loads(SOURCE_CONFIG.read_text(encoding="utf-8"))
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
        # 分成支付與穩定幣兩個主題查詢，避免只取媒體最新的一小段泛財經內容。
        for topic_terms in (QUERY_PAYMENT_TERMS, QUERY_STABLECOIN_TERMS):
            feed_url = google_feed_url(domain, start.isoformat(), end.isoformat(), topic_terms)
            try:
                request = urllib.request.Request(feed_url, headers={"User-Agent": "SoftWorldMonitoring/1.0"})
                with urllib.request.urlopen(request, timeout=25) as response:
                    rows, error = parse_feed(response.read(), source, feed_url, fetched_at)
                if error:
                    errors.append({"source_id": source["id"], "error": error})
                for row in rows:
                    articles.setdefault(row["url"], row)
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
