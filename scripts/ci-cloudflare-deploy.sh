#!/usr/bin/env bash
# Production (main): opennextjs-cloudflare deploy → applies DO migrations + bindings.
# Preview (feature branches): wrangler versions upload --preview-alias.
#   Strip migrations + durable_objects (versions upload cannot apply migrations; DO may
#   not exist on the Worker yet). OpenAI key validation falls back to direct fetch.
set -euo pipefail

WORKER_NAME="${CLOUDFLARE_WORKER_NAME:-ai-sdk}"

sanitize_preview_alias() {
  local raw="${1:-branch}"
  echo "$raw" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9-]+/-/g; s/^-+|-+$//g' | cut -c1-50
}

write_preview_summary() {
  local alias="$1"
  echo "### App preview (Worker)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  echo "Branch alias: \`${alias}\`" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  echo "Preview URL: \`https://${alias}-${WORKER_NAME}.ha-nguyenthanh.workers.dev\`" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  echo "" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  echo "_Preview omits Durable Object bindings; OpenAI validation uses direct API fallback._" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
}

deploy_preview() {
  local alias
  alias="$(sanitize_preview_alias "${CLOUDFLARE_PREVIEW_ALIAS:-${GITHUB_REF_NAME:-preview}}")"

  node scripts/ci-strip-wrangler-for-preview.mjs

  echo "Uploading Worker preview version (alias: ${alias})"
  if pnpm exec wrangler versions upload --preview-alias "$alias"; then
    write_preview_summary "$alias"
    return 0
  fi

  echo "::warning::wrangler versions upload failed; retrying without service bindings."
  node scripts/ci-strip-wrangler-block.mjs services
  if pnpm exec wrangler versions upload --preview-alias "$alias"; then
    write_preview_summary "$alias"
    return 0
  fi

  echo "::error::Preview deploy failed after stripping migrations, durable_objects, and services."
  exit 1
}

deploy_production() {
  if pnpm exec opennextjs-cloudflare deploy; then
    return 0
  fi

  echo "::warning::opennextjs-cloudflare deploy failed; retrying with wrangler deploy (no service bindings)."
  node scripts/ci-strip-wrangler-block.mjs services
  pnpm exec wrangler deploy
}

if [ "${CLOUDFLARE_DEPLOY_PRODUCTION:-}" = "true" ]; then
  deploy_production
else
  deploy_preview
fi
