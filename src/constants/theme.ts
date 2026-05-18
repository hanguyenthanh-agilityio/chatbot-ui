export const THEME_STORAGE_KEY = "employee-assistant:theme";
export const THEME_CHANGE_EVENT = "employee-assistant:theme-change";

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "dark";

export const THEME_TOGGLE_ARIA_LABEL = {
  toLight: "Switch to light mode",
  toDark: "Switch to dark mode",
} as const;

/** Hook classes paired with light-mode rules in `app/theme.css`. */
export const THEME_SHELL_CLASSES = {
  sidebar: "app-sidebar",
  chatPanel: "app-chat-panel",
  chatHeader: "app-chat-header",
} as const;

export function getThemeToggleAriaLabel(theme: Theme) {
  return theme === "dark"
    ? THEME_TOGGLE_ARIA_LABEL.toLight
    : THEME_TOGGLE_ARIA_LABEL.toDark;
}
