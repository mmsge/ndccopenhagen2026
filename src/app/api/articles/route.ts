import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);

  const rows = db
    .select()
    .from(articles)
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .all();

  return NextResponse.json(rows);
}
