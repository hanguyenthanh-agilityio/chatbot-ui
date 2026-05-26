#!/usr/bin/env bash
# Deploy OpenNext bundle to Cloudflare Workers with a fallback if service-binding API fails.
set -euo pipefail

if pnpm exec opennextjs-cloudflare deploy; then
  exit 0
fi

echo "::warning::opennextjs-cloudflare deploy failed; retrying with wrangler deploy (no service bindings)."
node scripts/ci-strip-wrangler-services.mjs
pnpm exec wrangler deploy
