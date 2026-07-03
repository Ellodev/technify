"""SQLite persistence for articles and push subscriptions."""

import json
import sqlite3
import threading
from datetime import datetime, timedelta, timezone

from . import config

_lock = threading.RLock()
_conn: sqlite3.Connection | None = None

SCHEMA = """
CREATE TABLE IF NOT EXISTS articles (
    id            TEXT PRIMARY KEY,
    source_id     TEXT NOT NULL,
    source_name   TEXT NOT NULL,
    title         TEXT NOT NULL,
    link          TEXT NOT NULL,
    author        TEXT,
    summary       TEXT,
    image_url     TEXT,
    category      TEXT NOT NULL DEFAULT 'general',
    published_at  TEXT NOT NULL,
    fetched_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint      TEXT PRIMARY KEY,
    subscription  TEXT NOT NULL,
    categories    TEXT NOT NULL DEFAULT '[]',
    created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
"""


def get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        config.DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
        _conn = sqlite3.connect(config.DATABASE_PATH, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _conn.executescript(SCHEMA)
        _conn.commit()
    return _conn


def upsert_articles(articles: list[dict]) -> list[dict]:
    """Insert articles, returning only the ones that were actually new."""
    conn = get_conn()
    new_articles: list[dict] = []
    with _lock:
        for a in articles:
            cur = conn.execute(
                """INSERT OR IGNORE INTO articles
                   (id, source_id, source_name, title, link, author, summary,
                    image_url, category, published_at, fetched_at)
                   VALUES (:id, :source_id, :source_name, :title, :link, :author,
                           :summary, :image_url, :category, :published_at, :fetched_at)""",
                a,
            )
            if cur.rowcount:
                new_articles.append(a)
        conn.commit()
    return new_articles


def query_articles(
    sources: list[str] | None = None,
    categories: list[str] | None = None,
    q: str | None = None,
    since_hours: int | None = None,
    sort: str = "newest",
    page: int = 1,
    page_size: int = 24,
) -> tuple[list[dict], int]:
    conn = get_conn()
    where, params = [], []

    if sources:
        where.append(f"source_id IN ({','.join('?' * len(sources))})")
        params.extend(sources)
    if categories:
        where.append(f"category IN ({','.join('?' * len(categories))})")
        params.extend(categories)
    if q:
        where.append("(title LIKE ? OR summary LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like])
    if since_hours:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=since_hours)).isoformat()
        where.append("published_at >= ?")
        params.append(cutoff)

    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    order_sql = "ORDER BY published_at ASC" if sort == "oldest" else "ORDER BY published_at DESC"

    with _lock:
        total = conn.execute(
            f"SELECT COUNT(*) FROM articles {where_sql}", params
        ).fetchone()[0]
        rows = conn.execute(
            f"SELECT * FROM articles {where_sql} {order_sql} LIMIT ? OFFSET ?",
            [*params, page_size, (page - 1) * page_size],
        ).fetchall()

    return [dict(r) for r in rows], total


def stats() -> dict:
    conn = get_conn()
    with _lock:
        total = conn.execute("SELECT COUNT(*) FROM articles").fetchone()[0]
        by_source = {
            r["source_id"]: r["n"]
            for r in conn.execute(
                "SELECT source_id, COUNT(*) AS n FROM articles GROUP BY source_id"
            )
        }
        by_category = {
            r["category"]: r["n"]
            for r in conn.execute(
                "SELECT category, COUNT(*) AS n FROM articles GROUP BY category"
            )
        }
        last_refresh = get_meta("last_refresh")
    return {
        "total": total,
        "by_source": by_source,
        "by_category": by_category,
        "last_refresh": last_refresh,
    }


def prune_old_articles(max_age_days: int) -> int:
    cutoff = (datetime.now(timezone.utc) - timedelta(days=max_age_days)).isoformat()
    conn = get_conn()
    with _lock:
        cur = conn.execute("DELETE FROM articles WHERE published_at < ?", [cutoff])
        conn.commit()
    return cur.rowcount


def set_meta(key: str, value: str) -> None:
    conn = get_conn()
    with _lock:
        conn.execute(
            "INSERT INTO meta (key, value) VALUES (?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            [key, value],
        )
        conn.commit()


def get_meta(key: str) -> str | None:
    conn = get_conn()
    with _lock:
        row = conn.execute("SELECT value FROM meta WHERE key = ?", [key]).fetchone()
    return row["value"] if row else None


def add_subscription(subscription: dict, categories: list[str]) -> None:
    conn = get_conn()
    with _lock:
        conn.execute(
            "INSERT INTO push_subscriptions (endpoint, subscription, categories, created_at) "
            "VALUES (?, ?, ?, ?) "
            "ON CONFLICT(endpoint) DO UPDATE SET subscription = excluded.subscription, "
            "categories = excluded.categories",
            [
                subscription["endpoint"],
                json.dumps(subscription),
                json.dumps(categories),
                datetime.now(timezone.utc).isoformat(),
            ],
        )
        conn.commit()


def remove_subscription(endpoint: str) -> None:
    conn = get_conn()
    with _lock:
        conn.execute("DELETE FROM push_subscriptions WHERE endpoint = ?", [endpoint])
        conn.commit()


def list_subscriptions() -> list[dict]:
    conn = get_conn()
    with _lock:
        rows = conn.execute("SELECT * FROM push_subscriptions").fetchall()
    return [
        {
            "endpoint": r["endpoint"],
            "subscription": json.loads(r["subscription"]),
            "categories": json.loads(r["categories"]),
        }
        for r in rows
    ]
