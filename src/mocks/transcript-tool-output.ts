import type { ComponentProps } from "react";
import type { UIMessage } from "ai";
import { ToolOutputTable } from "@/components/chat/tool-output-table";
import {
  buildMembersTableModel,
  getBalanceTableModel,
  getRequestTableModel,
  type ToolOutputTableModel,
} from "@/components/transcript/named-tables";
import { getToolOutputTables } from "@/components/transcript/tool-output";
import {
  getBalanceRowActions,
  getMemberRowActions,
  getSelfRequestRowActions,
  getTeamRequestRowActions,
} from "@/components/transcript/cells";
import { getGenericTableModel } from "@/components/transcript/generic-table";

export type MockToolOutputTableProps = ComponentProps<typeof ToolOutputTable>;

function fromModel(model: ToolOutputTableModel | null): MockToolOutputTableProps {
  if (!model) {
    throw new Error("Failed to build transcript tool output table mock.");
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

export function mockTeamMembersTableProps(): MockToolOutputTableProps {
  return fromModel(
    buildMembersTableModel({
      id: "team-members",
      title: "Team members",
      memberRows: [
        {
          employeeName: "Mia Nguyen",
          employeeAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=mia",
          team: "Flash",
          pendingCount: 2,
          approvedCount: 4,
          cancelledCount: 0,
          totalCount: 6,
        },
        {
          employeeName: "An Pham",
          team: "Flash",
          pendingCount: 0,
          approvedCount: 3,
          cancelledCount: 1,
          totalCount: 4,
        },
      ],
      emptyLabel: "No team members found.",
    }),
  );
}

export function mockTeamRequestsTableProps(): MockToolOutputTableProps {
  return fromModel(
    getRequestTableModel({
      id: "team-time-off-requests",
      title: "Team time-off requests",
      payload: {
        requests: [
          {
            employeeName: "Mia Nguyen",
            team: "Flash",
            leaveType: "annual",
            leaveTypeLabel: "Annual leave",
            startDate: "2026-08-10",
            endDate: "2026-08-12",
            days: 3,
            status: "pending",
          },
          {
            employeeName: "An Pham",
            team: "Flash",
            leaveType: "sick",
            leaveTypeLabel: "Sick leave",
            startDate: "2026-07-01",
            endDate: "2026-07-01",
            days: 1,
            status: "approved",
          },
        ],
      },
      showEmployee: true,
      getRowActions: getTeamRequestRowActions,
      emptyLabel: "No team requests found.",
    }),
  );
}

export function mockGenericRecordsTableProps(): MockToolOutputTableProps {
  return fromModel(
    getGenericTableModel({
      id: "custom-records",
      title: "Matching requests",
      rows: [
        {
          requestId: "REQ-1001",
          leaveType: "annual",
          startDate: "2026-09-01",
          endDate: "2026-09-03",
          status: "pending",
        },
      ],
      emptyLabel: "No records found.",
    }),
  );
}

export const FIXTURE_BALANCE = {
  leaveType: "annual",
  allowance: 14,
  used: 0,
  pending: 0,
  remaining: 14,
} as const;

export const FIXTURE_REQUEST = {
  leaveType: "annual",
  startDate: "2099-06-10",
  endDate: "2099-06-12",
  days: 3,
  status: "pending",
} as const;

export const FIXTURE_MEMBER = {
  employeeName: "Mia Nguyen",
  pendingCount: 0,
  approvedCount: 1,
  cancelledCount: 0,
  totalCount: 1,
} as const;

export function createToolPart(
  toolName: string,
  output?: unknown,
  partial: Record<string, unknown> = {},
): UIMessage["parts"][number] {
  return {
    type: `tool-${toolName}`,
    toolCallId: `tc-${toolName}`,
    state: "output-available",
    input: {},
    ...partial,
    ...(output !== undefined ? { output } : {}),
  } as UIMessage["parts"][number];
}

function toolPart(
  toolName: string,
  partial: Record<string, unknown>,
): UIMessage["parts"][number] {
  const { output, ...rest } = partial;
  return createToolPart(toolName, output, rest);
}

export function mockBalanceToolPart(): UIMessage["parts"][number] {
  return toolPart("get_my_time_off_balance", {
    state: "output-available",
    input: {},
    output: {
      balances: [
        {
          leaveType: "annual",
          allowance: 14,
          used: 2,
          pending: 1,
          remaining: 11,
        },
      ],
    },
  });
}

export function mockTeamMembersToolPart(): UIMessage["parts"][number] {
  return toolPart("list_team_members", {
    state: "output-available",
    input: {},
    output: {
      members: [
        {
          employeeName: "Mia Nguyen",
          team: "Flash",
          pendingCount: 1,
          approvedCount: 2,
          cancelledCount: 0,
          totalCount: 3,
        },
      ],
    },
  });
}

export function getTablesFromToolPart(part: UIMessage["parts"][number]) {
  return getToolOutputTables(part);
}

export {
  getBalanceTableModel,
  getRequestTableModel,
  getBalanceRowActions,
  getMemberRowActions,
  getSelfRequestRowActions,
  getTeamRequestRowActions,
};
