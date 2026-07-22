import fs from "fs";
import path from "path";

export type PageDates = { created: string; modified: string };

// Site created/modified, derived from git history and baked in at deploy by
// scripts/generate-page-dates.sh (the image has no .git). Read once at
// module load — this is only ever imported by server components/routes.
// Falls back to boot time when the file is absent (local dev, or a deploy
// that bypassed `make deploy`).
function loadPageDates(): PageDates {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "data", "page-dates.json"),
      "utf-8",
    );
    const parsed = JSON.parse(raw) as { created?: string; modified?: string };
    if (parsed.created && parsed.modified) {
      return { created: parsed.created, modified: parsed.modified };
    }
  } catch {
    // no page-dates.json — fall back below.
  }
  const now = new Date().toISOString();
  return { created: now, modified: now };
}

export const PAGE_DATES: PageDates = loadPageDates();
