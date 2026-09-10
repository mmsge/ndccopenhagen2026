# The Good Times — production image for the Hetzner server.
#
# Two stages. The build stage carries the toolchain that compiles the native
# `better-sqlite3` addon plus every devDependency `next build` needs; the runtime
# stage starts from a clean slim base and copies the finished, pruned tree across.
#
# Why two stages when one stage already ran `npm prune --omit=dev`: image layers
# are additive. A file deleted in a later layer is still stored in the earlier
# one, so the single-stage image kept the full devDependency install, the g++
# toolchain and Next's compiler cache underneath the prune and weighed 1.6 GB on
# a box with a 40 GB disk. Copying the pruned tree into a fresh stage is what
# actually drops them.

FROM node:22-bookworm-slim AS build

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

# Build the app, drop dev-only dependencies (tailwind, typescript, …), and drop
# `.next/cache`: it is the compiler's incremental cache, worthless at runtime
# and often larger than the build it produced.
COPY . .
RUN npm run build \
  && npm prune --omit=dev \
  && rm -rf .next/cache

FROM node:22-bookworm-slim

WORKDIR /app

# Runtime config. NODE_ENV is production only here, after the build, so `next
# start` runs in production mode without the build having been starved of dev
# deps. SQLite lives on a mounted volume; see docker-compose.yml.
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=4008 \
    GOODNEWS_DB=/data/goodnews.db

# The whole pruned tree, so the runtime sees exactly the files the single-stage
# image did (src/, public/, scripts/, the compiled addon in node_modules), minus
# the toolchain and the layers underneath the prune.
COPY --from=build /app /app
RUN mkdir -p /data

EXPOSE 4008

# Bind to 0.0.0.0 so Caddy can reach the container via the Docker bridge.
CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p ${PORT:-4008}"]
