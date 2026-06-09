import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

function parseAllowedDevOrigins() {
  const defaults = ["172.16.126.220"];
  const fromEnv =
    process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? [];

  return [...new Set([...defaults, ...fromEnv])];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: parseAllowedDevOrigins(),
  // Keep browser-only parsers out of the RSC/server graph when imported transitively.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;

// Cloudflare dev runtime only when wrangler config exists (GitHub deploy checkout).
if (
  !process.env.VITEST &&
  process.env.CI !== "true" &&
  existsSync(path.join(process.cwd(), "wrangler.jsonc"))
) {
  void import("@opennextjs/cloudflare").then((m) =>
    m.initOpenNextCloudflareForDev(),
  );
}
