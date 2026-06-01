import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  sourceFeed: text("source_feed").notNull(),
  publishedAt: integer("published_at").notNull(),
  imageUrl: text("image_url"),
  ingress: text("ingress"),
  sentimentScore: integer("sentiment_score").notNull(),
  fetchedAt: integer("fetched_at").notNull(),
});

export type Article = typeof articles.$inferSelect;
