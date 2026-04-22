import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SERVER_DIRECTORY = path.join(process.cwd(), "server");
const DB_DIRECTORY = path.join(SERVER_DIRECTORY, "db");
const DB_PATH = path.join(DB_DIRECTORY, "manager-db.json");
const DB_SEED_PATH = path.join(DB_DIRECTORY, "manager-db.seed.json");

await mkdir(DB_DIRECTORY, { recursive: true });
await copyFile(DB_SEED_PATH, DB_PATH);

console.log(`[manager-data-server] reset ${DB_PATH}`);
