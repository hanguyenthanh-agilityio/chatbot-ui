import type { Decorator } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { useEffect } from "react";

// Components
import { ThemeProvider } from "@/components/theme-provider";

// Constants
import { DEFAULT_THEME, THEME_CHANGE_EVENT, type Theme } from "@/constants/theme";

// Libs
import { applyTheme } from "@/lib/theme";

function resolveStorybookTheme(value: unknown): Theme {
  return value === "dark" || value === "light" ? value : DEFAULT_THEME;
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
  useEffect(() => {
    syncDocumentTheme(theme);
  }, [theme]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
AppThemeShell.displayName = "AppThemeShell";

export const withAppTheme: Decorator = (Story, { globals }) => {
  const theme = resolveStorybookTheme(globals.theme);

  return (
    <AppThemeShell theme={theme}>
      <div className="min-h-[120px] w-full p-6">
        <Story />
      </div>
    </AppThemeShell>
  );
};
