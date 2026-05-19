/**
 * Theme: `data-theme` on <html>. Dark = default classes; light = `light:` utilities.
 */
export const THEME_STORAGE_KEY = "employee-assistant:theme";
export const THEME_CHANGE_EVENT = "employee-assistant:theme-change";

export enum ThemeMode {
  Dark = "dark",
  Light = "light",
}

export const THEMES = [ThemeMode.Dark, ThemeMode.Light] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = ThemeMode.Dark;

export const THEME_TOGGLE_ARIA_LABEL = {
  toLight: "Switch to light mode",
  toDark: "Switch to dark mode",
} as const;

/** CSS class hooks (must match globals.css selectors) */
export const THEME_TOGGLE_CLASS = "theme-toggle";
export const THEME_SWITCHING_CLASS = "theme-switching";

/** Shell hook classes; light gradients in globals.css `@variant light` */
export const THEME_SHELL_CLASSES = {
  sidebar: "app-sidebar",
  chatPanel: "app-chat-panel",
  chatHeader: "app-chat-header",
} as const;

export const THEME_SHELL_UTILITIES = {
  border: "border-white/9 light:border-app-border-9",
  borderSubtle: "border-white/8 light:border-app-border-8",
  text: "text-white light:text-app-fg",
} as const;

/** Shared Input/Select skin on glass panels (not the same as ThemeMode) */
export const FORM_FIELD_PANEL_CLASSES =
  "border-white/12 bg-white/6 text-white/80 placeholder:text-white/30 hover:border-violet-500/50 light:border-app-border-10 light:bg-[#f3efff] light:text-app-fg-muted light:placeholder:text-app-muted-50 light:hover:border-app-hover-border";

export function isDarkTheme(theme: Theme): boolean {
  return theme === ThemeMode.Dark;
}

export function getThemeToggleAriaLabel(theme: Theme) {
  return isDarkTheme(theme)
    ? THEME_TOGGLE_ARIA_LABEL.toLight
    : THEME_TOGGLE_ARIA_LABEL.toDark;
}
