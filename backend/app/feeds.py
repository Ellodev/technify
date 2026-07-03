"""Registry of news providers (RSS/Atom feeds)."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Provider:
    id: str
    name: str
    feed_url: str
    homepage: str
    # Category applied when the classifier can't find anything better.
    default_category: str = "general"


PROVIDERS: list[Provider] = [
    Provider("bbc", "BBC News Tech", "http://feeds.bbci.co.uk/news/technology/rss.xml", "https://www.bbc.co.uk/news/technology"),
    Provider("guardian", "The Guardian Tech", "https://www.theguardian.com/uk/technology/rss", "https://www.theguardian.com/technology"),
    Provider("wired", "Wired", "https://www.wired.com/feed/rss", "https://www.wired.com"),
    Provider("techcrunch", "TechCrunch", "https://techcrunch.com/feed/", "https://techcrunch.com", "startups"),
    Provider("verge", "The Verge", "https://www.theverge.com/rss/index.xml", "https://www.theverge.com", "gadgets"),
    Provider("arstechnica", "Ars Technica", "https://feeds.arstechnica.com/arstechnica/index", "https://arstechnica.com"),
    Provider("hackernews", "Hacker News", "https://hnrss.org/frontpage", "https://news.ycombinator.com", "dev"),
    Provider("engadget", "Engadget", "https://www.engadget.com/rss.xml", "https://www.engadget.com", "gadgets"),
    Provider("mittr", "MIT Technology Review", "https://www.technologyreview.com/feed/", "https://www.technologyreview.com", "science"),
    Provider("theregister", "The Register", "https://www.theregister.com/headlines.atom", "https://www.theregister.com"),
    Provider("hackaday", "Hackaday", "https://hackaday.com/blog/feed/", "https://hackaday.com", "dev"),
    Provider("arstechnica_gaming", "Ars Technica Gaming", "https://feeds.arstechnica.com/arstechnica/gaming", "https://arstechnica.com/gaming", "gaming"),
]

PROVIDERS_BY_ID = {p.id: p for p in PROVIDERS}
