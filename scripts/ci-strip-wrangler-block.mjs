import { readFileSync, writeFileSync } from "node:fs";

function stripWranglerValueBlock(text, key) {
  const needle = `"${key}"`;
  const keyIndex = text.indexOf(needle);
  if (keyIndex === -1) return text;

  const lineStart = text.lastIndexOf("\n", keyIndex) + 1;
  const colonIndex = text.indexOf(":", keyIndex);
  let valueStart = colonIndex + 1;
  while (valueStart < text.length && /\s/.test(text[valueStart])) {
    valueStart += 1;
  }
  if (valueStart >= text.length) return text;

  const opener = text[valueStart];
  const closer = opener === "[" ? "]" : opener === "{" ? "}" : null;
  if (!closer) return text;

  let depth = 0;
  let pos = valueStart;
  for (; pos < text.length; pos++) {
    const char = text[pos];
    if (char === opener) depth += 1;
    else if (char === closer) {
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
  const next = stripWranglerValueBlock(text, key);
  if (next !== text) console.log(`Stripped ${key} from wrangler.jsonc`);
  text = next;
}
writeFileSync(path, text);
