import { readFileSync, writeFileSync } from "node:fs";

const path = "wrangler.jsonc";
const text = readFileSync(path, "utf8");

// Remove the services block (OpenNext self-reference) so wrangler skips workers/services API.
const stripped = text.replace(/\r?\n\t"services"\s*:\s*\[[\s\S]*?\],?\r?\n/, "\n");

if (stripped === text) {
  console.log("No services block to strip in wrangler.jsonc");
} else {
  writeFileSync(path, stripped);
  console.log("Stripped services from wrangler.jsonc for fallback deploy");
}
