import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  STORYBOOK_THEME_GLOBAL,
  THEME_TOGGLE_ARIA_LABEL,
  ThemeMode,
} from "@/constants/theme";

const meta: Meta<typeof ThemeToggle> = {
  title: "UI/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    actions: { handles: ["click"] },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Extra classes on the toggle button",
    },
    onToggle: {
      action: "toggled",
      description: "Fires with the new theme after each click",
    },
  },
  args: {
    className: "",
    onToggle: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {};

export const Dark: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Dark },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch");

    await expect(toggle).toHaveAttribute("data-state", "dark");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(toggle).toHaveAccessibleName(THEME_TOGGLE_ARIA_LABEL.toLight);
  },
};

export const Light: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Light },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch");

    await expect(toggle).toHaveAttribute("data-state", "light");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(toggle).toHaveAccessibleName(THEME_TOGGLE_ARIA_LABEL.toDark);
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "scale-125",
  },
};

export const Interactive: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Dark },
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole("switch");

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("data-state", "light");
    await expect(document.documentElement.dataset.theme).toBe("light");
    await expect(args.onToggle).toHaveBeenCalledWith(ThemeMode.Light);

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("data-state", "dark");
    await expect(document.documentElement.dataset.theme).toBe("dark");
    await expect(args.onToggle).toHaveBeenCalledWith(ThemeMode.Dark);
  },
};
