/** Storybook-only layout tokens — not imported from production app code. */

export const STORYBOOK_THEME_GLOBAL = "appTheme";

/** Fixed Storybook column — matches chat panel content (`WorkspaceApp` header/composer). */
export const STORYBOOK_CANVAS_WIDTH = "48rem";
export const STORYBOOK_CANVAS_CLASS =
  "mx-auto box-border h-auto w-full min-w-0 max-w-3xl shrink-0";

/** Storybook preview parameter: `panel` (full column) vs `inline` (width fits content). */
export type StorybookCanvasMode = "panel" | "inline";
export const STORYBOOK_CANVAS_PARAMETER = "storybookCanvas" as const;

/** Use on small UI stories (Badge, Avatar, Button, …) — avoids a wide empty column. */
export const STORYBOOK_INLINE_CANVAS_PARAMETERS = {
  [STORYBOOK_CANVAS_PARAMETER]: "inline",
} as const satisfies Record<string, StorybookCanvasMode>;

/** Table cells, chips, badges — shrink-wrap; not full chat column width. */
export const STORYBOOK_INLINE_SHELL_CLASS =
  "inline-flex h-auto w-fit max-w-3xl shrink-0 flex-col rounded-shell border p-4 shadow-shell-panel bg-glass-panel-chat";

/** Center story content inside a full-width chat shell (date picker, cards, etc.). */
export const STORYBOOK_SHELL_CENTER_CLASS =
  "flex w-full flex-col items-center justify-center";
