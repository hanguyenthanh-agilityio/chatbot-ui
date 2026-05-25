/**
 * Resolve the Cloudflare account ID for CI deploy.
 * Uses the API token to list accessible accounts so a wrong CLOUDFLARE_ACCOUNT_ID
 * secret (zone id, email, etc.) does not break Workers deploy with error 10000.
 */
import { appendFileSync } from "node:fs";

const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const preferred = process.env.CLOUDFLARE_ACCOUNT_ID?.trim().replace(/["']/g, "");
const githubOutput = process.env.GITHUB_OUTPUT;

if (!token) {
  console.error("::error::CLOUDFLARE_API_TOKEN is not set.");
  process.exit(1);
}

const response = await fetch("https://api.cloudflare.com/client/v4/accounts", {
  headers: { Authorization: `Bearer ${token}` },
});
const payload = await response.json();

if (!payload.success) {
  console.error("::error::Could not list Cloudflare accounts for this token.");
  console.error(JSON.stringify(payload.errors ?? payload));
  process.exit(1);
}

const accounts = payload.result ?? [];
if (accounts.length === 0) {
  console.error(
    "::error::Token has no account access. Use template Edit Cloudflare Workers and include your account under Account Resources.",
  );
  process.exit(1);
}

let accountId = null;

if (preferred && /^[a-f0-9]{32}$/i.test(preferred)) {
  const normalized = preferred.toLowerCase();
  const match = accounts.find((a) => a.id?.toLowerCase() === normalized);
  if (match) {
    accountId = match.id;
    console.log(`Using CLOUDFLARE_ACCOUNT_ID secret: ${accountId} (${match.name})`);
  } else {
    console.warn(
      `::warning::CLOUDFLARE_ACCOUNT_ID secret (${normalized}) is not in this token's accounts. Using first account instead.`,
    );
  }
} else if (preferred) {
  console.warn(
    `::warning::CLOUDFLARE_ACCOUNT_ID is not a 32-char hex id (got length ${preferred.length}). Auto-selecting account.`,
  );
}

if (!accountId) {
  accountId = accounts[0].id;
  console.log(`Using account: ${accountId} (${accounts[0].name})`);
}

if (githubOutput) {
  appendFileSync(githubOutput, `account_id=${accountId}\n`);
}

console.log(`Resolved Cloudflare account_id=${accountId}`);
