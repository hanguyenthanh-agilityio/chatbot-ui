"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  FILE_PREVIEW_ACCEPT,
  FILE_PREVIEW_COPY,
  MOCK_RECENT_FILES,
  formatFileSize,
  type ComposerAttachment,
  type FilePreviewKind,
} from "@/lib/file-preview";
import { cn } from "@/utils/class-name";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";

type ComposerAttachmentMenuProps = {
  disabled?: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onOpenFilePicker: () => void;
  onFileSelected: (file: File) => void;
};

type ComposerAttachmentChipProps = {
  file: ComposerAttachment;
  onRemove: () => void;
};

function MenuIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/6 text-white/70 light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted"
      aria-hidden
    >
      {children}
    </span>
  );
}

function FileKindIcon({ kind }: { kind: FilePreviewKind }) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[10px] font-semibold uppercase tracking-wide",
        "border-white/12 bg-white/8 text-white/70 light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted",
      )}
      aria-hidden
    >
      {kind}
    </span>
  );
}

export function ComposerAttachmentChip({ file, onRemove }: ComposerAttachmentChipProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border px-2 py-1.5",
        "border-white/12 bg-white/6 light:border-app-border light:bg-app-surface-subtle",
      )}
    >
      <FileKindIcon kind={file.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white/90 light:text-app-fg">
          {file.name}
        </p>
        {file.sizeBytes != null ? (
          <p className="text-xs text-white/45 light:text-app-fg-faint">
            {formatFileSize(file.sizeBytes)}
          </p>
        ) : null}
      </div>
      <Badge size="sm" variant="neutral" className="hidden shrink-0 uppercase sm:inline-flex">
        {file.kind}
      </Badge>
      <button
        type="button"
        onClick={onRemove}
        aria-label={FILE_PREVIEW_COPY.removeAttachmentLabel(file.name)}
        className={cn(
          "grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg text-white/50 transition-colors",
          "hover:bg-white/10 hover:text-white/90",
          "light:text-app-fg-faint light:hover:bg-app-hover light:hover:text-app-fg",
        )}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-3.5 w-3.5"
          aria-hidden
        >
          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function ComposerAttachmentMenu({
  disabled = false,
  fileInputRef,
  onOpenFilePicker,
  onFileSelected,
}: ComposerAttachmentMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setIsRecentOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsRecentOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function handleToggleMenu() {
    if (disabled) return;
    setIsOpen((open) => {
      if (open) setIsRecentOpen(false);
      return !open;
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onFileSelected(file);
    setIsOpen(false);
    setIsRecentOpen(false);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_PREVIEW_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={disabled}
        aria-label={FILE_PREVIEW_COPY.attachMenuAriaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        title={FILE_PREVIEW_COPY.attachMenuLabel}
        onClick={handleToggleMenu}
        className={cn(
          "grid h-10 w-10 min-h-10 min-w-10 cursor-pointer place-items-center rounded-xl border transition-colors duration-200",
          "border-white/12 bg-white/6 text-white/80 hover:border-violet-400/45 hover:bg-white/10",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted light:hover:border-app-border-emphasis light:hover:bg-app-hover",
          isOpen && "border-violet-400/55 bg-white/10 light:border-app-border-emphasis",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute bottom-full left-0 z-50 mb-2 min-w-56 overflow-hidden rounded-2xl border p-1.5 shadow-panel",
            "border-white/12 bg-slate-900/95 backdrop-blur-xl",
            "light:border-app-border light:bg-app-surface-raised light:shadow-panel-sm",
          )}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/8 light:text-app-fg light:hover:bg-app-hover"
            onClick={() => {
              onOpenFilePicker();
              setIsOpen(false);
              setIsRecentOpen(false);
            }}
          >
            <MenuIcon>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path d="M8 2v9M5 8l3 3 3-3" />
                <path d="M3 13h10" strokeLinecap="round" />
              </svg>
            </MenuIcon>
            {FILE_PREVIEW_COPY.addFilesLabel}
          </button>

          <div
            className="relative"
            onMouseEnter={() => setIsRecentOpen(true)}
            onMouseLeave={() => setIsRecentOpen(false)}
          >
            <div
              role="menuitem"
              aria-expanded={isRecentOpen}
              className="flex w-full cursor-default items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/8 light:text-app-fg light:hover:bg-app-hover"
            >
              <MenuIcon>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4"
                >
                  <path d="M3 4h10v8H3z" />
                  <path d="M5 2h6v2H5z" />
                </svg>
              </MenuIcon>
              <span className="min-w-0 flex-1">{FILE_PREVIEW_COPY.recentFilesLabel}</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-white/50 transition-transform light:text-app-fg-faint",
                  isRecentOpen && "rotate-90",
                )}
                aria-hidden
              >
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {isRecentOpen ? (
              <div
                role="group"
                aria-label={FILE_PREVIEW_COPY.recentFilesLabel}
                className="mb-1 ml-11 mr-1 space-y-0.5 rounded-xl border border-white/8 bg-white/4 p-1 light:border-app-border-subtle light:bg-app-surface-subtle"
              >
                {MOCK_RECENT_FILES.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-white/45 light:text-app-fg-faint"
                    aria-disabled
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-compact-10 uppercase tracking-wide">
                      {FILE_PREVIEW_COPY.recentFilesComingSoon}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type { ComposerAttachment };
