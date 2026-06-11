import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToolOutputTable } from "@/components/chat/tool-output-table";
import {
  mockActionableMyRequestsTableProps,
  mockBalanceTableProps,
  mockEmptyTableProps,
  mockMyRequestsTableProps,
} from "@/mocks/tool-output-table";

function getSelectableRowButton(
  props: ReturnType<typeof mockActionableMyRequestsTableProps>,
) {
  const actionableIndex = props.rowActions?.findIndex(
    (actions) => (actions?.length ?? 0) > 0,
  );
  if (actionableIndex === undefined || actionableIndex < 0) {
    throw new Error("expected actionable row");
  }
  const summary =
    props.rowActionSummaries?.[actionableIndex] ??
    `Record ${actionableIndex + 1}`;

  return screen.getByRole("button", { name: `Select ${summary}` });
}

describe("ToolOutputTable", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["balance", mockBalanceTableProps()],
    ["my-requests", mockMyRequestsTableProps()],
    ["empty", mockEmptyTableProps()],
  ] as const)("matches snapshot (%s)", (_name, props) => {
    const { container } = render(<ToolOutputTable {...props} />);
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("renders title and record count badge", () => {
    const props = mockBalanceTableProps();
    render(<ToolOutputTable {...props} />);

    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText("3 records")).toBeInTheDocument();
  });

  it("renders column headers and row cell values", () => {
    const props = mockBalanceTableProps();
    render(<ToolOutputTable {...props} />);

    for (const column of props.columns) {
      expect(screen.getAllByText(column.label).length).toBeGreaterThan(0);
    }
    expect(screen.getByText("Annual")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("shows empty label when there are no rows", () => {
    const props = mockEmptyTableProps();
    render(<ToolOutputTable {...props} />);

    expect(screen.getByText(props.emptyLabel!)).toBeInTheDocument();
    expect(screen.getByText("0 records")).toBeInTheDocument();
  });

  describe("row actions", () => {
    it("reveals row actions after selecting an actionable row", async () => {
      const user = userEvent.setup();
      const onActionClick = vi.fn();
      const props = mockActionableMyRequestsTableProps();

      render(
        <ToolOutputTable
          {...props}
          onActionClick={onActionClick}
        />,
      );

      await user.click(getSelectableRowButton(props));

      const cancelAction = await screen.findByRole("button", {
        name: "Cancel request",
      });
      await user.click(cancelAction);

      expect(onActionClick).toHaveBeenCalledTimes(1);
      expect(onActionClick.mock.calls[0]?.[0]).toContain("cancel");
    });

    it("selects an actionable row on Enter key", async () => {
      const user = userEvent.setup();
      const props = mockActionableMyRequestsTableProps();

      render(<ToolOutputTable {...props} onActionClick={vi.fn()} />);

      const row = getSelectableRowButton(props);
      row.focus();
      await user.keyboard("{Enter}");

      expect(
        await screen.findByRole("button", { name: "Cancel request" }),
      ).toBeInTheDocument();
    });

    it("disables row action buttons when disableActions is true", async () => {
      const user = userEvent.setup();
      const onActionClick = vi.fn();
      const props = mockActionableMyRequestsTableProps();

      render(
        <ToolOutputTable
          {...props}
          onActionClick={onActionClick}
          disableActions
        />,
      );

      await user.click(getSelectableRowButton(props));

      const cancelAction = screen.getByRole("button", {
        name: "Cancel request",
      });
      expect(cancelAction).toBeDisabled();
    });
  });
});
