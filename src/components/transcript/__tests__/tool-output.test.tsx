import { cleanup, render } from "@testing-library/react";
import type { UIMessage } from "ai";
import { afterEach, describe, expect, it } from "vitest";

import { ToolOutputTable } from "@/components/chat/tool-output-table";
import { getToolOutputTables } from "@/components/transcript/tool-output";
import {
  employeeRequestsTableTitle,
  TOOL_OUTPUT_TABLE_TITLES,
} from "@/components/transcript/tool";
import {
  createToolPart,
  FIXTURE_BALANCE,
  FIXTURE_MEMBER,
  FIXTURE_REQUEST,
  getTablesFromToolPart,
  mockBalanceToolPart,
  mockTeamMembersToolPart,
} from "@/mocks/transcript-tool-output";
import {
  FIXTURE_EMPLOYEE_AN,
  FIXTURE_REQUEST_CANCELLED,
  FIXTURE_REVIEW_QUERY,
  teamRequestWith,
} from "@/mocks/time-off-fixtures";

const titles = (part: UIMessage["parts"][number]) =>
  getToolOutputTables(part).map((table) => table.title);

describe("transcript/tool-output", () => {
  afterEach(() => cleanup());

  it("snapshot: balance table", () => {
    const [model] = getTablesFromToolPart(mockBalanceToolPart());
    const { container } = render(
      <ToolOutputTable
        title={model!.title}
        columns={model!.columns}
        rows={model!.rows}
        emptyLabel={model!.emptyLabel}
      />,
    );
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("maps tools to tables", () => {
    expect(titles(mockBalanceToolPart())).toEqual([
      TOOL_OUTPUT_TABLE_TITLES.myLeaveBalance,
    ]);
    expect(titles(mockTeamMembersToolPart())).toEqual([
      TOOL_OUTPUT_TABLE_TITLES.teamMembers,
    ]);
    expect(
      titles(
        createToolPart("list_my_time_off_requests", { requests: [FIXTURE_REQUEST] }),
      ),
    ).toEqual([TOOL_OUTPUT_TABLE_TITLES.myTimeOffRequests]);
    expect(
      titles(createToolPart("list_employees", { employees: [FIXTURE_MEMBER] })),
    ).toEqual([TOOL_OUTPUT_TABLE_TITLES.projectMembers]);
    expect(
      titles(
        createToolPart("list_team_time_off_requests", {
          requests: [teamRequestWith()],
        }),
      ),
    ).toEqual([TOOL_OUTPUT_TABLE_TITLES.teamTimeOffRequests]);
    expect(titles(createToolPart("list_my_time_off_requests", {}))).toEqual([]);
  });

  it("handles guards, bundles, review flow, and dynamic output", () => {
    expect(titles({ type: "text", text: "x" } as UIMessage["parts"][number])).toEqual([]);
    expect(titles(createToolPart("get_my_time_off_balance", {}, { preliminary: true }))).toEqual([]);
    expect(titles(createToolPart("list_employees"))).toEqual([]);
    expect(titles(createToolPart("submit_my_time_off_request", {}))).toEqual([]);

    expect(
      titles(
        createToolPart("get_my_time_off_balance", {
          balances: [FIXTURE_BALANCE],
          upcomingRequests: [FIXTURE_REQUEST],
        }),
      ),
    ).toEqual([
      TOOL_OUTPUT_TABLE_TITLES.myLeaveBalance,
      TOOL_OUTPUT_TABLE_TITLES.upcomingRequests,
    ]);

    expect(
      titles(
        createToolPart("submit_my_time_off_request", {
          balance: { balances: [FIXTURE_BALANCE], upcomingRequests: [FIXTURE_REQUEST] },
        }),
      )[0],
    ).toBe(TOOL_OUTPUT_TABLE_TITLES.updatedLeaveBalance);

    expect(
      titles(
        createToolPart("cancel_my_time_off_request", {
          cancelledRequests: { requests: [FIXTURE_REQUEST_CANCELLED] },
        }),
      )[0],
    ).toBe(TOOL_OUTPUT_TABLE_TITLES.cancelledRequests);

    expect(
      titles(
        createToolPart("approve_team_time_off_request", {
          reviewedEmployeeRequests: {
            query: FIXTURE_REVIEW_QUERY,
            requests: [teamRequestWith({ status: "approved" })],
          },
          pendingTeamRequests: {
            requests: [teamRequestWith({ employeeName: FIXTURE_EMPLOYEE_AN })],
          },
        }),
      ),
    ).toEqual([
      employeeRequestsTableTitle(FIXTURE_REVIEW_QUERY),
      TOOL_OUTPUT_TABLE_TITLES.pendingTeamRequests,
    ]);

    expect(
      titles(
        createToolPart("reject_team_time_off_request", {
          teamRequests: { requests: [teamRequestWith()] },
        }),
      )[0],
    ).toBe(TOOL_OUTPUT_TABLE_TITLES.teamTimeOffRequests);

    expect(
      getToolOutputTables(createToolPart("custom_tool", { items: [{ label: "A", score: 1 }] }))[0]
        ?.columns.map((column) => column.key),
    ).toEqual(expect.arrayContaining(["label", "score"]));

    expect(
      getToolOutputTables({
        type: "dynamic-tool",
        toolCallId: "tc-anonymous",
        state: "output-available",
        input: {},
        output: { items: [{ label: "B", score: 2 }] },
      } as UIMessage["parts"][number]),
    ).toHaveLength(1);

    expect(
      titles(
        createToolPart("approve_team_time_off_request", {
          pendingTeamRequests: { requests: [teamRequestWith()] },
        }),
      ),
    ).toEqual([TOOL_OUTPUT_TABLE_TITLES.pendingTeamRequests]);
  });
});
