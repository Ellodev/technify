"""Keyword-based article categorization.

Deliberately simple: match category keywords against the article title,
summary and feed tags. First category to reach the score threshold wins;
ties are broken by the order in CATEGORIES (more specific first).
"""

import re

# id -> (label, keywords). Title hits count double.
CATEGORY_KEYWORDS: dict[str, tuple[str, list[str]]] = {
    "ai": (
        "AI & ML",
        [
            "ai", "artificial intelligence", "machine learning", "llm", "chatgpt",
            "openai", "anthropic", "claude", "gemini", "deepmind", "neural",
            "generative", "copilot", "gpt", "chatbot", "deep learning", "midjourney",
        ],
    ),
    "security": (
        "Security",
        [
            "security", "hack", "hacker", "breach", "ransomware", "malware",
            "phishing", "vulnerability", "exploit", "cyberattack", "cybersecurity",
            "privacy", "surveillance", "leak", "zero-day", "ddos", "botnet", "spyware",
        ],
    ),
    "gadgets": (
        "Gadgets",
        [
            "iphone", "android phone", "smartphone", "laptop", "headphone", "earbuds",
            "smartwatch", "wearable", "tablet", "ipad", "macbook", "pixel", "galaxy",
            "gadget", "camera", "tv", "monitor", "keyboard", "console", "drone",
            "review", "hands-on", "vr headset", "smart home",
        ],
    ),
    "gaming": (
        "Gaming",
        [
            "game", "gaming", "playstation", "xbox", "nintendo", "steam", "esports",
            "gamer", "rpg", "fortnite", "minecraft", "twitch", "game pass", "ps5",
        ],
    ),
    "science": (
        "Science & Space",
        [
            "nasa", "spacex", "space", "rocket", "satellite", "mars", "moon",
            "quantum", "physics", "biology", "climate", "research", "scientists",
            "astronomy", "telescope", "fusion", "battery breakthrough", "genome",
        ],
    ),
    "startups": (
        "Startups & Business",
        [
            "startup", "funding", "venture", "vc", "acquisition", "acquires", "ipo",
            "valuation", "series a", "series b", "layoff", "antitrust", "merger",
            "revenue", "earnings", "billion", "stock", "lawsuit", "regulator",
        ],
    ),
    "dev": (
        "Dev & Open Source",
        [
            "open source", "github", "programming", "developer", "javascript",
            "python", "rust", "linux", "kubernetes", "docker", "api", "framework",
            "database", "sdk", "cli", "compiler", "self-hosted", "show hn",
        ],
    ),
    "mobility": (
        "EVs & Mobility",
        [
            "tesla", "ev", "electric vehicle", "electric car", "self-driving",
            "autonomous", "waymo", "rivian", "e-bike", "scooter", "charging",
        ],
    ),
    "crypto": (
        "Crypto & Web3",
        [
            "crypto", "bitcoin", "ethereum", "blockchain", "nft", "web3",
            "stablecoin", "defi", "binance", "coinbase",
        ],
    ),
}

GENERAL = ("general", "General")

CATEGORIES: list[dict] = [
    {"id": cid, "label": label} for cid, (label, _) in CATEGORY_KEYWORDS.items()
] + [{"id": GENERAL[0], "label": GENERAL[1]}]

_WORD_RE_CACHE: dict[str, re.Pattern] = {}


def _keyword_pattern(keyword: str) -> re.Pattern:
    pattern = _WORD_RE_CACHE.get(keyword)
    if pattern is None:
        pattern = re.compile(rf"\b{re.escape(keyword)}\b", re.IGNORECASE)
        _WORD_RE_CACHE[keyword] = pattern
    return pattern


def categorize(title: str, summary: str, tags: list[str], fallback: str = "general") -> str:
    title = title or ""
    body = f"{summary or ''} {' '.join(tags or [])}"

    best_id, best_score = None, 0
    for cid, (_label, keywords) in CATEGORY_KEYWORDS.items():
        score = 0
        for kw in keywords:
            pattern = _keyword_pattern(kw)
            if pattern.search(title):
                score += 2
            elif pattern.search(body):
                score += 1
        if score > best_score:
            best_id, best_score = cid, score

    if best_score >= 2 and best_id:
        return best_id
    return fallback
