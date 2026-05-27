#!/usr/bin/env bash
# Production (main): opennextjs-cloudflare deploy → Worker "ai-sdk".
# Preview (other branches): wrangler versions upload --preview-alias <branch-slug>.
set -euo pipefail

WORKER_NAME="${CLOUDFLARE_WORKER_NAME:-ai-sdk}"

sanitize_preview_alias() {
  local raw="${1:-branch}"
  echo "$raw" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9-]+/-/g; s/^-+|-+$//g' | cut -c1-50
}

deploy_preview() {
  local alias
  alias="$(sanitize_preview_alias "${CLOUDFLARE_PREVIEW_ALIAS:-${GITHUB_REF_NAME:-preview}}")"

  echo "Uploading Worker preview version (alias: ${alias})"
  if pnpm exec wrangler versions upload --preview-alias "$alias"; then
    echo "### App preview (Worker)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
    echo "Branch alias: \`${alias}\`" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
    echo "Preview URL: \`https://${alias}-${WORKER_NAME}.<account>.workers.dev\` (see wrangler output for exact host)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
    return 0
  fi

  echo "::warning::wrangler versions upload failed; retrying without service bindings."
  node scripts/ci-strip-wrangler-services.mjs
  pnpm exec wrangler versions upload --preview-alias "$alias"
  echo "### App preview (Worker)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  echo "Branch alias: \`${alias}\`" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  echo "Preview URL: \`https://${alias}-${WORKER_NAME}.<account>.workers.dev\` (see wrangler output for exact host)" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
}

deploy_production() {
  if pnpm exec opennextjs-cloudflare deploy; then
    return 0
  fi

  echo "::warning::opennextjs-cloudflare deploy failed; retrying with wrangler deploy (no service bindings)."
  node scripts/ci-strip-wrangler-services.mjs
  pnpm exec wrangler deploy
}

if [ "${CLOUDFLARE_DEPLOY_PRODUCTION:-}" = "true" ]; then
  deploy_production
else
  deploy_preview
fi
