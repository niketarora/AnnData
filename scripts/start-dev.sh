#!/usr/bin/env bash
# KrishiNetra 2.0 Development Environment Launcher
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$DIR/.."

echo "==================================================="
echo "Starting KrishiNetra 2.0 Development Environment"
echo "==================================================="

echo "[1/2] Launching Backend API (Port 4000)..."
(cd "$ROOT_DIR/backend" && npm run dev) &
BACKEND_PID=$!

echo "[2/2] Launching Frontend Mobile App (Expo)..."
(cd "$ROOT_DIR/frontend" && npm start) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

echo "Both servers active. Press Ctrl+C to terminate."
wait
