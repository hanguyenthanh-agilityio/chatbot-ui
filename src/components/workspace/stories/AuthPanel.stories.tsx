import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AuthPanel } from "@/components/workspace/auth-panel";
import { mockAuthSession } from "@/mocks/auth-panel";

const meta = {
  title: "Workspace/AuthPanel",
  component: AuthPanel,
  parameters: { layout: "centered" },
  args: {
    onRoleChange: fn(),
  },
} satisfies Meta<typeof AuthPanel>;

export default meta;

type Story = StoryObj<typeof AuthPanel>;

export const UserMode: Story = {
  args: {
    role: "user",
    session: mockAuthSession("user"),
    disabled: false,
  },
};

export const ManagerMode: Story = {
  args: {
    role: "manager",
    session: mockAuthSession("manager"),
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    role: "user",
    session: mockAuthSession("user"),
    disabled: true,
  },
};
