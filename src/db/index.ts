import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { articles } from "./schema";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "goodnews.db");

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
