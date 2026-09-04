# The Good Times — NDC Copenhagen 2026

[![deployed](https://img.shields.io/endpoint?url=https://utrulla.msge.no/badge/mmsge/ndccopenhagen2026)](https://thegoodtimes.msge.no)

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
instance in the [`naustet-server`](https://github.com/mmsge/naustet-server) repo
— matching the convention used by the other services on the box.

| Key | Value |
|-----|-------|
| Domain | `thegoodtimes.msge.no` |
| Internal port | `4008` (published on `0.0.0.0` for the Caddy bridge) |
| Repo path on server | `/srv/thegoodtimes` |
| Persistence | SQLite at `./data/goodnews.db` (bind-mounted to `/data`) |

First-time setup on the server:

```bash
git clone https://github.com/mmsge/ndccopenhagen2026 /srv/thegoodtimes
cd /srv/thegoodtimes
make deploy
```

The Caddy block for `thegoodtimes.msge.no` is in the `naustet-server` repo. If
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

## Ops endpoints

Three fixed, unauthenticated paths, per the box-wide contract
(`naustet-server/docs/health-and-version-contract.md`, ADR 0022). They live at the
**root**, not under `/api/`, and are `Disallow`ed in `robots.txt`.

| Path | Answers | Response |
|------|---------|----------|
| `/healthz` | Is the process alive? | `200 text/plain`, body exactly `ok` (2 bytes, no newline). Dependency-free — this is what the Compose `healthcheck:` byte-compares. |
| `/version` | Which commit is *actually* running? | `200 application/json` — the identity of the **image**, baked in at deploy. |
| `/health` | Is it working, and if not, which part? | `application/json`; `200` for `ok`/`degraded`, `503` only for `error`. |

All three send `Cache-Control: no-store`.

`/version` reads `build-info.json`, written on the checkout by
`scripts/generate-build-info.sh` **before** the image build (`make deploy`) and
copied into the image as the Dockerfile's last `COPY`. That ordering is the point:
a `git pull` that isn't followed by a rebuild leaves the container serving — and
reporting — the older commit. With no `build-info.json` the endpoint reports
`{"source": "unknown"}` with null fields; that is not an error.

`/health` reports a **closed vocabulary** of check names — nothing else ever
appears, and no paths, hostnames, ports, env vars, SQL, dependency versions or
exception text go in the response:

| `checks[].name` | What it proves |
|---|---|
| `database` | a real `count(*)` against SQLite on the mounted volume, with `latency_ms` and a row count |
| `ingest` | `age_seconds` since the newest article fetch — catches feeds that quietly stopped refreshing (`degraded` past 7 days) |
| `render` | the built client assets are present in the image — `next start` boots happily on a half-built `.next` while every page 404s its JS/CSS |

```bash
make verify                       # probe all three on 127.0.0.1:4008
make verify VERIFY_URL=https://thegoodtimes.msge.no
```
