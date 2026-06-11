import "@/app/globals.css";
import "./storybook-docs.css";
import "./storybook-canvas.css";

import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { useLayoutEffect } from "react";
import { useGlobals } from "storybook/preview-api";

import { ThemeProvider } from "@/components/theme-provider";
import {
  STORYBOOK_CANVAS_CLASS,
  STORYBOOK_CANVAS_PARAMETER,
  STORYBOOK_CANVAS_WIDTH,
  STORYBOOK_THEME_GLOBAL,
  type StorybookCanvasMode,
} from "@/constants/storybook";
import {
  DEFAULT_THEME,
  THEME_CHANGE_EVENT,
  ThemeMode,
  type Theme,
} from "@/constants/theme";
import { isBrowser } from "@/lib/browser";
import { applyTheme, isTheme } from "@/lib/theme";
import { cn } from "@/utils/class-name";

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

function resolveCanvasMode(value: unknown): StorybookCanvasMode {
  return value === "inline" ? "inline" : "panel";
}

function canvasLayoutStyle(mode: StorybookCanvasMode) {
  const maxWidth = STORYBOOK_CANVAS_WIDTH;
  if (mode === "inline") {
    return { width: "fit-content", maxWidth } as const;
  }
  return {
    width: `min(${maxWidth}, calc(100vw - 3rem))`,
    maxWidth,
  } as const;
}

/** Syncs `html[data-theme]` when the preview toolbar changes. */
const WithAppTheme: Decorator = (Story, { parameters }) => {
  const [globals] = useGlobals();
  const theme = resolveStorybookTheme(globals[STORYBOOK_THEME_GLOBAL]);
  const canvasMode = resolveCanvasMode(parameters[STORYBOOK_CANVAS_PARAMETER]);

  useLayoutEffect(() => {
    syncStorybookTheme(theme);
  }, [theme]);

  syncStorybookTheme(theme);

  return (
    <ThemeProvider key={theme}>
      <div
        className={cn(
          "mx-auto box-border h-auto shrink-0 min-w-0",
          canvasMode === "panel" ? STORYBOOK_CANVAS_CLASS : "max-w-3xl",
        )}
        style={canvasLayoutStyle(canvasMode)}
      >
        <Story />
      </div>
    </ThemeProvider>
  );
};

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
    layout: "fullscreen",
  },
  decorators: [withAppTheme],
};

export default preview;
