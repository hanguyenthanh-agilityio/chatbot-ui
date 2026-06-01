import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineProject } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

/** Unit tests only — no Storybook/browser plugin (avoids workerd SQLite lock on CI). */
export default defineProject({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: [path.join(dirname, "vitest.setup.ts")],
    include: [
      "src/components/**/*.test.{ts,tsx}",
      "src/lib/**/*.test.{ts,tsx}",
    ],
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
    teardownTimeout: 5_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      // Match vitest.config.ts (unit project): component UI is .tsx only.
      include: ["src/components/**/*.tsx"],
      exclude: [
        "src/**/*.stories.{ts,tsx}",
        "src/**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
        "src/test/**",
      ],
    },
  },
});
