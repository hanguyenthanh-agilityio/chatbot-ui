import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ComposerAttachmentChip } from "@/components/chat/composer-attachment-chip";
import { ComposerAttachmentMenu } from "@/components/chat/composer-attachment-menu";
import { FileKindIcon } from "@/components/chat/file-kind-icon";
import {
  FILE_PREVIEW_COPY,
} from "@/constants/file-attachment";
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
  afterEach(cleanup);

  it("matches snapshot (closed)", () => {
    const { container } = renderAttachmentMenu();
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("opens menu when the attach button is clicked", async () => {
    const user = userEvent.setup();
    renderAttachmentMenu();

    await user.click(
      screen.getByRole("button", {
        name: FILE_PREVIEW_COPY.attachMenuAriaLabel,
      }),
    );

    expect(
      screen.getByRole("menuitem", { name: FILE_PREVIEW_COPY.addFilesLabel }),
    ).toBeInTheDocument();
  });

  it("calls onFileSelected when a file is chosen", async () => {
    const user = userEvent.setup();
    const onFileSelected = vi.fn();
    renderAttachmentMenu({ onFileSelected });

    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("file input not found");

    const file = new File(["x"], "report.pdf", { type: "application/pdf" });
    await user.upload(input, file);

    expect(onFileSelected).toHaveBeenCalledWith(file);
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
