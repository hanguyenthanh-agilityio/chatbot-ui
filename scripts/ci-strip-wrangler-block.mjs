import { readFileSync, writeFileSync } from "node:fs";

/**
 * Remove a top-level `"key": [ ... ],` block from wrangler.jsonc without breaking JSONC.
 */
export function stripWranglerArrayBlock(text, key) {
  const needle = `"${key}"`;
  const keyIndex = text.indexOf(needle);
  if (keyIndex === -1) return text;

  const lineStart = text.lastIndexOf("\n", keyIndex) + 1;
  const arrayStart = text.indexOf("[", keyIndex);
  if (arrayStart === -1) return text;

  let depth = 0;
  let pos = arrayStart;
  for (; pos < text.length; pos++) {
    const char = text[pos];
    if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        pos += 1;
        break;
      }
    }
  }

  if (text[pos] === ",") pos += 1;
  if (text[pos] === "\r") pos += 1;
  if (text[pos] === "\n") pos += 1;

  return text.slice(0, lineStart) + text.slice(pos);
}

const path = "wrangler.jsonc";
const keys = process.argv.slice(2);
if (keys.length === 0) {
  console.error("Usage: node ci-strip-wrangler-block.mjs <key> [key...]");
  process.exit(1);
}

let text = readFileSync(path, "utf8");
for (const key of keys) {
  const next = stripWranglerArrayBlock(text, key);
  if (next !== text) console.log(`Stripped ${key} from wrangler.jsonc`);
  text = next;
}
writeFileSync(path, text);
