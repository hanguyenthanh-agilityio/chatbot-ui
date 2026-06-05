"use client";

import {
  FilePreviewCodeBody,
  FilePreviewEmbeddedBody,
} from "@/components/chat/file-preview-common";
import { FILE_PREVIEW_CODE_CONTENT_CLASS } from "@/constants/file-attachment";
import { useJsonPreview } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

export function FilePreviewJson({ file }: { file: File | undefined }) {
  const { text, isLoading, hasFailed } = useJsonPreview(file);

  return (
    <FilePreviewEmbeddedBody
      contentClassName={FILE_PREVIEW_CODE_CONTENT_CLASS}
      kind={FILE_PREVIEW_KIND.JSON}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
    >
      {text ? (
        <FilePreviewCodeBody
          text={text}
          highlight
          ariaLabel="JSON preview"
        />
      ) : null}
    </FilePreviewEmbeddedBody>
  );
}
