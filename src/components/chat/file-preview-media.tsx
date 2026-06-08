"use client";

import { FilePreviewFramedDataUrl } from "@/components/chat/file-preview-common";
import {
  FILE_PREVIEW_KIND,
  type MediaFilePreviewKind,
  type NamedRawFilePreviewProps,
} from "@/types/file-attachment";

function FilePreviewMediaPlayer({
  kind,
  file,
  name,
  playerClassName,
}: NamedRawFilePreviewProps & {
  kind: MediaFilePreviewKind;
  playerClassName: string;
}) {
  const isVideo = kind === FILE_PREVIEW_KIND.MP4;

  return (
    <FilePreviewFramedDataUrl kind={kind} file={file}>
      {({ url, onRenderError }) =>
        isVideo ? (
          <video
            src={url}
            controls
            preload="metadata"
            playsInline
            className={playerClassName}
            aria-label={name}
            onError={onRenderError}
          />
        ) : (
          <audio
            src={url}
            controls
            preload="metadata"
            className={playerClassName}
            aria-label={name}
            onError={onRenderError}
          />
        )
      }
    </FilePreviewFramedDataUrl>
  );
}

export function FilePreviewMp4(props: NamedRawFilePreviewProps) {
  return (
    <FilePreviewMediaPlayer
      {...props}
      kind={FILE_PREVIEW_KIND.MP4}
      playerClassName="file-preview-mp4"
    />
  );
}

export function FilePreviewMp3(props: NamedRawFilePreviewProps) {
  return (
    <FilePreviewMediaPlayer
      {...props}
      kind={FILE_PREVIEW_KIND.MP3}
      playerClassName="file-preview-mp3"
    />
  );
}
