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

## Server deployment

```bash
make deploy    # git pull + install + build + restart
make dev       # local hot-reload dev server
make stop      # stop the background server
make logs      # tail server logs
```

`make deploy` prefers **PM2** if installed; falls back to **nohup** otherwise.
