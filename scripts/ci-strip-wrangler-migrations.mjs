import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "ci-strip-wrangler-block.mjs");
const result = spawnSync(process.execPath, [script, "migrations"], { stdio: "inherit" });
process.exit(result.status ?? 1);
