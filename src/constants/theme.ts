/**
 * Theme: `data-theme` on <html>. Dark = default classes; light = `light:` utilities.
 * Use `appTheme.*` in components — each value is `darkClass light:lightToken`.
 */
export const THEME_STORAGE_KEY = "employee-assistant:theme";
export const THEME_CHANGE_EVENT = "employee-assistant:theme-change";

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "dark";

export const THEME_TOGGLE_ARIA_LABEL = {
  toLight: "Switch to light mode",
  toDark: "Switch to dark mode",
} as const;

/** Shell hook classes; light gradients in globals.css `@variant light` */
export const THEME_SHELL_CLASSES = {
  sidebar: "app-sidebar",
  chatPanel: "app-chat-panel",
  chatHeader: "app-chat-header",
} as const;

export const appTheme = {
  text: {
    fg: "text-white light:text-app-fg",
    fg80: "text-white/80 light:text-app-fg-muted",
    muted70: "text-white/70 light:text-app-muted-70",
    muted65: "text-white/65 light:text-app-muted-65",
    muted60: "text-white/60 light:text-app-muted-60",
    muted55: "text-white/55 light:text-app-muted-55",
    muted50: "text-white/50 light:text-app-muted-50",
    muted30: "text-white/30 light:text-app-muted-30",
  },
  border: {
    b8: "border-white/8 light:border-app-border-8",
    b9: "border-white/9 light:border-app-border-9",
    b10: "border-white/10 light:border-app-border-10",
  },
  bg: {
    s4: "bg-white/4 light:bg-app-surface-4",
    s10: "bg-white/10 light:bg-app-surface-6",
  },
  hover: {
    b16: "hover:border-white/16 light:hover:border-app-border-10",
    bg9: "hover:bg-white/9 light:hover:bg-app-hover",
  },
  blob: {
    violet: "bg-violet-500/14 light:bg-app-blob-violet",
    indigo: "bg-indigo-600/16 light:bg-app-blob-indigo",
    cyan: "bg-cyan-500/12 light:bg-app-blob-cyan",
  },
} as const;

export function getThemeToggleAriaLabel(theme: Theme) {
  return theme === "dark"
    ? THEME_TOGGLE_ARIA_LABEL.toLight
    : THEME_TOGGLE_ARIA_LABEL.toDark;
}
