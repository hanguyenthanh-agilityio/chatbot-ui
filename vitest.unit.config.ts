import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

/** Unit tests only — no Storybook/browser (avoids workerd SQLITE_BUSY on CI). */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  test: {
    name: "unit",
    environment: "jsdom",
    setupFiles: [path.join(dirname, "vitest.setup.ts")],
    include: ["src/components/**/*.test.{ts,tsx}"],
    pool: "threads",
    maxWorkers: 1,
    teardownTimeout: 15_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/components/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.stories.{ts,tsx}",
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
      ],
    },
  },
});
