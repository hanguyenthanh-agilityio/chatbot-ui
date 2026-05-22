import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeMode,
  type Theme,
} from "@/constants/theme";
import { persistTheme } from "@/lib/theme";

function setDocumentTheme(theme: Theme = DEFAULT_THEME) {
  persistTheme(theme);
}

function renderWithTheme(
  ui: ReactElement,
  theme: Theme = DEFAULT_THEME,
  wrapper?: ({ children }: { children: ReactNode }) => ReactElement,
) {
  setDocumentTheme(theme);
  return render(ui, wrapper ? { wrapper } : undefined);
}

function renderThemeToggle(theme: Theme = ThemeMode.Dark) {
  return renderWithTheme(<ThemeToggle />, theme, ({ children }) => (
    <ThemeProvider>{children}</ThemeProvider>
  ));
}

function readStoredTheme(): Theme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === ThemeMode.Dark || stored === ThemeMode.Light) {
    return stored;
  }
  return null;
}

describe("ThemeToggle", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    setDocumentTheme(ThemeMode.Dark);
  });

  it("matches snapshot in dark mode", () => {
    renderThemeToggle(ThemeMode.Dark);
    expect(screen.getByRole("switch").outerHTML).toMatchSnapshot();
  });

  it("matches snapshot in light mode", () => {
    renderThemeToggle(ThemeMode.Light);
    expect(screen.getByRole("switch").outerHTML).toMatchSnapshot();
  });

  it("toggles theme on click and persists to localStorage", async () => {
    const user = userEvent.setup();
    renderThemeToggle(ThemeMode.Dark);

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(readStoredTheme()).toBe(ThemeMode.Light);

    await user.click(toggle);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(readStoredTheme()).toBe(ThemeMode.Dark);
  });
});
