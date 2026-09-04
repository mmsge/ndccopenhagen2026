import fs from "fs";
import path from "path";

// The box slug (== the /srv directory, the Compose project name and the
// subdomain label). Deliberately not `package.json`'s name ("good-news"):
// every ops endpoint on the box reports the slug so the MCP can match it.
export const SLUG = "thegoodtimes";

export type BuildInfo = {
  service: string;
  commit: string | null;
  commit_short: string | null;
  branch: string | null;
  commit_time: string | null;
  repo: string | null;
  dirty: boolean | null;
  built_at: string | null;
  /** build-info = baked into the image (trustworthy); unknown = file absent. */
  source: "build-info" | "unknown";
};

const UNKNOWN: BuildInfo = {
  service: SLUG,
  commit: null,
  commit_short: null,
  branch: null,
  commit_time: null,
  repo: null,
  dirty: null,
  built_at: null,
  source: "unknown",
};

let cached: BuildInfo | null = null;

/**
 * The running IMAGE's git identity, baked in at deploy by
 * scripts/generate-build-info.sh (the image has no .git). See naustet-server
 * ADR 0022 / docs/health-and-version-contract.md.
 *
 * Read lazily and memoised rather than at module load: a Next.js module is
 * evaluated once during `next build` (page-data collection) and again in the
 * server process, and only the second read must decide the answer — the
 * Dockerfile copies build-info.json in AFTER the build.
 *
 * Absent file is NOT an error: report source "unknown" with null fields.
 * Never guess, never fall back to a build-time constant that can go stale.
 */
export function getBuildInfo(): BuildInfo {
  if (cached) return cached;
  try {
    // cwd-relative, the same convention src/lib/page-dates.ts uses.
    //
    // This repo builds Next.js with the DEFAULT output (next.config.ts sets no
    // `output`), served by `next start` from a single-stage image whose WORKDIR
    // is /app — so process.cwd() is /app, exactly where the Dockerfile's last
    // COPY puts the file. Confirmed against a running production image rather
    // than assumed, because getting it wrong fails silently: the read throws,
    // the catch below swallows it, and /version reports "unknown" forever with
    // no error in any log. If this app ever moves to `output: "standalone"`,
    // the runtime root becomes .next/standalone and the Dockerfile COPY has to
    // follow it there.
    const raw = fs.readFileSync(
      path.join(process.cwd(), "build-info.json"),
      "utf-8",
    );
    const parsed = JSON.parse(raw) as Partial<BuildInfo>;
    if (parsed.commit) {
      cached = { ...UNKNOWN, ...parsed, service: SLUG, source: "build-info" };
      return cached;
    }
  } catch {
    // no build-info.json (bare `docker build`, local dev) — fall through.
  }
  cached = UNKNOWN;
  return cached;
}
