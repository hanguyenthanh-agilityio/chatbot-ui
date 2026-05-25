/**
 * Theme: `data-theme` on <html>. Dark = default classes; light = `light:` utilities.
 * Fonts: `--font-primary` (Syne) / `--font-secondary` (DM Sans) in globals.css `:root`.
 * Body uses `var(--font-secondary)`; use Tailwind `font-primary` only where Syne is required.
 * Backgrounds: `--bg-*` in globals.css; use Tailwind classes (`bg-glass`, `bg-btn-active`, …) in JSX.
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

export const STORYBOOK_THEME_GLOBAL = "appTheme";

export const THEME_TOGGLE_ARIA_LABEL = {
  toLight: "Switch to light mode",
  toDark: "Switch to dark mode",
} as const;

/** CSS class hooks (must match globals.css selectors) */
export const THEME_TOGGLE_CLASS = "theme-toggle";
export const CHAT_PANEL_RESET_CLASS = "chat-panel-reset";
export const THEME_SWITCHING_CLASS = "theme-switching";

/** Shell hook classes; light gradients in globals.css `@variant light` */
export const THEME_SHELL_CLASSES = {
  sidebar: "app-sidebar",
  chatPanel: "app-chat-panel",
  chatHeader: "app-chat-header",
} as const;

export const THEME_SHELL_UTILITIES = {
  border: "border-white/9 light:border-app-border-muted",
  borderSubtle: "border-white/8 light:border-app-border-subtle",
  text: "p-4 shadow-panel-sm text-white light:text-app-fg",
} as const;

/** Shared Input/Select skin on glass panels (not the same as ThemeMode) */
export const FORM_FIELD_PANEL_CLASSES =
  "border border-white/12 bg-white/6 text-white/80 placeholder:text-white/30 hover:border-violet-500/50 light:border-app-border light:bg-app-field light:text-app-fg-muted light:placeholder:text-app-fg-faint light:hover:border-amber-800/35";

export const FORM_FIELD_PANEL_FOCUS_CLASSES =
  "focus:border-violet-400/55 focus:ring-2 focus:ring-violet-400/20 light:focus:border-app-border-emphasis light:focus:ring-amber-700/25";

export const OLLAMA_VERIFY_BUTTON_CLASSES =
  "border font-secondary text-white/60 hover:bg-white/8 light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted light:hover:bg-app-hover";

export function isDarkTheme(theme: Theme): boolean {
  return theme === ThemeMode.Dark;
}

export function getThemeToggleAriaLabel(theme: Theme) {
  return isDarkTheme(theme)
    ? THEME_TOGGLE_ARIA_LABEL.toLight
    : THEME_TOGGLE_ARIA_LABEL.toDark;
}
