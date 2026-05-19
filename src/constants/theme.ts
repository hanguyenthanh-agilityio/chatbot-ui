/**
 * Theme runtime: storage, events, shell hooks for globals.css.
 * Styling uses Tailwind `light:` in components — read classes in JSX, not opaque tokens here.
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

/** Input/Select `variant="dark"` — shared form control skin */
export const DARK_FORM_FIELD_CLASSES =
  "border-white/12 bg-white/6 text-white/80 placeholder:text-white/30 hover:border-violet-500/50 light:border-app-border-10 light:bg-[#f3efff] light:text-app-fg-muted light:placeholder:text-app-muted-50 light:hover:border-app-hover-border";

/** Hook classes paired with light shell rules in globals.css */
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
