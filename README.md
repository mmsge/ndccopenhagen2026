# The Good Times — NDC Copenhagen 2026

> *"All the news that's glad to print."*

A good-news gazette that pulls RSS feeds from major outlets, scores each article's positivity 0–100 using local sentiment analysis, and shows only the happy stories. Built as the capstone demo for **Vibe Coding for Production** at NDC Copenhagen 2026.

## Features

- **Mood Weather hero** — aggregate score across today's stories shown as a weather forecast (Glorious → Stormy)
- **"Set your sunshine" slider** — filter articles by minimum positivity score
- **Sunniest / Freshest sort** — instant client-side reordering
- **Lead story + card grid** — editorial layout with generated SVG cover art
- **Sunshine Index dashboard** — outlets ranked by average positivity score
- **"Run the Presses"** — refreshes all feeds with a press overlay animation

## Tech

- Next.js 16 (App Router) · TypeScript · Tailwind CSS
- SQLite via Drizzle ORM (`better-sqlite3`)
- `sentiment` npm package (AFINN-165, no external API)
- `rss-parser` for RSS ingestion
- Fonts: Bricolage Grotesque · Newsreader · Space Mono

## Quick start (local)

```bash
npm install
npm run dev
# open http://localhost:3000
# click "Run the Presses" to fetch articles
```

## Server deployment (Hetzner)

Runs as a self-contained **Docker Compose** service, fronted by the Caddy
instance in the [`hetzner-server`](https://github.com/mmsge/hetzner-server) repo
— matching the convention used by the other services on the box.

| Key | Value |
|-----|-------|
| Domain | `thegoodtimes.msge.no` |
| Internal port | `4008` (published on `0.0.0.0` for the Caddy bridge) |
| Repo path on server | `/var/www/thegoodtimes` |
| Persistence | SQLite at `./data/goodnews.db` (bind-mounted to `/data`) |

First-time setup on the server:

```bash
git clone https://github.com/mmsge/ndccopenhagen2026 /var/www/thegoodtimes
cd /var/www/thegoodtimes
make deploy
```

The Caddy block for `thegoodtimes.msge.no` is in the `hetzner-server` repo. If
the DNS A record doesn't exist yet, create it on the server with
`make add-subdomain SUBDOMAIN=thegoodtimes DOMAIN=msge.no PORT=4008`. Once both
are in place the service is reachable over HTTPS.

```bash
make deploy    # git pull + docker compose up -d --build  (run on server)
make logs      # follow container logs
make status    # show container status
make restart   # recreate the container
make down      # stop and remove the container
make dev       # local hot-reload dev server (no Docker)
```

Open the site and click **"Run the Presses"** to fetch the first batch of
articles. The SQLite database persists across rebuilds via the `./data` volume.
