import Parser from "rss-parser";
import { createHash } from "crypto";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { FEEDS } from "./feeds";
import { scoreText, truncateIngress } from "./analyze";
import { sql } from "drizzle-orm";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

function extractImage(item: Record<string, unknown>): string | null {
  // 1. enclosure
  const enc = item.enclosure as { url?: string; type?: string } | undefined;
  if (enc?.url && enc.type?.startsWith("image/")) return enc.url;

  // 2. media:content
  const mc = item.mediaContent as { $?: { url?: string } } | undefined;
  if (mc?.$?.url) return mc.$.url;

  // 3. media:thumbnail
  const mt = item.mediaThumbnail as { $?: { url?: string } } | undefined;
  if (mt?.$?.url) return mt.$.url;

  // 4. first <img> in content:encoded or description
  const html = (item.contentEncoded as string) || (item.content as string) || (item.summary as string) || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];

  return null;
}

export async function ingestAllFeeds(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items) {
        if (!item.link || !item.title) continue;

        const id = createHash("sha256").update(item.link).digest("hex");
        const description = item.contentSnippet || item.summary || item.content || "";
        const score = scoreText(item.title, description);
        const ingress = truncateIngress(description);
        const publishedAt = item.isoDate
          ? Math.floor(new Date(item.isoDate).getTime() / 1000)
          : Math.floor(Date.now() / 1000);

        const result = db
          .insert(articles)
          .values({
            id,
            url: item.link,
            title: item.title,
            source: feed.name,
            sourceFeed: feed.url,
            publishedAt,
            imageUrl: extractImage(item as unknown as Record<string, unknown>),
            ingress: ingress || null,
            sentimentScore: score,
            fetchedAt: Math.floor(Date.now() / 1000),
          })
          .onConflictDoNothing()
          .run();

        if (result.changes > 0) {
          inserted++;
        } else {
          skipped++;
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${feed.name}:`, err);
    }
  }

  return { inserted, skipped };
}

export function getLastFetchAt(): number | null {
  const row = db
    .select({ fetchedAt: articles.fetchedAt })
    .from(articles)
    .orderBy(sql`fetched_at DESC`)
    .limit(1)
    .all();
  return row[0]?.fetchedAt ?? null;
}
