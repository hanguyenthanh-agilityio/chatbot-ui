/** Paths tracked for GitHub/Cloudflare only — stripped before every GitLab push. */
export const GITLAB_DEPLOY_IGNORE_PATHS = [
  ".github/workflows/deploy-cloudflare.yml",
  "public/_headers",
  "cloudflare-worker.ts",
  "open-next.config.ts",
  "wrangler.jsonc",
  "scripts/ci-cloudflare-deploy.sh",
  "scripts/ci-inject-wrangler-account.mjs",
  "scripts/ci-resolve-cloudflare-account.mjs",
  "scripts/ci-strip-wrangler-block.mjs",
  "scripts/ci-strip-wrangler-for-preview.mjs",
  "scripts/ci-strip-wrangler-services.mjs",
];
