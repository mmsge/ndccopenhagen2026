import fs from "fs";
import path from "path";
import { sql } from "drizzle-orm";
import { articles } from "@/db/schema";
import { SLUG, getBuildInfo } from "@/lib/build-info";

// Readiness + diagnostics. Box-wide contract: naustet-server ADR 0022 /
// docs/health-and-version-contract.md.
//
// THIS ENDPOINT IS PUBLIC. It is redacted by ALLOWLIST, not by judgement:
// no filesystem paths, no internal hostnames/IPs/ports, no env vars, no DSNs,
// no SQL, no table names, no library/framework/runtime versions (that is CVE
// fingerprinting — so nothing about Next.js or Node here), no exception text.
// `detail` comes from the contract's fixed vocabulary or is a plain count.
//
// `degraded` returns 200; ONLY `error` returns 503. If degraded were 503 and
// someone pointed a container healthcheck at /health, an empty feed backlog
// would restart-loop the container forever.
export const dynamic = "force-dynamic";

const STARTED_AT = new Date();

/** A gazette whose newest fetch is older than this is stale, not broken. */
const INGEST_STALE_SECONDS = 7 * 24 * 60 * 60;

type CheckStatus = "ok" | "degraded" | "error";

type Check = {
  /** Closed vocabulary for this service: database | ingest | render. */
  name: "database" | "ingest" | "render";
  status: CheckStatus;
  latency_ms?: number;
  age_seconds?: number;
  detail?: string;
};

/**
 * Does the SQLite file answer, and how much is in it? A real query, not a
 * ping: the DB lives on a mounted volume, so "the process is up" says nothing
 * about whether the volume is there.
 */
async function checkDatabaseAndIngest(): Promise<Check[]> {
  const t0 = performance.now();
  try {
    // Imported lazily and inside the try: `@/db` opens SQLite at module load,
    // so a missing volume would throw during import. A static import would
    // make that a 500 HTML page — precisely the outage /health exists to
    // explain. Lazily, it becomes a clean 503 with a classified detail.
    const { db } = await import("@/db");

    const row = db
      .select({
        total: sql<number>`count(*)`,
        lastFetchAt: sql<number | null>`max(fetched_at)`,
      })
      .from(articles)
      .get();

    const latency = Math.round((performance.now() - t0) * 10) / 10;
    const total = row?.total ?? 0;
    const lastFetchAt = row?.lastFetchAt ?? null;

    const database: Check = {
      name: "database",
      status: "ok",
      latency_ms: latency,
      detail: `reachable; ${total} rows`,
    };

    // The gazette only has something to show if the feeds have been ingested.
    // Age since the newest fetch is what catches a refresh that stopped
    // working — the page still renders, it just quietly goes out of date.
    if (lastFetchAt === null) {
      return [database, { name: "ingest", status: "degraded", detail: "not found" }];
    }
    const age = Math.max(0, Math.floor(Date.now() / 1000) - lastFetchAt);
    return [
      database,
      {
        name: "ingest",
        status: age > INGEST_STALE_SECONDS ? "degraded" : "ok",
        age_seconds: age,
        detail: `${total} rows`,
      },
    ];
  } catch {
    // Classified word only — never the exception: it carries the DB path.
    return [
      { name: "database", status: "error", detail: "unavailable" },
      { name: "ingest", status: "error", detail: "unavailable" },
    ];
  }
}

/**
 * Are the built client assets actually in the image? The substantive check for
 * a mostly-static site: `next start` boots happily on a half-built .next, and
 * you get a container that is green on /healthz while every page 404s its JS
 * and CSS. Cheap (two shallow readdirs), and it fails exactly when a broken
 * build stage would.
 */
function checkRender(): Check {
  const t0 = performance.now();
  const missing: Check = { name: "render", status: "error", detail: "not found" };
  try {
    const nextDir = path.join(process.cwd(), ".next");
    const buildId = fs.readFileSync(path.join(nextDir, "BUILD_ID"), "utf-8").trim();
    if (!buildId) return missing;

    let assets = 0;
    const staticDir = path.join(nextDir, "static");
    for (const entry of fs.readdirSync(staticDir, { withFileTypes: true })) {
      assets += entry.isDirectory()
        ? fs.readdirSync(path.join(staticDir, entry.name)).length
        : 1;
    }
    if (assets === 0) return missing;

    return {
      name: "render",
      status: "ok",
      latency_ms: Math.round((performance.now() - t0) * 10) / 10,
      detail: `${assets} assets`,
    };
  } catch {
    return missing;
  }
}

function worst(checks: Check[]): CheckStatus {
  if (checks.some((c) => c.status === "error")) return "error";
  if (checks.some((c) => c.status === "degraded")) return "degraded";
  return "ok";
}

export async function GET() {
  const checks: Check[] = [...(await checkDatabaseAndIngest()), checkRender()];
  const status = worst(checks);

  const body = {
    status,
    service: SLUG,
    commit_short: getBuildInfo().commit_short,
    started_at: STARTED_AT.toISOString(),
    uptime_seconds: Math.floor((Date.now() - STARTED_AT.getTime()) / 1000),
    checked_at: new Date().toISOString(),
    checks,
  };

  return Response.json(body, {
    status: status === "error" ? 503 : 200,
    headers: { "cache-control": "no-store" },
  });
}
