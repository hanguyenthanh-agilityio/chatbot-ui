import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { createRef } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComposerAttachmentChip } from "@/components/chat/composer-attachment-chip";
import { ComposerAttachmentMenu } from "@/components/chat/composer-attachment-menu";
import { RecentFilesFlyout } from "@/components/chat/recent-files-flyout";
import { FILE_PREVIEW_COPY, MOCK_RECENT_FILES } from "@/constants/file-attachment";
import {
  STORYBOOK_THEME_GLOBAL,
  STORYBOOK_INLINE_CANVAS_PARAMETERS,
  ThemeMode,
} from "@/constants/theme";
import { MOCK_COMPOSER_ATTACHMENT } from "@/mocks/file-attachment";
import { cn } from "@/utils/class-name";

const inComposerField: Decorator = (Story) => (
  <div
    className={cn(
      "inline-flex w-full max-w-md flex-col gap-2 rounded-composer-field border px-3 py-2.5 shadow-composer-input backdrop-blur-xl",
      "border-white/12 bg-white/6 light:border-app-border light:bg-app-field",
    )}
  >
    <Story />
  </div>
);

const meta = {
  title: "Chat/ComposerAttachments",
  tags: ["autodocs"],
  parameters: {
    ...STORYBOOK_INLINE_CANVAS_PARAMETERS,
    docs: {
      description: {
        component:
          "Composer file attachment UI: `+` menu (upload + recent-files flyout) and attachment chip. Recent files are mock-only (Coming soon).",
      },
    },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  decorators: [inComposerField],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AttachmentMenu: Story = {
  render: () => {
    const fileInputRef = createRef<HTMLInputElement>();
    return (
      <ComposerAttachmentMenu
        fileInputRef={fileInputRef}
        onOpenFilePicker={fn()}
        onFileSelected={fn()}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: FILE_PREVIEW_COPY.attachMenuAriaLabel,
      }),
    );
    await expect(
      canvas.getByRole("menuitem", { name: FILE_PREVIEW_COPY.addFilesLabel }),
    ).toBeInTheDocument();
  },
};

export const AttachmentMenuRecentFlyout: Story = {
  render: () => {
    const fileInputRef = createRef<HTMLInputElement>();
    return (
      <ComposerAttachmentMenu
        fileInputRef={fileInputRef}
        onOpenFilePicker={fn()}
        onFileSelected={fn()}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: FILE_PREVIEW_COPY.attachMenuAriaLabel,
      }),
    );
    await userEvent.hover(
      canvas.getByRole("menuitem", {
        name: FILE_PREVIEW_COPY.recentFilesLabel,
      }),
    );
    const body = within(document.body);
    await expect(body.getByText("leave-policy-2026.pdf")).toBeInTheDocument();
    await expect(
      body.getByText(FILE_PREVIEW_COPY.recentFilesComingSoon),
    ).toBeInTheDocument();
  },
};

export const AttachmentChip: Story = {
  render: () => (
    <ComposerAttachmentChip file={MOCK_COMPOSER_ATTACHMENT} onRemove={fn()} />
  ),
};

/** Recent flyout in isolation (empty state). */
export const RecentFilesFlyoutEmpty: Story = {
  render: () => (
    <RecentFilesFlyout
      recentMenuId="story-recent-empty"
      recentFiles={[]}
      style={{ position: "relative" }}
      onPointerEnter={fn()}
      onPointerLeave={fn()}
    />
  ),
};

/** Recent flyout in isolation (mock files). */
export const RecentFilesFlyoutWithFiles: Story = {
  render: () => (
    <RecentFilesFlyout
      recentMenuId="story-recent-files"
      recentFiles={MOCK_RECENT_FILES}
      style={{ position: "relative" }}
      onPointerEnter={fn()}
      onPointerLeave={fn()}
    />
  ),
};

export const Light: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Light },
  render: AttachmentChip.render,
};

export const Dark: Story = {
  globals: { [STORYBOOK_THEME_GLOBAL]: ThemeMode.Dark },
  render: AttachmentChip.render,
};
