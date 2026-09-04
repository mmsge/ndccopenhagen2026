PORT ?= 4008
# Where `make verify` probes. 127.0.0.1 (not "localhost") so it can't resolve
# to ::1 while the container listens on IPv4 only.
VERIFY_URL ?= http://127.0.0.1:$(PORT)

.PHONY: deploy up down restart build logs status stop dev verify help

help:        ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

# ── Server (Docker Compose) ───────────────────────────────────────────────────
# On the Hetzner box the repo lives at /srv/thegoodtimes.
# Caddy (in the naustet-server repo) proxies thegoodtimes.msge.no → 4008.

deploy:      ## Pull latest code, rebuild image, and restart (run on server)
	git pull --ff-only
	scripts/generate-page-dates.sh || echo "WARN: page-dates generation failed"
	# BEFORE the build, always: it writes build-info.json on the checkout so the
	# Dockerfile's last COPY bakes the SHA into the IMAGE. Run it after the
	# build and /version would describe an image that no longer exists.
	# naustet-server ADR 0022.
	scripts/generate-build-info.sh || echo "WARN: build-info generation failed"
	docker compose up -d --build

verify:      ## Probe the three ops endpoints on a running instance
	@set -eu; base="$(VERIFY_URL)"; fail=0; unhealthy=0; \
	tmp=$$(mktemp -d); trap 'rm -rf "$$tmp"' EXIT; \
	printf 'Probing %s\n' "$$base"; \
	\
	if ! curl -fsS -D "$$tmp/h" -o "$$tmp/b" "$$base/healthz"; then \
		echo "  FAIL /healthz unreachable"; exit 1; fi; \
	if [ "$$(wc -c < "$$tmp/b" | tr -d ' ')" = "2" ] && [ "$$(cat "$$tmp/b")" = "ok" ]; then \
		echo "  ok   /healthz  body is exactly 'ok' (2 bytes)"; \
	else echo "  FAIL /healthz  body must be exactly 'ok' — 2 bytes, no newline"; fail=1; fi; \
	grep -qi '^cache-control:.*no-store' "$$tmp/h" || { echo "  FAIL /healthz  missing Cache-Control: no-store"; fail=1; }; \
	\
	code=$$(curl -sS -D "$$tmp/h" -o "$$tmp/b" -w '%{http_code}' "$$base/version"); \
	[ "$$code" = "200" ] || { echo "  FAIL /version  HTTP $$code"; fail=1; }; \
	grep -qi '^content-type:.*application/json' "$$tmp/h" || { echo "  FAIL /version  not application/json (a catch-all route ate it?)"; fail=1; }; \
	grep -qi '^cache-control:.*no-store' "$$tmp/h" || { echo "  FAIL /version  missing Cache-Control: no-store"; fail=1; }; \
	: "source=unknown is a HARD failure, not a warning: it is the exact silent"; \
	: "mode this whole mechanism exists to kill — the endpoint answers 200 with"; \
	: "well-formed JSON and no error appears anywhere, while /version has quietly"; \
	: "stopped being able to tell you what is running. It means generate-build-"; \
	: "info.sh did not run before the build, or .dockerignore ate the file."; \
	if grep -q '"source": *"build-info"' "$$tmp/b"; then \
		echo "  ok   /version   $$(sed -n 's/.*"commit_short"[[:space:]]*:[[:space:]]*"\([0-9a-f]*\)".*/\1/p' "$$tmp/b") (source: build-info)"; \
	elif grep -q '"source": *"unknown"' "$$tmp/b"; then \
		echo "  FAIL /version  source=unknown — build-info.json never reached the image."; \
		echo "                 Run scripts/generate-build-info.sh BEFORE the build (make deploy does)."; \
		fail=1; \
	else echo "  FAIL /version  no 'source' field"; fail=1; fi; \
	\
	code=$$(curl -sS -D "$$tmp/h" -o "$$tmp/b" -w '%{http_code}' "$$base/health"); \
	grep -qi '^content-type:.*application/json' "$$tmp/h" || { echo "  FAIL /health   not application/json"; fail=1; }; \
	grep -qi '^cache-control:.*no-store' "$$tmp/h" || { echo "  FAIL /health   missing Cache-Control: no-store"; fail=1; }; \
	: "anchored at ^{ on purpose — an unanchored .* is greedy and would pick up"; \
	: "the LAST checks[].status instead of the top-level one"; \
	status=$$(sed -n 's/^{[[:space:]]*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$$tmp/b" | head -1); \
	: "Two different axes, tracked separately so the exit code can't lie:"; \
	: "  fail      = the CONTRACT is broken (wrong code, wrong type, wrong body)"; \
	: "  unhealthy = the contract works perfectly and is reporting an outage"; \
	: "Either one exits non-zero — a verify that prints OK while a dependency is"; \
	: "down is worse than no verify at all — but they print differently, because"; \
	: "the fixes are nothing alike."; \
	case "$$status:$$code" in \
		ok:200|degraded:200) echo "  ok   /health    $$status (HTTP $$code)";; \
		error:503) echo "  DOWN /health    error (HTTP 503) — the contract is fine; a dependency is not."; \
			echo "                 failing checks: $$(tr '{' '\n' < "$$tmp/b" | grep '"status": *"error"' | sed -n 's/.*"name": *"\([^"]*\)".*/\1/p' | tr '\n' ' ')"; \
			unhealthy=1;; \
		degraded:503) echo "  FAIL /health   degraded must be 200, not 503 — a compose healthcheck"; \
			echo "                 pointed here would restart-loop on a slow upstream"; fail=1;; \
		*) echo "  FAIL /health   unexpected status='$$status' HTTP $$code"; fail=1;; \
	esac; \
	grep -q '"checks"' "$$tmp/b" || { echo "  FAIL /health   no checks[] array — /health must carry at least one substantive check"; fail=1; }; \
	\
	[ "$$fail" = "0" ] || { echo "verify FAILED — the ops contract is broken"; exit 1; }; \
	[ "$$unhealthy" = "0" ] || { echo "verify FAILED — endpoints are correct, but the service is unhealthy"; exit 1; }; \
	echo "verify OK"

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
