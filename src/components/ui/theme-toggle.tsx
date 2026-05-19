"use client";

import { useTheme } from "@/components/theme-provider";

// Components
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { getThemeToggleAriaLabel } from "@/constants/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="switch"
      role="switch"
      aria-checked={isDark}
      aria-label={getThemeToggleAriaLabel(theme)}
      data-state={theme}
      onClick={toggleTheme}
      className={className}
    >
      <span className="theme-toggle-thumb" aria-hidden />
      <span className="theme-toggle-slot">
        <SunIcon className="theme-toggle-icon" />
      </span>
      <span className="theme-toggle-slot">
        <MoonIcon className="theme-toggle-icon" />
      </span>
    </Button>
  );
}
