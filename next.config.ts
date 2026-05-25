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
};

export default nextConfig;

// Skip Workers dev runtime during Vitest/CI (prevents workerd SQLITE_BUSY on Linux runners).
if (!process.env.VITEST && process.env.CI !== "true") {
  import("@opennextjs/cloudflare").then((m) =>
    m.initOpenNextCloudflareForDev(),
  );
}
