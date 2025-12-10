#!/usr/bin/env bash
set -euo pipefail

# Self-hosted Node deployment helper.
# Steps:
#   - Install deps
#   - Run migrations & sync JSON to SQLite
#   - Build and start (adjust PM2/systemd as needed)

npm ci
npm run migrate || true
npm run sync || true
npm run build

echo "Build completed. Start server with: npm run start"
