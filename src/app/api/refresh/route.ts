import { NextResponse } from "next/server";
import { ingestAllFeeds } from "@/lib/ingest";

export async function POST() {
  const result = await ingestAllFeeds();
  return NextResponse.json(result);
}
