import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    fullWidth: {
      control: "boolean",
    },
    isLoading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: {
      children: "Primary Button",
      variant: "primary",
    },
  };
  
  export const Secondary: Story = {
    args: {
      children: "Secondary Button",
      variant: "secondary",
    },
  };
  
  export const Outline: Story = {
    args: {
      children: "Outline Button",
      variant: "outline",
    },
  };
  
  export const Ghost: Story = {
    args: {
      children: "Ghost Button",
      variant: "ghost",
    },
  };
  
  export const Danger: Story = {
    args: {
      children: "Delete",
      variant: "danger",
    },
  };

  export const Sizes: Story = {
    render: () => (
      <div className="flex gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    ),
  };

  export const Loading: Story = {
    args: {
      children: "Loading...",
      isLoading: true,
    },
  };
  
  export const Disabled: Story = {
    args: {
      children: "Disabled",
      disabled: true,
    },
  };

  export const FullWidth: Story = {
    args: {
      children: "Full Width Button",
      fullWidth: true,
    },
    decorators: [
      (Story) => (
        <div className="w-[300px] border p-4">
          <Story />
        </div>
      ),
    ],
  };