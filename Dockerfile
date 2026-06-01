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

# Bind to 0.0.0.0 so Caddy can reach the container via the Docker bridge.
CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p ${PORT:-4008}"]
