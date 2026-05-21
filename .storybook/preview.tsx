import "@/app/globals.css";

import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { useLayoutEffect, type ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import {
  DEFAULT_THEME,
  THEME_CHANGE_EVENT,
  STORYBOOK_THEME_GLOBAL,
  ThemeMode,
  type Theme,
} from "@/constants/theme";
import { isBrowser } from "@/lib/browser";
import { applyTheme, isTheme } from "@/lib/theme";

function resolveStorybookTheme(value: unknown): Theme {
  return typeof value === "string" && isTheme(value) ? value : DEFAULT_THEME;
}

function syncDocumentTheme(theme: Theme) {
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function StorybookThemeRoot({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    syncDocumentTheme(theme);
  }, [theme]);

  return <ThemeProvider>{children}</ThemeProvider>;
}

/** Syncs `data-theme` before paint and when the toolbar changes. */
export const withAppTheme: Decorator = (Story, { globals }) => {
  const theme = resolveStorybookTheme(globals?.[STORYBOOK_THEME_GLOBAL]);

  if (isBrowser()) {
    syncDocumentTheme(theme);
  }

  return (
    <StorybookThemeRoot theme={theme}>
      <div className="min-h-preview w-full p-6">
        <Story />
      </div>
    </StorybookThemeRoot>
  );
};

const preview: Preview = {
  globalTypes: {
    [STORYBOOK_THEME_GLOBAL]: {
      description: "App light / dark mode",
      toolbar: {
        title: "Theme",
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
