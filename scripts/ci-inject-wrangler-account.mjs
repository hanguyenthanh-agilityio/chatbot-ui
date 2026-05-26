import { readFileSync, writeFileSync } from "node:fs";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim().replace(/["']/g, "");
const path = "wrangler.jsonc";

if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId)) {
  console.error("::error::CLOUDFLARE_ACCOUNT_ID must be a 32-character hex Account ID.");
  process.exit(1);
}

const normalized = accountId.toLowerCase();
let text = readFileSync(path, "utf8");

if (/"account_id"\s*:/.test(text)) {
  text = text.replace(/"account_id"\s*:\s*"[^"]*"/, `"account_id": "${normalized}"`);
} else {
  text = text.replace(/"\$schema"/, `"account_id": "${normalized}",\n\t"$schema"`);
}

writeFileSync(path, text);

if (!text.includes(`"account_id": "${normalized}"`)) {
  console.error("::error::Failed to write account_id into wrangler.jsonc");
  process.exit(1);
}

console.log("wrangler.jsonc account_id set");
