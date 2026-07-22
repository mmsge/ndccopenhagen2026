#!/bin/sh
# Derive site created/modified timestamps from git history into
# data/page-dates.json, read by src/lib/page-dates.ts at boot.
#
# Runs on the CHECKOUT (make deploy), never in the container — .git is
# dockerignored, so the image can only ever see the generated file. Pure
# git + POSIX sh: the deploy host has no Node outside the containers.
#
# created  = author date of the oldest commit touching the repo
# modified = author date of the newest commit touching the repo
#
# Site-level granularity (one pair for the whole site): this is a single-app
# repo (Next.js), unlike hetzner-server's multi-app layout, so the "app
# directory" pathspec is just the repo root. Same pattern as msge-no (ADR
# 0004) and hetzner-server (ADR 0015). NOTE: a shallow clone (CI, sandbox
# checkouts) collapses dates onto the latest commit; the server checkout is
# a full clone.
set -eu
cd "$(dirname "$0")/.."

OUT=data/page-dates.json

modified=$(git log -1 --format=%aI 2>/dev/null || true)
created=$(git log --format=%aI 2>/dev/null | tail -n 1 || true)

if [ -z "$modified" ] || [ -z "$created" ]; then
  echo "WARN: no git history — skipping page-dates generation" >&2
  exit 0
fi

printf '{\n  "generated": "%s",\n  "created": "%s",\n  "modified": "%s"\n}\n' \
  "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$created" "$modified" > "$OUT"
echo "Wrote $OUT"
