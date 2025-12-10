#!/usr/bin/env bash
set -euo pipefail

# Simple helper to deploy with Vercel CLI.
# Prerequisites:
#   - npm ci
#   - vercel CLI installed and logged in (`npm i -g vercel`)
#   - NEXT_PUBLIC_BASE_URL set in Vercel project settings

npm run migrate || true
npm run sync || true
npm run build

# Deploy (adjust scope/project as needed)
vercel deploy --prod --confirm
