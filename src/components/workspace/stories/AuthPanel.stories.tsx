import type { ComponentProps } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

// Components
import { AuthPanel } from "@/components/workspace/auth-panel";

// Constants
import { THEME_SHELL_CLASSES, THEME_SHELL_UTILITIES } from "@/constants/theme";

// Libs
import type { AppRole } from "@/lib/auth/session";

// Mocks
import { mockAuthSession } from "@/mocks/auth-panel";

// Utils
import { cn } from "@/utils/class-name";

const inSidebarShell: Decorator = (Story) => (
  <aside
    className={cn(
      THEME_SHELL_CLASSES.sidebar,
      "mx-auto flex w-full max-w-sm flex-col rounded-shell border backdrop-blur-shell shadow-shell",
      "bg-glass-panel",
      THEME_SHELL_UTILITIES.border,
      THEME_SHELL_UTILITIES.text,
    )}
  >
    <div className={cn("border-b p-5", THEME_SHELL_UTILITIES.borderSubtle)}>
      <Story />
    </div>
  </aside>
);

function renderAuthPanelFromControls(
  args: Pick<
    ComponentProps<typeof AuthPanel>,
    "role" | "disabled" | "onRoleChange"
  >,
) {
  return (
    <AuthPanel
      role={args.role}
      session={mockAuthSession(args.role)}
      disabled={args.disabled}
      onRoleChange={args.onRoleChange}
    />
  );
}

const meta = {
  title: "Workspace/AuthPanel",
  component: AuthPanel,
  decorators: [inSidebarShell],
  args: {
    onRoleChange: fn(),
  },
  argTypes: {
    role: {
      control: "select",
      options: ["user", "manager"] satisfies AppRole[],
    },
    disabled: {
      control: "boolean",
    },
    session: {
      table: { disable: true },
      control: false,
    },
  },
} satisfies Meta<typeof AuthPanel>;

export default meta;

type Story = StoryObj<typeof AuthPanel>;

export const UserMode: Story = {
  args: {
    role: "user",
    disabled: false,
  },
  render: (args) => renderAuthPanelFromControls(args),
};

export const ManagerMode: Story = {
  args: {
    role: "manager",
    disabled: false,
  },
  render: (args) => renderAuthPanelFromControls(args),
};

export const Disabled: Story = {
  args: {
    role: "user",
    disabled: true,
  },
  render: (args) => renderAuthPanelFromControls(args),
};
