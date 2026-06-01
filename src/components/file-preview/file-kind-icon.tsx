import { FILE_PREVIEW_KIND, type FilePreviewKind } from "@/lib/file-preview";
import { cn } from "@/utils/class-name";

const FILE_KIND_VISUAL: Record<
  FilePreviewKind,
  { label: string; bgClass: string }
> = {
  [FILE_PREVIEW_KIND.PDF]: {
    label: "PDF",
    bgClass: "bg-[#E5484D]",
  },
  [FILE_PREVIEW_KIND.DOCX]: {
    label: "DOCX",
    bgClass: "bg-[#3B82F6]",
  },
  [FILE_PREVIEW_KIND.MP4]: {
    label: "MP4",
    bgClass: "bg-[#8B5CF6]",
  },
  [FILE_PREVIEW_KIND.MP3]: {
    label: "MP3",
    bgClass: "bg-[#14B8A6]",
  },
  [FILE_PREVIEW_KIND.UNKNOWN]: {
    label: "FILE",
    bgClass: "bg-neutral-500",
  },
};

function DocumentGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 4.5h6.8L16.5 8.2V19a1.25 1.25 0 01-1.25 1.25H7.25A1.25 1.25 0 016 19V5.75A1.25 1.25 0 017.25 4.5H7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 4.5V8.2h3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="5"
        y="7"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M11 10.5v5l4.5-2.5L11 10.5z" fill="currentColor" />
    </svg>
  );
}

function AudioGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M9.5 8.5v8a2 2 0 11-4 0v-8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.5 8.5c0-2.5 2.5-4 5.5-2.5 1.5.8 2.5 2.4 2.5 4.2v5.3a2 2 0 11-4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function getFileKindLabel(kind: FilePreviewKind): string {
  return FILE_KIND_VISUAL[kind].label;
}

type FileKindIconProps = {
  kind: FilePreviewKind;
  size?: "sm" | "md";
  className?: string;
};

const ICON_SIZE = {
  sm: { box: "h-9 w-9 rounded-lg", glyph: "h-6 w-6" },
  md: { box: "h-10 w-10 rounded-xl", glyph: "h-7 w-7" },
} as const;

export function FileKindIcon({ kind, size = "md", className }: FileKindIconProps) {
  const visual = FILE_KIND_VISUAL[kind];
  const { box: boxClass, glyph: glyphClass } = ICON_SIZE[size];

  const glyph = (() => {
    switch (kind) {
      case FILE_PREVIEW_KIND.MP4:
        return <VideoGlyph className={cn(glyphClass, "text-white")} />;
      case FILE_PREVIEW_KIND.MP3:
        return <AudioGlyph className={cn(glyphClass, "text-white")} />;
      default:
        return <DocumentGlyph className={cn(glyphClass, "text-white")} />;
    }
  })();

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center shadow-sm",
        boxClass,
        visual.bgClass,
        className,
      )}
      aria-hidden
    >
      {glyph}
    </span>
  );
}
