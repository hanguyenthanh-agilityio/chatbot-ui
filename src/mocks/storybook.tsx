import type { Decorator } from "@storybook/nextjs-vite";

import {
  STORYBOOK_CANVAS_CLASS,
  STORYBOOK_INLINE_SHELL_CLASS,
  STORYBOOK_SHELL_CENTER_CLASS,
  THEME_SHELL_CLASSES,
  THEME_SHELL_UTILITIES,
} from "@/constants/theme";
import { cn } from "@/utils/class-name";

/** Full chat column (composer, transcript, tool cards). */
export const inChatTranscript: Decorator = (Story) => (
  <section
    className={cn(
      THEME_SHELL_CLASSES.chatPanel,
      STORYBOOK_CANVAS_CLASS,
      STORYBOOK_SHELL_CENTER_CLASS,
      "h-auto rounded-shell border p-6 shadow-shell-panel",
      "bg-glass-panel-chat",
      THEME_SHELL_UTILITIES.border,
    )}
  >
    <Story />
  </section>
);

/** UI docs panels (Badge, Button, …) — frame hugs content, not full column width. */
export const inStorybookUiPanel: Decorator = (Story) => (
  <div className="inline-flex flex-col rounded-2xl border border-white/10 bg-glass-panel p-6 text-white light:border-app-border-subtle light:text-app-fg">
    <Story />
  </div>
);

/** Small inline pieces (table cells, chips) — frame width follows content. */
export const inStorybookInlineShell: Decorator = (Story) => (
  <div
    className={cn(
      STORYBOOK_INLINE_SHELL_CLASS,
      "text-white light:text-app-fg",
      THEME_SHELL_UTILITIES.border,
    )}
  >
    <Story />
  </div>
);
