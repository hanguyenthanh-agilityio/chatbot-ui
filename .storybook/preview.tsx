import "@/app/globals.css";
import "./storybook-docs.css";

import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { useLayoutEffect, type ReactNode } from "react";
import { useGlobals } from "storybook/preview-api";

import { ThemeProvider } from "@/components/theme-provider";
import {
  DEFAULT_THEME,
  STORYBOOK_THEME_GLOBAL,
  THEME_CHANGE_EVENT,
  ThemeMode,
  type Theme,
} from "@/constants/theme";
import { isBrowser } from "@/lib/browser";
import { applyTheme, isTheme } from "@/lib/theme";

function resolveStorybookTheme(value: unknown): Theme {
  return typeof value === "string" && isTheme(value) ? value : DEFAULT_THEME;
}

function syncStorybookTheme(theme: Theme) {
  if (!isBrowser()) {
    return;
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

/** Syncs `html[data-theme]` when the preview toolbar changes. */
function WithAppTheme(Story: () => ReactNode) {
  const [globals] = useGlobals();
  const theme = resolveStorybookTheme(globals[STORYBOOK_THEME_GLOBAL]);

  useLayoutEffect(() => {
    syncStorybookTheme(theme);
  }, [theme]);

  syncStorybookTheme(theme);

  return (
    <ThemeProvider key={theme}>
      <div
        className="flex w-full items-center justify-center p-6"
        style={{
          background: "var(--bg-app-shell)",
          backgroundAttachment: "fixed",
          color: "var(--foreground)",
        }}
      >
        <Story />
      </div>
    </ThemeProvider>
  );
}

export const withAppTheme: Decorator = WithAppTheme;

const preview: Preview = {
  globalTypes: {
    [STORYBOOK_THEME_GLOBAL]: {
      name: "App theme",
      description: "App light / dark mode",
      toolbar: {
        title: "App theme",
        icon: "circlehollow",
        items: [
          { value: ThemeMode.Dark, title: "Dark", icon: "moon" },
          { value: ThemeMode.Light, title: "Light", icon: "sun" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    [STORYBOOK_THEME_GLOBAL]: DEFAULT_THEME,
  },
  parameters: {
    layout: "centered",
  },
  decorators: [withAppTheme],
};

export default preview;
