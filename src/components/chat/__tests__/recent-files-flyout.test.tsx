import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecentFilesFlyout } from "@/components/chat/recent-files-flyout";
import { MOCK_RECENT_FILES } from "@/constants/file-attachment";
import type { LibraryRecentFile } from "@/types/file-attachment";
import { FILE_PREVIEW_KIND } from "@/types/file-attachment";

const flyoutProps = {
  recentMenuId: "recent-flyout-test",
  style: { top: 0, left: 0 },
  onPointerEnter: vi.fn(),
  onPointerLeave: vi.fn(),
} as const;

describe("RecentFilesFlyout", () => {
  afterEach(cleanup);

  it.each([
    ["with-files", MOCK_RECENT_FILES],
    ["empty", []],
  ] as const)("matches snapshot (%s)", (_name, recentFiles) => {
    const { container } = render(
      <RecentFilesFlyout {...flyoutProps} recentFiles={recentFiles} />,
    );
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("shows only the kind label when file meta is empty", () => {
    const recentFile: LibraryRecentFile = {
      id: "recent-no-meta",
      name: "draft.csv",
      kind: FILE_PREVIEW_KIND.CSV,
    };

    const { container } = render(
      <RecentFilesFlyout {...flyoutProps} recentFiles={[recentFile]} />,
    );

    expect(screen.getByText("draft.csv")).toBeInTheDocument();
    expect(container.querySelector(".normal-case")).not.toBeInTheDocument();
  });
});
