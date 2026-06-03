"use client";

import {
  FileAudioIcon,
  FileDocumentIcon,
  FileImageIcon,
  FileVideoIcon,
} from "@/components/ui/icons";
import { FILE_KIND_BG } from "@/constants/file-attachment";
import { FILE_PREVIEW_KIND, type FilePreviewKind } from "@/types/file-attachment";
import { cn } from "@/utils/class-name";

const iconBoxClass = {
  sm: cn(
    "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white shadow-sm",
  ),
  md: cn(
    "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm",
  ),
} as const;

const iconGlyphClass = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
} as const;

function fileKindIconComponent(kind: FilePreviewKind) {
  if (kind === FILE_PREVIEW_KIND.MP4) return FileVideoIcon;
  if (kind === FILE_PREVIEW_KIND.MP3) return FileAudioIcon;
  if (kind === FILE_PREVIEW_KIND.IMAGE) return FileImageIcon;
  return FileDocumentIcon;
}

export function FileKindIcon({
  kind,
  size = "md",
}: {
  kind: FilePreviewKind;
  size?: "sm" | "md";
}) {
  const Icon = fileKindIconComponent(kind);

  return (
    <span
      className={cn(iconBoxClass[size], FILE_KIND_BG[kind])}
      aria-hidden
    >
      <Icon className={iconGlyphClass[size]} />
    </span>
  );
}
