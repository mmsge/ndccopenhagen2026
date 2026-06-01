import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = db
    .select({
      source: articles.source,
      total: sql<number>`count(*)`,
      avgScore: sql<number>`round(avg(sentiment_score))`,
      positiveCount: sql<number>`sum(case when sentiment_score >= 60 then 1 else 0 end)`,
    })
    .from(articles)
    .groupBy(articles.source)
    .orderBy(sql`count(*) DESC`)
    .all();

  const stats = rows.map((r) => ({
    source: r.source,
    total: r.total,
    avgScore: r.avgScore,
    positiveRate: r.total > 0 ? Math.round((r.positiveCount / r.total) * 100) : 0,
  }));

  return NextResponse.json(stats);
}
