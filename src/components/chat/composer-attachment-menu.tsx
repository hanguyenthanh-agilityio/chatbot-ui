"use client";

import { createPortal } from "react-dom";
import { useCallback, type ChangeEvent, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRightIcon,
  ClockIcon,
  PlusIcon,
  UploadIcon,
} from "@/components/ui/icons";
import { RecentFilesFlyout } from "./recent-files-flyout";
import { isBrowser } from "@/lib/browser";
import {
  COMPOSER_ATTACH_ICON_LG_CLASS,
  COMPOSER_ATTACH_ICON_XS_CLASS,
  COMPOSER_ATTACH_MENU_CLASS,
  COMPOSER_ATTACH_MENU_ITEM_CLASS,
  COMPOSER_ATTACH_MENU_ITEM_LABEL_CLASS,
  COMPOSER_ATTACH_MENU_PANEL_CLASS,
  FILE_PREVIEW_ACCEPT,
  FILE_PREVIEW_COPY,
  MOCK_RECENT_FILES,
} from "@/constants/file-attachment";
import { useComposerAttachmentMenu } from "@/hooks/use-composer-attachment-menu";
import type { LibraryRecentFile } from "@/types/file-attachment";
import { cn } from "@/utils/class-name";
import { readSelectedFileFromInput } from "@/utils/file-attachment";

const menuItemIconBoxClass = cn(
  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
  "border-white/10 bg-white/6 text-white/75",
  "light:border-app-border-subtle light:bg-app-surface-subtle light:text-app-fg-muted",
);

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
    closeMenu,
    toggleMenu,
    recentHover,
  } = useComposerAttachmentMenu();

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = readSelectedFileFromInput(event);
      if (!file) return;
      onFileSelected(file);
      closeMenu();
    },
    [closeMenu, onFileSelected],
  );

  const handleAddFilesClick = useCallback(() => {
    onOpenFilePicker();
    closeMenu();
  }, [closeMenu, onOpenFilePicker]);

  const recentFlyout =
    isRecentOpen && isBrowser() ? (
      createPortal(
        <RecentFilesFlyout
          recentMenuId={recentMenuId}
          recentFiles={recentFiles}
          style={recentFlyoutStyle}
          onPointerEnter={recentHover.onEnter}
          onPointerLeave={recentHover.onLeave}
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
        onChange={handleFileInputChange}
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
        onClick={toggleMenu}
        className={cn(
          isOpen &&
            "border-violet-400/55 bg-white/10 light:border-app-border-emphasis",
        )}
      >
        <PlusIcon className={COMPOSER_ATTACH_ICON_XS_CLASS} strokeWidth={2} />
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
            onClick={handleAddFilesClick}
          >
            <span className={menuItemIconBoxClass} aria-hidden>
              <UploadIcon className={COMPOSER_ATTACH_ICON_LG_CLASS} />
            </span>
            <span className={COMPOSER_ATTACH_MENU_ITEM_LABEL_CLASS}>
              {FILE_PREVIEW_COPY.addFilesLabel}
            </span>
          </Button>

          <div
            ref={recentTriggerRef}
            onMouseEnter={recentHover.onEnter}
            onMouseLeave={recentHover.onLeave}
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
              <span className={menuItemIconBoxClass} aria-hidden>
                <ClockIcon className={COMPOSER_ATTACH_ICON_LG_CLASS} />
              </span>
              <span className={COMPOSER_ATTACH_MENU_ITEM_LABEL_CLASS}>
                {FILE_PREVIEW_COPY.recentFilesLabel}
              </span>
              <ChevronRightIcon
                className={cn(
                  COMPOSER_ATTACH_ICON_XS_CLASS,
                  "shrink-0 text-white/45 light:text-app-fg-faint",
                )}
              />
            </div>
          </div>
        </div>
      ) : null}

      {recentFlyout}
    </div>
  );
}
