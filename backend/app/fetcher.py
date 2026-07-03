"""Feed fetching: download all provider feeds, normalize entries."""

import asyncio
import hashlib
import html
import logging
import re
from datetime import datetime, timezone
from time import mktime

import feedparser

from .categorize import categorize
from .feeds import PROVIDERS, Provider

log = logging.getLogger("technify.fetcher")

_TAG_RE = re.compile(r"<[^>]+>")
_IMG_RE = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)
_WS_RE = re.compile(r"\s+")

SUMMARY_MAX_LEN = 320


def _clean_summary(raw: str) -> str:
    text = html.unescape(_TAG_RE.sub(" ", raw or ""))
    text = _WS_RE.sub(" ", text).strip()
    if len(text) > SUMMARY_MAX_LEN:
        text = text[: SUMMARY_MAX_LEN - 1].rsplit(" ", 1)[0] + "…"
    return text


def _extract_image(entry) -> str | None:
    url = None
    for media in entry.get("media_content", []) or []:
        if media.get("url") and media.get("medium", "image") in ("image", ""):
            url = media["url"]
            break
    if not url:
        for thumb in entry.get("media_thumbnail", []) or []:
            if thumb.get("url"):
                url = thumb["url"]
                break
    if not url:
        for enc in entry.get("enclosures", []) or []:
            if enc.get("href") and str(enc.get("type", "")).startswith("image/"):
                url = enc["href"]
                break
    if not url:
        for content in entry.get("content", []) or []:
            match = _IMG_RE.search(content.get("value", ""))
            if match:
                url = match.group(1)
                break
    if not url:
        match = _IMG_RE.search(entry.get("summary", "") or "")
        if match:
            url = match.group(1)
    if not url:
        return None
    url = html.unescape(url)
    return url if url.startswith(("http://", "https://")) else None


def _published_at(entry) -> datetime:
    for key in ("published_parsed", "updated_parsed"):
        parsed = entry.get(key)
        if parsed:
            return datetime.fromtimestamp(mktime(parsed), tz=timezone.utc)
    return datetime.now(timezone.utc)


def _normalize_entry(provider: Provider, entry, now_iso: str) -> dict | None:
    link = entry.get("link")
    title = _clean_summary(entry.get("title", ""))
    if not link or not title:
        return None

    summary = _clean_summary(entry.get("summary", ""))
    tags = [t.get("term", "") for t in entry.get("tags", []) or []]

    return {
        "id": hashlib.sha256(link.encode()).hexdigest()[:20],
        "source_id": provider.id,
        "source_name": provider.name,
        "title": title,
        "link": link,
        "author": entry.get("author") or None,
        "summary": summary or None,
        "image_url": _extract_image(entry),
        "category": categorize(title, summary, tags, provider.default_category),
        "published_at": _published_at(entry).isoformat(),
        "fetched_at": now_iso,
    }


def _fetch_provider(provider: Provider) -> list[dict]:
    now_iso = datetime.now(timezone.utc).isoformat()
    feed = feedparser.parse(
        provider.feed_url, agent="technify/2.0 (+https://github.com/Ellodev/technify)"
    )
    if feed.bozo and not feed.entries:
        log.warning("feed %s failed: %s", provider.id, feed.get("bozo_exception"))
        return []
    articles = []
    for entry in feed.entries:
        normalized = _normalize_entry(provider, entry, now_iso)
        if normalized:
            articles.append(normalized)
    log.info("fetched %d articles from %s", len(articles), provider.id)
    return articles


async def fetch_all() -> list[dict]:
    """Fetch every provider concurrently; a failing feed never kills the batch."""
    results = await asyncio.gather(
        *(asyncio.to_thread(_fetch_provider, p) for p in PROVIDERS),
        return_exceptions=True,
    )
    articles: list[dict] = []
    for provider, result in zip(PROVIDERS, results):
        if isinstance(result, BaseException):
            log.error("feed %s raised: %s", provider.id, result)
        else:
            articles.extend(result)
    return articles
