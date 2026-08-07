// Liveness. Box-wide contract: naustet-server ADR 0022 /
// docs/health-and-version-contract.md.
//
// The body is EXACTLY "ok" — two bytes, no trailing newline. The Compose
// healthcheck byte-compares it, so a pretty-printer or a stray "\n" breaks
// the healthcheck silently.
//
// Dependency-free ON PURPOSE: no database, no upstream, no disk. The Compose
// healthcheck restarts the container on failure, so wiring this to the real
// readiness answer would restart-loop the app every time SQLite is slow.
// "Is it working?" is /health's job.
export const dynamic = "force-dynamic";

export function GET() {
  return new Response("ok", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
