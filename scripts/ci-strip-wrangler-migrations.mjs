import { readFileSync, writeFileSync } from "node:fs";

const path = "wrangler.jsonc";
const text = readFileSync(path, "utf8");

// DO migrations must be applied via `wrangler deploy`, not `wrangler versions upload`.
const stripped = text.replace(/\r?\n\t"migrations"\s*:\s*\[[\s\S]*?\],?\r?\n/, "\n");

if (stripped === text) {
  console.log("No migrations block to strip in wrangler.jsonc");
} else {
  writeFileSync(path, stripped);
  console.log("Stripped migrations from wrangler.jsonc for versions upload");
}
