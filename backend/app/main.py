"""technify v2 API — self-hosted tech news aggregator backend."""

import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import config, fetcher, push, store
from .categorize import CATEGORIES
from .feeds import PROVIDERS

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
log = logging.getLogger("technify")

_refresh_lock = asyncio.Lock()


async def refresh_once() -> dict:
    async with _refresh_lock:
        articles = await fetcher.fetch_all()
        new_articles = store.upsert_articles(articles)
        pruned = store.prune_old_articles(config.MAX_ARTICLE_AGE_DAYS)
        store.set_meta("last_refresh", datetime.now(timezone.utc).isoformat())
        if new_articles:
            new_articles.sort(key=lambda a: a["published_at"], reverse=True)
            await asyncio.to_thread(push.notify_new_articles, new_articles)
        log.info("refresh: %d fetched, %d new, %d pruned", len(articles), len(new_articles), pruned)
        return {"fetched": len(articles), "new": len(new_articles), "pruned": pruned}


async def _refresh_loop() -> None:
    while True:
        try:
            await refresh_once()
        except Exception:
            log.exception("scheduled refresh failed")
        await asyncio.sleep(config.REFRESH_INTERVAL_MINUTES * 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    store.get_conn()
    try:
        push.init()
    except Exception:
        log.exception("push init failed; notifications disabled")
    task = asyncio.create_task(_refresh_loop())
    yield
    task.cancel()


app = FastAPI(title="technify API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "last_refresh": store.get_meta("last_refresh")}


@app.get("/api/sources")
async def sources():
    return [
        {"id": p.id, "name": p.name, "homepage": p.homepage}
        for p in PROVIDERS
    ]


@app.get("/api/categories")
async def categories():
    return CATEGORIES


def _csv(value: str | None) -> list[str] | None:
    if not value:
        return None
    items = [v.strip() for v in value.split(",") if v.strip()]
    return items or None


@app.get("/api/articles")
async def articles(
    sources: str | None = Query(None, description="comma-separated source ids"),
    categories: str | None = Query(None, description="comma-separated category ids"),
    q: str | None = Query(None, max_length=200),
    since_hours: int | None = Query(None, ge=1, le=24 * 30),
    sort: str = Query("newest", pattern="^(newest|oldest)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(config.DEFAULT_PAGE_SIZE, ge=1, le=config.MAX_PAGE_SIZE),
):
    items, total = store.query_articles(
        sources=_csv(sources),
        categories=_csv(categories),
        q=q,
        since_hours=since_hours,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": page * page_size < total,
    }


@app.get("/api/stats")
async def stats():
    return store.stats()


@app.post("/api/refresh")
async def manual_refresh():
    return await refresh_once()


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscription(BaseModel):
    endpoint: str
    keys: PushKeys


class SubscribeRequest(BaseModel):
    subscription: PushSubscription
    categories: list[str] = Field(default_factory=list)


class UnsubscribeRequest(BaseModel):
    endpoint: str


@app.get("/api/push/public-key")
async def push_public_key():
    key = push.public_key()
    if not key:
        raise HTTPException(status_code=503, detail="push notifications not configured")
    return {"publicKey": key}


@app.post("/api/push/subscribe")
async def push_subscribe(req: SubscribeRequest):
    if not push.public_key():
        raise HTTPException(status_code=503, detail="push notifications not configured")
    store.add_subscription(req.subscription.model_dump(), req.categories)
    return {"ok": True}


@app.post("/api/push/unsubscribe")
async def push_unsubscribe(req: UnsubscribeRequest):
    store.remove_subscription(req.endpoint)
    return {"ok": True}
