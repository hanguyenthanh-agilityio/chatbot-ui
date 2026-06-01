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

  it("does not show Add from library", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole("button", { name: FILE_PREVIEW_COPY.attachMenuAriaLabel }),
    );

    expect(screen.queryByText(/add from library/i)).not.toBeInTheDocument();
  });

  it("shows recent files flyout with mock data on hover", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(
      screen.getByRole("button", { name: FILE_PREVIEW_COPY.attachMenuAriaLabel }),
    );
    fireEvent.mouseEnter(
      screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.recentFilesLabel }),
    );

    expect(screen.getByText("leave-policy-2026.pdf")).toBeInTheDocument();
    expect(screen.getByText(/240\.0 KB · Yesterday/)).toBeInTheDocument();
    expect(screen.getByText(FILE_PREVIEW_COPY.recentFilesComingSoon)).toBeInTheDocument();
    expect(screen.getByText(FILE_PREVIEW_COPY.recentFilesComingSoonHint)).toBeInTheDocument();
  });

  it("does not attach when clicking a mock recent file", async () => {
    const user = userEvent.setup();
    const { onFileSelected } = renderMenu();

    await user.click(
      screen.getByRole("button", { name: FILE_PREVIEW_COPY.attachMenuAriaLabel }),
    );
    fireEvent.mouseEnter(
      screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.recentFilesLabel }),
    );
    await user.click(screen.getByText("leave-policy-2026.pdf"));

    expect(onFileSelected).not.toHaveBeenCalled();
  });

  it("shows empty state when there are no recent files", async () => {
    const user = userEvent.setup();
    const fileInputRef = createRef<HTMLInputElement>();

    render(
      <ComposerAttachmentMenu
        fileInputRef={fileInputRef}
        onOpenFilePicker={vi.fn()}
        onFileSelected={vi.fn()}
        recentFiles={[]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: FILE_PREVIEW_COPY.attachMenuAriaLabel }),
    );
    fireEvent.mouseEnter(
      screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.recentFilesLabel }),
    );

    expect(screen.getByText(FILE_PREVIEW_COPY.recentFilesEmpty)).toBeInTheDocument();
  });
});
