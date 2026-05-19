import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

// Components
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Constants
import { THEME_TOGGLE_ARIA_LABEL } from "@/constants/theme";

const meta: Meta<typeof ThemeToggle> = {
  title: "UI/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  decorators: [
    function ThemeToggleStoryFrame(Story: Parameters<Decorator>[0]) {
      return (
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-10 backdrop-blur-md">
          <Story />
        </div>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

/** Switch shown while app is in dark mode (aria + data-state). */
export const Dark: Story = {
  globals: { theme: "dark" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch");

    await expect(toggle).toHaveAttribute("data-state", "dark");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(toggle).toHaveAccessibleName(
      THEME_TOGGLE_ARIA_LABEL.toLight,
    );
  },
};

/** Switch shown while app is in light mode. */
export const Light: Story = {
  globals: { theme: "light" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch");

    await expect(toggle).toHaveAttribute("data-state", "light");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(toggle).toHaveAccessibleName(THEME_TOGGLE_ARIA_LABEL.toDark);
  },
};

/** Click toggles data-theme on <html> (dark ↔ light), same as production. */
export const Interactive: Story = {
  globals: { theme: "dark" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch");

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute("data-state", "light");
    await expect(toggle).toHaveAccessibleName(THEME_TOGGLE_ARIA_LABEL.toDark);
    await expect(document.documentElement.dataset.theme).toBe("light");

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute("data-state", "dark");
    await expect(document.documentElement.dataset.theme).toBe("dark");
  },
};
