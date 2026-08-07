import { getBuildInfo } from "@/lib/build-info";

// Which commit is ACTUALLY running — the image's identity, not the checkout's.
// A `git pull` without a rebuild leaves the container serving old code; the
// deploy badge (which only sees .git on the box) cannot spot that, this can.
// See naustet-server ADR 0007 / 0022.
//
// Public endpoint: every field here is on the contract's allowlist. no-store
// because caching the endpoint you use to DETECT staleness defeats it.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(getBuildInfo(), {
    headers: { "cache-control": "no-store" },
  });
}
