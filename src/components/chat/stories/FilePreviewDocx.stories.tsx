import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { FilePreviewDocx } from "@/components/chat/file-preview-docx";
import { Text } from "@/components/ui/text";
import {
  FILE_PREVIEW_COPY,
  FILE_PREVIEW_DOCX_CONTENT_CLASS,
  FILE_PREVIEW_FALLBACK_CLASS,
} from "@/constants/file-attachment";
import {
  STORYBOOK_INLINE_CANVAS_PARAMETERS,
  STORYBOOK_THEME_GLOBAL,
} from "@/constants/theme";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";
import { cn } from "@/utils/class-name";

const inPreviewPanel: Decorator = (Story) => (
  <div
    className={cn(
      "flex h-[28rem] w-72 min-w-0 flex-col overflow-hidden rounded-shell border shadow-shell-panel",
      "border-white/9 bg-glass-panel text-white light:border-app-border-muted light:text-app-fg",
    )}
  >
    <div className="min-h-0 flex-1 overflow-hidden p-2">
      <Story />
    </div>
  </div>
);

const meta = {
  title: "Chat/FilePreviewDocx",
  component: FilePreviewDocx,
  tags: ["autodocs"],
  parameters: {
    ...STORYBOOK_INLINE_CANVAS_PARAMETERS,
    docs: {
      description: {
        component:
          "Column-3 DOCX preview. Visual preview uses `docx-preview`; plain-text extraction uses `mammoth` elsewhere.",
      },
    },
  },
  decorators: [inPreviewPanel],
  globals: {
    [STORYBOOK_THEME_GLOBAL]: "dark",
  },
} satisfies Meta<typeof FilePreviewDocx>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unavailable: Story = {
  args: { file: undefined },
};

const SAMPLE_DOCX = new File(["docx"], "employee-handbook.docx", {
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

export const WithDocxFile: Story = {
  args: { file: SAMPLE_DOCX },
  parameters: {
    docs: {
      description: {
        story:
          "Uses the real preview hook. Requires a valid DOCX in the browser; may show loading or fallback if render fails.",
      },
    },
  },
};

/** Static layout reference — same markup as loading / failed UI in the component. */
export const LoadingVisual: Story = {
  render: () => (
    <div className={FILE_PREVIEW_DOCX_CONTENT_CLASS}>
      <div className={FILE_PREVIEW_FALLBACK_CLASS}>
        <Text variant="captionMuted">{FILE_PREVIEW_COPY.docxPreviewLoading}</Text>
      </div>
      <div className="docx-preview-styles" aria-hidden />
      <div className="docx-preview-body min-h-0 w-full min-w-0 max-w-full overflow-x-hidden" />
    </div>
  ),
};

export const FailedVisual: Story = {
  render: () => (
    <div className={FILE_PREVIEW_FALLBACK_CLASS}>
      <FileKindIcon kind={FILE_PREVIEW_KIND.DOCX} />
      <Text variant="captionMuted">
        {FILE_PREVIEW_COPY.docxPreviewUnavailable}
      </Text>
    </div>
  ),
};
