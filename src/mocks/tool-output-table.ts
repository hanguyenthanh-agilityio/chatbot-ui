import type { ComponentProps } from "react";
import { ToolOutputTable } from "@/components/chat/tool-output-table";
import {
  getBalanceTableModel,
  getRequestTableModel,
} from "@/components/transcript/named-tables";
import { getSelfRequestRowActions } from "@/components/transcript/cells";
import { FIXTURE_BALANCES, FIXTURE_REQUESTS } from "@/mocks/time-off-fixtures";

export type MockToolOutputTableProps = ComponentProps<typeof ToolOutputTable>;

function fromModel(
  model: ReturnType<typeof getBalanceTableModel>,
): MockToolOutputTableProps {
  if (!model) {
    throw new Error("Failed to build tool output table mock.");
  }

  return {
    title: model.title,
    columns: model.columns,
    rows: model.rows,
    rowActions: model.rowActions,
    rowActionSummaries: model.rowActionSummaries,
    emptyLabel: model.emptyLabel,
  };
}

export function mockBalanceTableProps(): MockToolOutputTableProps {
  return fromModel(
    getBalanceTableModel({
      id: "my-time-off-balance",
      title: "My leave balance",
      payload: { balances: FIXTURE_BALANCES },
      emptyLabel: "No balance data found.",
    }),
  );
}

export function mockMyRequestsTableProps(): MockToolOutputTableProps {
  return fromModel(
    getRequestTableModel({
      id: "my-time-off-requests",
      title: "My time-off requests",
      payload: { requests: FIXTURE_REQUESTS },
      showEmployee: false,
      getRowActions: getSelfRequestRowActions,
      emptyLabel: "No time-off requests found.",
    }),
  );
}

export function mockEmptyTableProps(): MockToolOutputTableProps {
  return {
    title: "My time-off requests",
    columns: [
      { key: "leaveType", label: "Leave type", align: "center" },
      { key: "dateRange", label: "Date range", align: "center" },
      { key: "days", label: "Days", align: "center" },
      { key: "status", label: "Status", align: "center" },
    ],
    rows: [],
    emptyLabel: "No time-off requests found.",
  };
}
