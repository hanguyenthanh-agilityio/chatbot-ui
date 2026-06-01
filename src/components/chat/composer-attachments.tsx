"use client";

import { createPortal } from "react-dom";
import type { ChangeEvent, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  PlusIcon,
  UploadIcon,
} from "@/components/ui/icons";
import {
  AttachmentMenuIcon,
  FileKindIcon,
  RecentFilesFlyout,
} from "./file-attachment-parts";
import {
  COMPOSER_ATTACH_MENU_CLASS,
  COMPOSER_ATTACH_MENU_ITEM_CLASS,
  COMPOSER_ATTACH_MENU_ITEM_LABEL_CLASS,
  COMPOSER_ATTACH_MENU_PANEL_CLASS,
  COMPOSER_ATTACH_TOGGLE_ICON_CLASS,
  FILE_KIND_LABEL,
  FILE_PREVIEW_ACCEPT,
  FILE_PREVIEW_COPY,
  MOCK_RECENT_FILES,
} from "@/constants/file-attachment";
import { useComposerAttachmentMenu } from "@/hooks/use-composer-attachment-menu";
import type { ComposerAttachment, LibraryRecentFile } from "@/types/file-attachment";
import { cn } from "@/utils/class-name";

export function ComposerAttachmentChip({
  file,
  onRemove,
}: {
  file: ComposerAttachment;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl border px-2 py-1.5",
        "border-white/12 bg-white/6 light:border-app-border light:bg-app-surface-subtle",
      )}
    >
      <FileKindIcon kind={file.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-snug text-white/95 light:text-app-fg">
          {file.name}
        </p>
        <p className="text-xs uppercase tracking-wide text-white/45 light:text-app-fg-faint">
          {FILE_KIND_LABEL[file.kind]}
        </p>
      </div>
      <Button
        type="button"
        variant="composerAttachChipRemove"
        onClick={onRemove}
        aria-label={FILE_PREVIEW_COPY.removeAttachmentLabel(file.name)}
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function ComposerAttachmentMenu({
  disabled = false,
  fileInputRef,
  onOpenFilePicker,
  onFileSelected,
  recentFiles = MOCK_RECENT_FILES,
}: {
  disabled?: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onOpenFilePicker: () => void;
  onFileSelected: (file: File) => void;
  recentFiles?: readonly LibraryRecentFile[];
}) {
  const {
    menuId,
    recentMenuId,
    rootRef,
    menuPanelRef,
    recentTriggerRef,
    isOpen,
    isRecentOpen,
    recentFlyoutStyle,
    canUsePortal,
    closeMenu,
    openRecent,
    scheduleCloseRecent,
    toggleMenu,
  } = useComposerAttachmentMenu();

  const recentFlyout =
    isRecentOpen && canUsePortal ? (
      createPortal(
        <RecentFilesFlyout
          recentMenuId={recentMenuId}
          recentFiles={recentFiles}
          style={recentFlyoutStyle}
          onPointerEnter={openRecent}
          onPointerLeave={scheduleCloseRecent}
        />,
        document.body,
      )
    ) : null;

  return (
    <div ref={rootRef} className="relative shrink-0 self-center">
      <Input
        ref={fileInputRef}
        type="file"
        accept={FILE_PREVIEW_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          onFileSelected(file);
          closeMenu();
        }}
      />

      <Button
        type="button"
        variant="composerAttachToggle"
        disabled={disabled}
        aria-label={FILE_PREVIEW_COPY.attachMenuAriaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        title={FILE_PREVIEW_COPY.attachMenuLabel}
        onClick={() => {
          if (disabled) return;
          toggleMenu();
        }}
        className={cn(
          isOpen &&
            "border-violet-400/55 bg-white/10 light:border-app-border-emphasis",
        )}
      >
        <PlusIcon className={COMPOSER_ATTACH_TOGGLE_ICON_CLASS} strokeWidth={2} />
      </Button>

      {isOpen ? (
        <div
          ref={menuPanelRef}
          id={menuId}
          role="menu"
          className={cn(COMPOSER_ATTACH_MENU_CLASS, COMPOSER_ATTACH_MENU_PANEL_CLASS)}
        >
          <Button
            type="button"
            variant="composerAttachMenuItem"
            role="menuitem"
            className="cursor-pointer text-sm"
            onClick={() => {
              onOpenFilePicker();
              closeMenu();
            }}
          >
            <AttachmentMenuIcon>
              <UploadIcon className="h-[18px] w-[18px]" />
            </AttachmentMenuIcon>
            <span className={COMPOSER_ATTACH_MENU_ITEM_LABEL_CLASS}>
              {FILE_PREVIEW_COPY.addFilesLabel}
            </span>
          </Button>

          <div
            ref={recentTriggerRef}
            onMouseEnter={openRecent}
            onMouseLeave={scheduleCloseRecent}
          >
            <div
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={isRecentOpen}
              aria-controls={isRecentOpen ? recentMenuId : undefined}
              className={cn(
                COMPOSER_ATTACH_MENU_ITEM_CLASS,
                "cursor-default text-sm",
                isRecentOpen && "bg-white/8 light:bg-app-hover",
              )}
            >
              <AttachmentMenuIcon>
                <ClockIcon className="h-[18px] w-[18px]" />
              </AttachmentMenuIcon>
              <span className={COMPOSER_ATTACH_MENU_ITEM_LABEL_CLASS}>
                {FILE_PREVIEW_COPY.recentFilesLabel}
              </span>
              <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-white/45 light:text-app-fg-faint" />
            </div>
          </div>
        </div>
      ) : null}

      {recentFlyout}
    </div>
  );
}

export type { ComposerAttachment };
