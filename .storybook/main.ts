import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",

  stories: ["../src/**/*.stories.@(js|ts|jsx|tsx)"],

  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  viteFinal: async (config) => ({
    ...config,
    resolve: {
      ...(config.resolve ?? {}),
      alias: {
        ...((config.resolve?.alias as Record<string, string> | undefined) ?? {}),
        "@": path.resolve(__dirname, "../src"),
      },
    },
  }),
};

export default config;
