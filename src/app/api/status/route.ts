import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const row = db
    .select({
      total: sql<number>`count(*)`,
      lastFetchAt: sql<number | null>`max(fetched_at)`,
    })
    .from(articles)
    .get();

  return NextResponse.json({ total: row?.total ?? 0, lastFetchAt: row?.lastFetchAt ?? null });
}
