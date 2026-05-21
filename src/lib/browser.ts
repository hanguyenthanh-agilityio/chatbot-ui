/** True when running in a browser (not Node/SSR build). */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
