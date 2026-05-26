import type { Decorator } from "@storybook/nextjs-vite";

import { THEME_SHELL_CLASSES, THEME_SHELL_UTILITIES } from "@/constants/theme";
import { cn } from "@/utils/class-name";

/** Shared chat-panel frame for transcript / tool-output Storybook stories. */
export const inChatTranscript: Decorator = (Story) => (
  <section
    className={cn(
      THEME_SHELL_CLASSES.chatPanel,
      "mx-auto w-full max-w-3xl rounded-shell border p-6 shadow-shell-panel",
      "bg-glass-panel-chat",
      THEME_SHELL_UTILITIES.border,
    )}
  >
    <Story />
  </section>
);
