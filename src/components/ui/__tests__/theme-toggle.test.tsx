import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Components
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Constants
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  THEME_TOGGLE_ARIA_LABEL,
  type Theme,
} from "@/constants/theme";

// Libs
import { persistTheme } from "@/lib/theme";

function resetThemeStorage(theme: Theme = DEFAULT_THEME) {
  localStorage.clear();
  persistTheme(theme);
}

function renderWithTheme(ui: ReactElement, theme: Theme = DEFAULT_THEME) {
  resetThemeStorage(theme);
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    ),
  });
}

function renderThemeToggle(theme: Theme = DEFAULT_THEME) {
  return renderWithTheme(<ThemeToggle />, theme);
}

function readStoredTheme(): Theme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : null;
}

describe("ThemeToggle", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resetThemeStorage("dark");
  });

  it("renders as an accessible switch in dark mode", () => {
    renderThemeToggle("dark");

    const toggle = screen.getByRole("switch");

    expect(toggle).toHaveAttribute("data-state", "dark");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toHaveAccessibleName(THEME_TOGGLE_ARIA_LABEL.toLight);
    expect(toggle.querySelector(".theme-toggle-thumb")).toBeInTheDocument();
  });

  it("renders in light mode with correct aria state", () => {
    renderThemeToggle("light");

    const toggle = screen.getByRole("switch");

    expect(toggle).toHaveAttribute("data-state", "light");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(toggle).toHaveAccessibleName(THEME_TOGGLE_ARIA_LABEL.toDark);
  });

  it("toggles theme on click and persists to localStorage", async () => {
    const user = userEvent.setup();
    renderThemeToggle("dark");

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    expect(toggle).toHaveAttribute("data-state", "light");
    expect(toggle).toHaveAccessibleName(THEME_TOGGLE_ARIA_LABEL.toDark);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(readStoredTheme()).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("data-state", "dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(readStoredTheme()).toBe("dark");
  });

  it("merges optional className onto the button", () => {
    renderWithTheme(<ThemeToggle className="ml-2" />, "dark");

    expect(screen.getByRole("switch")).toHaveClass("theme-toggle", "ml-2");
  });
});
