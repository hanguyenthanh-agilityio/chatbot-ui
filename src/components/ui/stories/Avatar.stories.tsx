import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "@/components/ui/avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Assistant: Story = {
  args: {
    variant: "assistant",
    size: "md",
  },
};

export const UserWithImage: Story = {
  args: {
    variant: "user",
    src: "https://i.pravatar.cc/150?img=3",
    alt: "User avatar",
    initials: "HN",
    size: "md",
  },
};

export const UserWithInitials: Story = {
  args: {
    variant: "user",
    alt: "User avatar",
    initials: "HN",
    size: "md",
  },
};

export const Sizes = () => (
  <div className="flex items-center gap-4">
    <Avatar variant="assistant" size="sm" />
    <Avatar variant="assistant" size="md" />
    <Avatar variant="assistant" size="lg" />
  </div>
);

export const UserStates = () => (
  <div className="flex items-center gap-4">
    <Avatar variant="user" alt="A" initials="A" size="sm" />
    <Avatar
      variant="user"
      alt="B"
      initials="B"
      size="md"
      src="https://i.pravatar.cc/150?img=5"
    />
    <Avatar variant="user" alt="C" initials="C" size="lg" />
  </div>
);
