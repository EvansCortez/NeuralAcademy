#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting NeuralAcademy backend on http://127.0.0.1:8000"
cd "$ROOT/backend"
if [ ! -d .venv ]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi
.venv/bin/uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "Starting NeuralAcademy frontend on http://127.0.0.1:5173"
cd "$ROOT/frontend"
npm install --silent
npm run dev &
FRONTEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo ""
echo "NeuralAcademy is running."
echo "  Frontend: http://127.0.0.1:5173"
echo "  Backend:  http://127.0.0.1:8000"
echo "Press Ctrl+C to stop both servers."
wait
