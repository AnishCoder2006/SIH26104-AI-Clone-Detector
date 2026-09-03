#!/bin/sh
set -e

uvicorn main:app --app-dir /app/backend --host 0.0.0.0 --port "${BACKEND_PORT:-8000}" &
backend_pid=$!

cleanup() {
  kill "$backend_pid" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

cd /app/frontend
exec npm start -- --hostname 0.0.0.0 --port "${PORT:-7860}"
