import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { articles } from "./schema";
import fs from "fs";
import path from "path";

// Location of the SQLite file. Override with GOODNEWS_DB in production
// (e.g. a mounted volume at /data/goodnews.db); defaults to ./data locally.
const DB_PATH =
  process.env.GOODNEWS_DB || path.join(process.cwd(), "data", "goodnews.db");

// Make sure the parent directory exists so a fresh deploy can create the file.
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    source_feed TEXT NOT NULL,
    published_at INTEGER NOT NULL,
    image_url TEXT,
    ingress TEXT,
    sentiment_score INTEGER NOT NULL,
    fetched_at INTEGER NOT NULL
  )
`);

export const db = drizzle(sqlite, { schema: { articles } });
