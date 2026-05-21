"use client";

import { useTheme } from "@/components/theme-provider";

// Components
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

// Constants
import {
  getThemeToggleAriaLabel,
  isDarkTheme,
  ThemeMode,
  type Theme,
} from "@/constants/theme";

export function ThemeToggle({
  className,
  onToggle,
}: {
  className?: string;
  onToggle?: (theme: Theme) => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = isDarkTheme(theme);

  function handleToggle() {
    const nextTheme = isDark ? ThemeMode.Light : ThemeMode.Dark;
    toggleTheme();
    onToggle?.(nextTheme);
  }

  return (
    <Button
      type="button"
      variant="themeToggle"
      role="switch"
      aria-checked={isDark}
      aria-label={getThemeToggleAriaLabel(theme)}
      data-state={theme}
      onClick={handleToggle}
      className={className}
    >
      <SunIcon className="theme-toggle-icon" />
      <MoonIcon className="theme-toggle-icon" />
    </Button>
  );
}
