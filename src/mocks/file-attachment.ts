import type { ComposerAttachment } from "@/types/file-attachment";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

export const MOCK_COMPOSER_ATTACHMENT: ComposerAttachment = {
  id: "mock-attach-policy",
  name: "leave-policy-2026.pdf",
  kind: FILE_PREVIEW_KIND.PDF,
  sizeBytes: 245_760,
  mimeType: "application/pdf",
};
