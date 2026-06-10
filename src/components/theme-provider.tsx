"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// Constants
import {
  DEFAULT_THEME,
  THEME_CHANGE_EVENT,
  getOppositeTheme,
  type Theme,
} from "@/constants/theme";

// Libs
import { getThemeFromDocument, persistTheme } from "@/lib/theme";

// Types
type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => Theme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribe(listener: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, listener);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, listener);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeFromDocument,
    () => DEFAULT_THEME,
  );

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next);
  }, []);

  const toggleTheme = useCallback((): Theme => {
    const next = getOppositeTheme(theme);
    setTheme(next);
    return next;
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
