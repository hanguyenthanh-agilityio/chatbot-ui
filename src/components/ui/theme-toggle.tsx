"use client";

import { useTheme } from "@/components/theme-provider";

// Components
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
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
  /** Called after theme changes (e.g. Storybook Actions). */
  onToggle?: (theme: Theme) => void;
}) {
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
      onClick={() => {
        toggleTheme();
        onToggle?.(isDark ? ThemeMode.Light : ThemeMode.Dark);
      }}
      className={className}
    >
      <SunIcon className="theme-toggle-icon" />
      <MoonIcon className="theme-toggle-icon" />
    </Button>
  );
}
