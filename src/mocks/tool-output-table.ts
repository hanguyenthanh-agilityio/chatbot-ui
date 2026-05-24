import type { ComponentProps } from "react";
import { ToolOutputTable } from "@/components/chat/tool-output-table";
import {
  getBalanceTableModel,
  getRequestTableModel,
} from "@/components/transcript/named-tables";
import { getSelfRequestRowActions } from "@/components/transcript/cells";

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
      payload: {
        balances: [
          {
            leaveType: "annual",
            allowance: 14,
            used: 2,
            pending: 1,
            remaining: 11,
          },
          {
            leaveType: "sick",
            allowance: 5,
            used: 1,
            pending: 0,
            remaining: 4,
          },
          {
            leaveType: "personal",
            allowance: 2,
            used: 0,
            pending: 0,
            remaining: 2,
          },
        ],
      },
      emptyLabel: "No balance data found.",
    }),
  );
}

export function mockMyRequestsTableProps(): MockToolOutputTableProps {
  const model = getRequestTableModel({
    id: "my-time-off-requests",
    title: "My time-off requests",
    payload: {
      requests: [
        {
          leaveType: "annual",
          leaveTypeLabel: "Annual leave",
          startDate: "2026-06-10",
          endDate: "2026-06-12",
          days: 3,
          status: "pending",
        },
        {
          leaveType: "sick",
          leaveTypeLabel: "Sick leave",
          startDate: "2026-05-02",
          endDate: "2026-05-02",
          days: 1,
          status: "approved",
        },
      ],
    },
    showEmployee: false,
    getRowActions: getSelfRequestRowActions,
    emptyLabel: "No time-off requests found.",
  });

  return fromModel(model);
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
