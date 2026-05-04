import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Toast } from "@/components/ui/toast";

const meta: Meta<typeof Toast> = {
  title: "UI/Toast",
  component: Toast,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "error", "info"],
    },
    message: {
      control: "text",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toast>;



export const Success: Story = {
  args: {
    message: "Action completed successfully",
    variant: "success",
    onDismiss: () => {},
  },
};

export const Error: Story = {
  args: {
    message: "Something went wrong",
    variant: "error",
    onDismiss: () => {},
  },
};

export const Info: Story = {
  args: {
    message: "Here is some information",
    variant: "info",
    onDismiss: () => {},
  },
};




export const Interactive: Story = {
  render: (args) => {
    const [show, setShow] = useState(false);

    return (
      <div className="p-10">
        <button
          onClick={() => setShow(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Show Toast
        </button>

        {show && (
          <Toast
            {...args}
            onDismiss={() => setShow(false)}
          />
        )}
      </div>
    );
  },
  args: {
    message: "Toast demo with animation",
    variant: "success",
  },
};