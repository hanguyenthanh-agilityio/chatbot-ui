import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecentFilesFlyout } from "@/components/chat/recent-files-flyout";
import { MOCK_RECENT_FILES } from "@/constants/file-attachment";

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
});
