PORT ?= 4008

.PHONY: deploy up down restart build logs status stop dev help

help:        ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

# ── Server (Docker Compose) ───────────────────────────────────────────────────
# On the Hetzner box the repo lives at /srv/thegoodtimes.
# Caddy (in the naustet-server repo) proxies thegoodtimes.msge.no → 4008.

deploy:      ## Pull latest code, rebuild image, and restart (run on server)
	git pull --ff-only
	scripts/generate-page-dates.sh || echo "WARN: page-dates generation failed"
	docker compose up -d --build

up:          ## Start the container in the background
	docker compose up -d

down:        ## Stop and remove the container
	docker compose down

restart:     ## Recreate the container
	docker compose down && docker compose up -d

build:       ## Build the image without starting
	docker compose build

logs:        ## Follow container logs
	docker compose logs -f

status:      ## Show container status
	docker compose ps

stop:        ## Stop the container (keep it around)
	docker compose stop

# ── Local development (no Docker) ─────────────────────────────────────────────

dev:         ## Local hot-reload dev server
	npm install
	npm run dev
