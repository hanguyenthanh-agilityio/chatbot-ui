import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ComposerAttachmentChip } from "@/components/chat/composer-attachment-chip";
import { ComposerAttachmentMenu } from "@/components/chat/composer-attachment-menu";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import { FILE_PREVIEW_COPY } from "@/constants/file-attachment";
import * as browser from "@/lib/browser";
import { MOCK_COMPOSER_ATTACHMENT } from "@/mocks/file-attachment";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

function renderAttachmentMenu(
  overrides: Partial<{
    onOpenFilePicker: () => void;
    onFileSelected: (file: File) => void;
    disabled: boolean;
  }> = {},
) {
  const fileInputRef = createRef<HTMLInputElement>();
  return render(
    <ComposerAttachmentMenu
      fileInputRef={fileInputRef}
      onOpenFilePicker={vi.fn()}
      onFileSelected={vi.fn()}
      {...overrides}
    />,
  );
}

const attachButton = () =>
  screen.getByRole("button", {
    name: FILE_PREVIEW_COPY.attachMenuAriaLabel,
  });

const addFilesMenuItem = () =>
  screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.addFilesLabel });

const queryAddFilesMenuItem = () =>
  screen.queryByRole("menuitem", { name: FILE_PREVIEW_COPY.addFilesLabel });

const fileInput = () =>
  screen.getByLabelText(FILE_PREVIEW_COPY.attachFileInputLabel);

const recentFilesMenuItem = () =>
  screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.recentFilesLabel });

const recentFilesTrigger = () => {
  const trigger = recentFilesMenuItem().parentElement;
  if (!trigger) throw new Error("recent files trigger not found");
  return trigger;
};

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(attachButton());
}

describe("ComposerAttachmentChip", () => {
  afterEach(cleanup);

  it("matches snapshot", () => {
    const { container } = render(
      <ComposerAttachmentChip
        file={MOCK_COMPOSER_ATTACHMENT}
        onRemove={vi.fn()}
      />,
    );
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });
});

describe("ComposerAttachmentMenu", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("matches snapshot (closed)", () => {
    const { container } = renderAttachmentMenu();
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  describe("toggleMenu", () => {
    it("opens the menu when closed", async () => {
      const user = userEvent.setup();
      renderAttachmentMenu();
      await openMenu(user);

      expect(addFilesMenuItem()).toBeInTheDocument();
    });

    it("closes the menu when open", async () => {
      const user = userEvent.setup();
      renderAttachmentMenu();
      await openMenu(user);

      await user.click(attachButton());

      expect(queryAddFilesMenuItem()).not.toBeInTheDocument();
    });
  });

  describe("handleAddFilesClick", () => {
    it("calls onOpenFilePicker and closes the menu", async () => {
      const user = userEvent.setup();
      const onOpenFilePicker = vi.fn();
      renderAttachmentMenu({ onOpenFilePicker });
      await openMenu(user);

      await user.click(addFilesMenuItem());

      expect(onOpenFilePicker).toHaveBeenCalledTimes(1);
      expect(queryAddFilesMenuItem()).not.toBeInTheDocument();
    });
  });

  describe("handleFileInputChange", () => {
    it("calls onFileSelected and closes the menu when a file is chosen", async () => {
      const user = userEvent.setup();
      const onFileSelected = vi.fn();
      renderAttachmentMenu({ onFileSelected });
      await openMenu(user);

      const file = new File(["x"], "report.pdf", {
        type: "application/pdf",
      });
      await user.upload(fileInput(), file);

      expect(onFileSelected).toHaveBeenCalledWith(file);
      expect(queryAddFilesMenuItem()).not.toBeInTheDocument();
    });

    it("does nothing when the file input is empty", () => {
      const onFileSelected = vi.fn();
      renderAttachmentMenu({ onFileSelected });

      fireEvent.change(fileInput(), { target: { files: [] } });

      expect(onFileSelected).not.toHaveBeenCalled();
    });
  });

  describe("recent files flyout (isRecentOpen)", () => {
    it("portals flyout to document.body and wires recentMenuId via aria-controls", async () => {
      const user = userEvent.setup();
      renderAttachmentMenu();
      await openMenu(user);

      fireEvent.mouseEnter(recentFilesTrigger());

      const recentItem = recentFilesMenuItem();
      expect(recentItem).toHaveAttribute("aria-expanded", "true");
      expect(recentItem).toHaveClass("bg-white/8");

      const recentMenuId = recentItem.getAttribute("aria-controls");
      expect(recentMenuId).toBeTruthy();

      const flyout = document.getElementById(recentMenuId!);
      expect(flyout).toBeInTheDocument();
      expect(flyout).toHaveAttribute("role", "group");
      expect(flyout).toHaveAttribute(
        "aria-label",
        FILE_PREVIEW_COPY.recentFilesLabel,
      );
      expect(document.body).toContainElement(flyout!);
    });

    it("does not portal flyout when isBrowser() is false", async () => {
      vi.spyOn(browser, "isBrowser").mockReturnValue(false);
      const user = userEvent.setup();
      renderAttachmentMenu();
      await openMenu(user);

      fireEvent.mouseEnter(recentFilesTrigger());

      expect(recentFilesMenuItem()).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.queryByRole("group", {
          name: FILE_PREVIEW_COPY.recentFilesLabel,
        }),
      ).not.toBeInTheDocument();
    });
  });
});

describe("FileKindIcon", () => {
  afterEach(cleanup);

  it.each([
    [FILE_PREVIEW_KIND.PDF, "md"],
    [FILE_PREVIEW_KIND.MP4, "sm"],
  ] as const)("matches snapshot (%s, %s)", (kind, size) => {
    const { container } = render(<FileKindIcon kind={kind} size={size} />);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });
});
