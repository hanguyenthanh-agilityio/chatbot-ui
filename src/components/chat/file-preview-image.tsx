"use client";

import Image from "next/image";
import { FilePreviewFramedDataUrl } from "@/components/chat/file-preview-common";
import {
  FILE_PREVIEW_KIND,
  type NamedRawFilePreviewProps,
} from "@/types/file-attachment";

export function FilePreviewImage({ file, name }: NamedRawFilePreviewProps) {
  return (
    <FilePreviewFramedDataUrl kind={FILE_PREVIEW_KIND.IMAGE} file={file}>
      {({ url, onRenderError }) => (
        <Image
          src={url}
          alt={name}
          width={1600}
          height={1200}
          unoptimized
          sizes="100vw"
          onError={onRenderError}
          className="h-auto w-full max-h-file-preview-image rounded-xl object-contain"
        />
      )}
    </FilePreviewFramedDataUrl>
  );
}
