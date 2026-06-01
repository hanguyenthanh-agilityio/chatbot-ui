import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ComposerAttachmentMenu } from "@/components/file-preview/composer-attachments";
import { FILE_PREVIEW_COPY } from "@/lib/file-preview";

function renderMenu() {
  const fileInputRef = createRef<HTMLInputElement>();
  const onOpenFilePicker = vi.fn();
  const onFileSelected = vi.fn();

  render(
    <ComposerAttachmentMenu
      fileInputRef={fileInputRef}
      onOpenFilePicker={onOpenFilePicker}
      onFileSelected={onFileSelected}
    />,
  );

  return { onOpenFilePicker, onFileSelected };
}

describe("ComposerAttachmentMenu", () => {
  afterEach(cleanup);

  it("opens menu and triggers file picker", async () => {
    const user = userEvent.setup();
    const { onOpenFilePicker } = renderMenu();

    await user.click(
      screen.getByRole("button", { name: FILE_PREVIEW_COPY.attachMenuAriaLabel }),
    );
    await user.click(screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.addFilesLabel }));
    expect(onOpenFilePicker).toHaveBeenCalledTimes(1);
  });

  it("shows recent files on hover", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole("button", { name: FILE_PREVIEW_COPY.attachMenuAriaLabel }),
    );
    fireEvent.mouseEnter(
      screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.recentFilesLabel }).parentElement!,
    );

    expect(screen.getByText("leave-policy-2026.pdf")).toBeInTheDocument();
  });
});
