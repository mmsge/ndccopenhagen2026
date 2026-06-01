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

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Install deps first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Build the app, then drop dev-only dependencies (tailwind, typescript, …).
COPY . .
RUN npm run build \
  && npm prune --omit=dev

# SQLite lives on a mounted volume; see docker-compose.yml.
ENV PORT=4004 \
    GOODNEWS_DB=/data/goodnews.db
RUN mkdir -p /data

EXPOSE 4004

# Bind to 0.0.0.0 so Caddy can reach the container via the Docker bridge.
CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p ${PORT:-4004}"]
