"use client";

import { useTheme } from "@/components/theme-provider";

// Components
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { getThemeToggleAriaLabel, isDarkTheme } from "@/constants/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = isDarkTheme(theme);

  return (
    <Button
      type="button"
      variant="themeToggle"
      role="switch"
      aria-checked={isDark}
      aria-label={getThemeToggleAriaLabel(theme)}
      data-state={theme}
      onClick={toggleTheme}
      className={className}
    >
      <SunIcon className="theme-toggle-icon" />
      <MoonIcon className="theme-toggle-icon" />
    </Button>
  );
}
