import type { Decorator } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { useLayoutEffect } from "react";

// Components
import { ThemeProvider } from "@/components/theme-provider";

// Constants
import { DEFAULT_THEME, THEME_CHANGE_EVENT, type Theme } from "@/constants/theme";

// Libs
import { applyTheme, isTheme } from "@/lib/theme";

function resolveStorybookTheme(value: unknown): Theme {
  if (typeof value === "string" && isTheme(value)) {
    return value;
  }
  return DEFAULT_THEME;
}

function syncDocumentTheme(theme: Theme) {
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function AppThemeShell({
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
AppThemeShell.displayName = "AppThemeShell";

export const withAppTheme: Decorator = (Story, context) => {
  const theme = resolveStorybookTheme(context.globals?.theme);

  // Before ThemeProvider's first paint, `useSyncExternalStore` reads
  // `document.documentElement.dataset.theme` — sync here, not only in useEffect.
  if (typeof document !== "undefined") {
    syncDocumentTheme(theme);
  }

  return (
    <AppThemeShell theme={theme}>
      <div className="min-h-preview w-full p-6">
        <Story />
      </div>
    </AppThemeShell>
  );
};
