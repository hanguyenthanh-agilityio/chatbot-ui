/**
 * Theme: `data-theme` on <html>. Dark = default classes; light = `light:` utilities.
 * Fonts: `--font-primary` (Syne) / `--font-secondary` (DM Sans) in globals.css `:root`.
 * Body uses `var(--font-secondary)`; use Tailwind `font-primary` only where Syne is required.
 * Light palette: Warm Paper (`@variant light` in globals.css). Backgrounds via `--bg-*` / `bg-glass`, etc.
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
  "border border-white/12 bg-white/6 text-white/80 placeholder:text-white/30 hover:border-violet-500/50 light:border-app-border-10 light:bg-app-field-panel light:text-app-fg-muted light:placeholder:text-app-muted-50 light:hover:border-amber-800/35";

export const OLLAMA_VERIFY_BUTTON_CLASSES =
  "border font-secondary text-white/60 hover:bg-white/8 light:border-app-border-10 light:bg-app-surface-4 light:text-app-fg-muted light:hover:bg-app-hover";

export const COMPOSER_BAR_CLASSES =
  "border-t border-white/8 backdrop-blur-[1.75rem] shadow-composer-bar bg-glass-composer light:border-app-border-8";

export const COMPOSER_FIELD_CLASSES =
  "flex w-full items-center gap-3 rounded-composer-field border border-white/13 px-4 py-2.5 shadow-composer-input backdrop-blur-xl bg-glass-input transition-all duration-200 focus-within:border-violet-400/55 light:border-app-border-10 light:bg-app-field-panel light:shadow-[0_1px_3px_#0000000a] light:focus-within:border-app-hover-border";

export const COMPOSER_INPUT_CLASSES =
  "max-h-composer-textarea flex-1 resize-none overflow-y-auto border-none bg-transparent text-sm leading-[1.55] text-white/90 caret-violet-400/90 outline-none placeholder:text-white/46 disabled:cursor-not-allowed disabled:opacity-50 light:text-app-fg light:caret-amber-700 light:placeholder:text-app-muted-50";

export function isDarkTheme(theme: Theme): boolean {
  return theme === ThemeMode.Dark;
}

export function getThemeToggleAriaLabel(theme: Theme) {
  return isDarkTheme(theme)
    ? THEME_TOGGLE_ARIA_LABEL.toLight
    : THEME_TOGGLE_ARIA_LABEL.toDark;
}
