import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  Avatar,
  AVATAR_SIZE_OPTIONS,
  type AvatarSize,
} from "@/components/ui/avatar";
import { APP_ASSISTANT_AVATAR_ALT } from "@/constants/app";
import { inStorybookUiPanel } from "@sb/decorators";
import { STORYBOOK_INLINE_CANVAS_PARAMETERS } from "@/constants/storybook";

const AVATAR_VARIANT_OPTIONS = ["assistant", "user"] as const;
type AvatarStoryVariant = (typeof AVATAR_VARIANT_OPTIONS)[number];

type AvatarStoryArgs = {
  variant: AvatarStoryVariant;
  size: AvatarSize;
  src: string;
  alt: string;
  initials: string;
  className: string;
};

function renderAvatarFromArgs({
  variant,
  size,
  src,
  alt,
  initials,
  className,
}: AvatarStoryArgs) {
  if (variant === "assistant") {
    return (
      <Avatar
        variant="assistant"
        size={size}
        className={className || undefined}
      />
    );
  }

  return (
    <Avatar
      variant="user"
      src={src.trim() || undefined}
      alt={alt}
      initials={initials}
      size={size}
      className={className || undefined}
    />
  );
}

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    ...STORYBOOK_INLINE_CANVAS_PARAMETERS,
    docs: {
      description: {
        component:
          'Circular avatars for the assistant (`variant="assistant"`) and chat users (`variant="user"` with photo or initials). Use **Playground** controls to switch variant, size, and user fields. Toggle **App theme** for light/dark.',
      },
    },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  args: {
    variant: "user",
    size: "md",
    src: "https://i.pravatar.cc/150?img=3",
    alt: "User avatar",
    initials: "HN",
    className: "",
  },
  argTypes: {
    variant: {
      control: "select",
      options: AVATAR_VARIANT_OPTIONS,
      table: { category: "Appearance" },
    },
    size: {
      control: "select",
      options: AVATAR_SIZE_OPTIONS,
      table: { category: "Appearance" },
    },
    src: {
      control: "text",
      description: "User photo URL (empty = initials fallback)",
      table: { category: "User" },
      if: { arg: "variant", eq: "user" },
    },
    alt: {
      control: "text",
      table: { category: "User" },
      if: { arg: "variant", eq: "user" },
    },
    initials: {
      control: "text",
      description: "Shown when `src` is empty",
      table: { category: "User" },
      if: { arg: "variant", eq: "user" },
    },
    className: {
      control: "text",
      table: { category: "Appearance" },
    },
  },
  render: renderAvatarFromArgs,
  decorators: [inStorybookUiPanel],
} satisfies Meta<AvatarStoryArgs>;

export default meta;

type Story = StoryObj<AvatarStoryArgs>;

/** Interactive controls for variant, size, and user fields. */
export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const name =
      args.variant === "assistant" ? APP_ASSISTANT_AVATAR_ALT : args.alt;
    await expect(
      within(canvasElement).getByRole("img", { name }),
    ).toBeInTheDocument();
  },
};

export const Assistant: Story = {
  args: {
    variant: "assistant",
    size: "md",
    src: "",
    alt: "User avatar",
    initials: "HN",
    className: "",
  },
};

export const UserWithImage: Story = {
  args: {
    variant: "user",
    size: "md",
    src: "https://i.pravatar.cc/150?img=3",
    alt: "User avatar",
    initials: "HN",
    className: "",
  },
};

export const UserWithInitials: Story = {
  args: {
    variant: "user",
    size: "md",
    src: "",
    alt: "User avatar",
    initials: "HN",
    className: "",
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {AVATAR_SIZE_OPTIONS.map((size) => (
          <Avatar key={`a-${size}`} variant="assistant" size={size} />
        ))}
      </div>
      <div className="flex items-center gap-4">
        {AVATAR_SIZE_OPTIONS.map((size) => (
          <Avatar
            key={`u-${size}`}
            variant="user"
            alt={`User ${size}`}
            initials="AB"
            size={size}
          />
        ))}
      </div>
    </div>
  ),
};
