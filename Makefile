PORT ?= 3000

.PHONY: deploy restart start stop dev logs install build

# Pull latest code, rebuild, and restart the server
deploy:
	git pull
	npm install
	npm run build
	$(MAKE) restart

# Build without pulling (useful after manual changes)
build:
	npm install
	npm run build

# Restart the server process (PM2 if available, nohup fallback)
restart:
	@if command -v pm2 >/dev/null 2>&1; then \
		pm2 restart good-times 2>/dev/null \
		  || PORT=$(PORT) pm2 start npm --name good-times -- start; \
		echo "Started with PM2 on port $(PORT)"; \
	else \
		pkill -f "next start" 2>/dev/null || true; \
		sleep 1; \
		PORT=$(PORT) nohup npm start > server.log 2>&1 & echo $$! > server.pid; \
		echo "Started in background on port $(PORT) (PID $$(cat server.pid))"; \
		echo "Logs: tail -f server.log"; \
	fi

# Start in the foreground — useful inside tmux / screen
start:
	PORT=$(PORT) npm start

# Stop the server
stop:
	@if command -v pm2 >/dev/null 2>&1; then \
		pm2 stop good-times 2>/dev/null || true; \
	elif [ -f server.pid ]; then \
		kill $$(cat server.pid) 2>/dev/null && rm -f server.pid || true; \
	fi
	@echo "Server stopped"

# Tail server logs
logs:
	@if command -v pm2 >/dev/null 2>&1; then \
		pm2 logs good-times; \
	else \
		tail -f server.log; \
	fi

# Local development with hot-reload
dev:
	npm run dev
