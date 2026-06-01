import { db } from "@/db";
import { articles } from "@/db/schema";
import { sql } from "drizzle-orm";
import OutletStats from "@/app/components/OutletStats";
import { FEEDS } from "@/lib/feeds";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const rows = db
    .select({
      source: articles.source,
      total: sql<number>`count(*)`,
      avgScore: sql<number>`round(avg(sentiment_score))`,
      positiveCount: sql<number>`sum(case when sentiment_score >= 60 then 1 else 0 end)`,
    })
    .from(articles)
    .groupBy(articles.source)
    .orderBy(sql`avg(sentiment_score) DESC`)
    .all();

  const colorMap = Object.fromEntries(FEEDS.map((f) => [f.name, f.color]));

  const stats = rows.map((r) => ({
    source: r.source,
    color: colorMap[r.source] ?? "#888",
    total: r.total,
    avgScore: r.avgScore ?? 0,
    positiveRate: r.total > 0 ? Math.round((r.positiveCount / r.total) * 100) : 0,
    sunny: r.positiveCount ?? 0,
  }));

  return (
    <main className="gn-page gn-index">
      <header className="gn-index-head">
        <p className="gn-index-kicker">The Weather Desk · Power Rankings</p>
        <h1 className="gn-index-title">The Sunshine Index</h1>
        <p className="gn-index-sub">Which newsroom is letting in the most light? Outlets ranked by their average sunshine score across every story we&apos;ve pulled.</p>
      </header>
      <OutletStats stats={stats} />
    </main>
  );
}
