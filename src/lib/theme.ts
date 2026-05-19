import {
  DEFAULT_THEME,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  THEMES,
  type Theme,
} from "@/constants/theme";

const THEME_SWITCHING_CLASS = "theme-switching";

export function isTheme(value: string | null | undefined): value is Theme {
  return (THEMES as readonly string[]).includes(value ?? "");
}

export function getThemeFromDocument(): Theme {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : DEFAULT_THEME;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function persistTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add(THEME_SWITCHING_CLASS);
  applyTheme(theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  requestAnimationFrame(() => {
    root.classList.remove(THEME_SWITCHING_CLASS);
  });
}

/**
 * It runs as soon as the HTML loads
 * (before React), reads light/dark from localStorage, and sets
 * <html data-theme="light|dark"> so the first screen already matches the
 * user's last choice — avoids a brief flash of the wrong theme on refresh.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);document.documentElement.dataset.theme=(t==="light"||t==="dark")?t:${JSON.stringify(DEFAULT_THEME)}}catch(e){document.documentElement.dataset.theme=${JSON.stringify(DEFAULT_THEME)}}})();`;
