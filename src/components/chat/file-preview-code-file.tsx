"use client";

import {
  FilePreviewCodeBody,
  FilePreviewEmbeddedBody,
} from "@/components/chat/file-preview-common";
import { FILE_PREVIEW_CODE_CONTENT_CLASS } from "@/constants/file-attachment";
import { useCodeFilePreview } from "@/hooks/use-file-preview";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

type CodeFilePreviewKind =
  | typeof FILE_PREVIEW_KIND.CSV
  | typeof FILE_PREVIEW_KIND.JSON;

export function FilePreviewCodeFile({
  file,
  kind,
}: {
  file: File | undefined;
  kind: CodeFilePreviewKind;
}) {
  const { text, isLoading, hasFailed } = useCodeFilePreview(file, kind);
  const isJson = kind === FILE_PREVIEW_KIND.JSON;

  return (
    <FilePreviewEmbeddedBody
      contentClassName={FILE_PREVIEW_CODE_CONTENT_CLASS}
      kind={kind}
      file={file}
      isLoading={isLoading}
      hasFailed={hasFailed}
    >
      {text ? (
        <FilePreviewCodeBody
          text={text}
          highlight={isJson}
          ariaLabel={isJson ? "JSON preview" : "CSV preview"}
        />
      ) : null}
    </FilePreviewEmbeddedBody>
  );
}
