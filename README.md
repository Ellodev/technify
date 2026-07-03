# ⚡ technify v2

Free and open source tech news aggregator. One clean feed for the latest from
TechCrunch, The Verge, Ars Technica, Wired, Hacker News, BBC, The Guardian,
Engadget, MIT Technology Review, The Register and Hackaday.

**v2 is a full overhaul:**

- 🎨 New responsive design with article images, dark/light mode
- 🗂️ Automatic categorization (AI, Security, Gadgets, Gaming, Science, Startups, Dev, EVs, Crypto)
- 🔎 Better filtering: multi-source, multi-category, full-text search, time range, sort
- 📱 Installable mobile PWA with offline support
- 🔔 Web push notifications for new stories (digest per refresh, per-category opt-in supported by the API)
- 🐳 One-command deploy with Docker Compose, plus Kubernetes manifests
- 🐍 Self-hosted FastAPI backend (replaces the old AWS Lambda + S3 setup) with SQLite — no cloud dependencies

## Architecture

```
website/  Next.js 14 app (App Router, Tailwind, PWA service worker)
   │  /api/* is proxied server-side to the backend (no CORS needed)
   ▼
backend/  FastAPI + SQLite
   - fetches all RSS/Atom feeds every 15 min (configurable)
   - categorizes, deduplicates, extracts images, prunes old articles
   - sends web push digests to subscribers on new stories
```

## Quick start (Docker Compose)

```bash
docker compose up --build
# open http://localhost:3000
```

That's it. Articles appear after the first feed refresh (a few seconds).
Push notification keys are generated automatically and persisted in the
`technify-data` volume.

## Local development

Backend:

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload          # http://localhost:8000
```

Frontend (proxies `/api/*` to `API_URL`, default `http://localhost:8000`):

```bash
cd website
yarn install
yarn dev                                          # http://localhost:3000
```

## Kubernetes

Build and push the two images, point the manifests at them, then:

```bash
docker build -t ghcr.io/ellodev/technify-backend:latest ./backend
docker build -t ghcr.io/ellodev/technify-web:latest --build-arg API_URL=http://backend:8000 ./website

kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/backend.yaml
kubectl apply -f deploy/k8s/web.yaml
kubectl apply -f deploy/k8s/ingress.yaml   # edit the host first
```

Notes:

- The backend runs as a single replica with SQLite on a PVC; swap in Postgres
  before scaling it out.
- For stable push notifications across restarts, mount your own VAPID key as a
  secret (see comments in `deploy/k8s/backend.yaml`). Web push requires the
  site to be served over HTTPS.

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/articles` | Feed with `sources`, `categories`, `q`, `since_hours`, `sort`, `page`, `page_size` params |
| `GET /api/sources` | Available providers |
| `GET /api/categories` | Available categories |
| `GET /api/stats` | Article counts and last refresh time |
| `POST /api/refresh` | Trigger a feed refresh now |
| `GET /api/push/public-key` | VAPID public key |
| `POST /api/push/subscribe` | Register a push subscription (optional `categories` filter) |
| `POST /api/push/unsubscribe` | Remove a push subscription |

## Configuration (backend env vars)

| Variable | Default | |
| --- | --- | --- |
| `REFRESH_INTERVAL_MINUTES` | `15` | Feed refresh cadence |
| `MAX_ARTICLE_AGE_DAYS` | `14` | Prune articles older than this |
| `DATA_DIR` | `./data` | SQLite database + generated VAPID key location |
| `VAPID_PRIVATE_KEY` | generated | PEM private key for web push |
| `VAPID_SUBJECT` | `mailto:admin@technify.local` | VAPID contact |
| `CORS_ORIGINS` | `*` | Allowed origins (only relevant without the proxy) |

Add a provider by appending one line to `backend/app/feeds.py`.

## License

MIT
