#!/usr/bin/env bash
set -euo pipefail

# Simple helper to deploy with Netlify CLI.
# Prerequisites:
#   - npm ci
#   - netlify-cli installed (`npm i -g netlify-cli`)
#   - NEXT_PUBLIC_BASE_URL set in Netlify environment

npm run migrate || true
npm run sync || true
npm run build

# Deploy using Netlify CLI (site must be linked)
netlify deploy --prod --dir=".next" --message "Next.js build"
