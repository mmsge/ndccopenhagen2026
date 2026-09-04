# The Good Times — production image for the Hetzner server.
#
# Single Debian-based stage so the native `better-sqlite3` binary is compiled
# against the same glibc it runs on. Dev dependencies are pruned after the
# build, so the final image carries only what `next start` needs at runtime.

FROM node:22-bookworm-slim

WORKDIR /app

# Toolchain for compiling better-sqlite3's native addon.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

ENV NEXT_TELEMETRY_DISABLED=1

# Install deps first for better layer caching. NODE_ENV stays unset here so
# npm installs devDependencies (tailwind, typescript) needed for the build.
COPY package.json package-lock.json ./
RUN npm ci

# Build the app, then drop dev-only dependencies (tailwind, typescript, …).
COPY . .
RUN npm run build \
  && npm prune --omit=dev

# Runtime config. NODE_ENV flips to production only now — after the build —
# so `next start` runs in production mode without starving the build of dev deps.
# SQLite lives on a mounted volume; see docker-compose.yml.
ENV NODE_ENV=production \
    PORT=4008 \
    GOODNEWS_DB=/data/goodnews.db
RUN mkdir -p /data

EXPOSE 4008

# ── /version's build identity — the LAST COPY, deliberately ──────────────────
# scripts/generate-build-info.sh writes ./build-info.json on the CHECKOUT at
# `make deploy`, BEFORE this build, so the SHA is baked into the IMAGE. That is
# the whole point: a `git pull` without a rebuild then leaves the container
# serving a visibly older commit. See naustet-server ADR 0022.
#
# Four details that all matter here:
#   1. The glob form `build-info.jso[n]` makes this a no-op when the file is
#      absent, so a bare `docker build` (CI, a local smoke test) still works —
#      a plain `COPY build-info.json` would fail the build instead. The app
#      then reports {"source": "unknown"}, which is the contract's answer.
#   2. It is LAST because `built_at` changes on every deploy; any earlier and
#      it would bust the layer cache for `npm ci` and `npm run build`.
#   3. WHICH directory the runtime actually serves from — the Next.js trap that
#      pins /version to "unknown" forever with no error anywhere. next.config.ts
#      sets NO `output` option, so this is the DEFAULT Next.js build, *not*
#      `output: "standalone"`, and this image is a SINGLE stage: /app is both
#      the build tree and the runtime filesystem, and CMD runs `next start`
#      with WORKDIR /app — so process.cwd() is /app, exactly where this COPY
#      lands and where src/lib/build-info.ts reads from.
#      If this repo ever switches to `output: "standalone"`, the runtime root
#      becomes /app/.next/standalone and this COPY must move with it: with
#      standalone output only .next/standalone, .next/static and public reach
#      the runtime stage, so a builder-stage `COPY . .` would never carry
#      build-info.json across and /version would silently read "unknown".
#   4. NOT added to .dockerignore: excluding it there would make the glob above
#      no-op forever and /version would read "unknown" with no error anywhere.
COPY build-info.jso[n] ./

# Bind to 0.0.0.0 so Caddy can reach the container via the Docker bridge.
CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p ${PORT:-4008}"]
