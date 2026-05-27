import { cleanup, render } from "@testing-library/react";
import type { UIMessage } from "ai";
import { afterEach, describe, expect, it } from "vitest";

// Components
import { ToolOutputTable } from "@/components/chat/tool-output-table";
import { getToolOutputTables } from "@/components/transcript/tool-output";
import {
  employeeRequestsTableTitle,
  TOOL_OUTPUT_TABLE_TITLES,
} from "@/components/transcript/tool";

// Mocks
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

// Agents
import { MANAGER_TOOL_NAME } from "@/agents/manager/tools/common/definitions";
import { EMPLOYEE_TOOL_NAME } from "@/agents/employee/tools/common/definitions";

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
        createToolPart(EMPLOYEE_TOOL_NAME.LIST_MY_TIME_OFF_REQUESTS, {
          requests: [FIXTURE_REQUEST],
        }),
      ),
    ).toEqual([TOOL_OUTPUT_TABLE_TITLES.myTimeOffRequests]);
    expect(
      titles(
        createToolPart(MANAGER_TOOL_NAME.LIST_EMPLOYEES, {
          employees: [FIXTURE_MEMBER],
        }),
      ),
    ).toEqual([TOOL_OUTPUT_TABLE_TITLES.projectMembers]);
    expect(
      titles(
        createToolPart(MANAGER_TOOL_NAME.LIST_TEAM_TIME_OFF_REQUESTS, {
          requests: [teamRequestWith()],
        }),
      ),
    ).toEqual([TOOL_OUTPUT_TABLE_TITLES.teamTimeOffRequests]);
    expect(
      titles(createToolPart(EMPLOYEE_TOOL_NAME.LIST_MY_TIME_OFF_REQUESTS, {})),
    ).toEqual([]);
  });

  it("handles guards, bundles, review flow, and dynamic output", () => {
    expect(
      titles({ type: "text", text: "x" } as UIMessage["parts"][number]),
    ).toEqual([]);
    expect(
      titles(
        createToolPart(
          EMPLOYEE_TOOL_NAME.GET_MY_TIME_OFF_BALANCE,
          {},
          { preliminary: true },
        ),
      ),
    ).toEqual([]);
    expect(titles(createToolPart(MANAGER_TOOL_NAME.LIST_EMPLOYEES))).toEqual(
      [],
    );
    expect(
      titles(createToolPart(EMPLOYEE_TOOL_NAME.SUBMIT_MY_TIME_OFF_REQUEST, {})),
    ).toEqual([]);

    expect(
      titles(
        createToolPart(EMPLOYEE_TOOL_NAME.GET_MY_TIME_OFF_BALANCE, {
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
        createToolPart(EMPLOYEE_TOOL_NAME.SUBMIT_MY_TIME_OFF_REQUEST, {
          balance: {
            balances: [FIXTURE_BALANCE],
            upcomingRequests: [FIXTURE_REQUEST],
          },
        }),
      )[0],
    ).toBe(TOOL_OUTPUT_TABLE_TITLES.updatedLeaveBalance);

    expect(
      titles(
        createToolPart(EMPLOYEE_TOOL_NAME.CANCEL_MY_TIME_OFF_REQUEST, {
          cancelledRequests: { requests: [FIXTURE_REQUEST_CANCELLED] },
        }),
      )[0],
    ).toBe(TOOL_OUTPUT_TABLE_TITLES.cancelledRequests);

    expect(
      titles(
        createToolPart(MANAGER_TOOL_NAME.APPROVE_TEAM_TIME_OFF_REQUEST, {
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
        createToolPart(MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST, {
          teamRequests: { requests: [teamRequestWith()] },
        }),
      )[0],
    ).toBe(TOOL_OUTPUT_TABLE_TITLES.teamTimeOffRequests);

    expect(
      getToolOutputTables(
        createToolPart("custom_tool", { items: [{ label: "A", score: 1 }] }),
      )[0]?.columns.map((column) => column.key),
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
        createToolPart(MANAGER_TOOL_NAME.APPROVE_TEAM_TIME_OFF_REQUEST, {
          pendingTeamRequests: { requests: [teamRequestWith()] },
        }),
      ),
    ).toEqual([TOOL_OUTPUT_TABLE_TITLES.pendingTeamRequests]);
  });

  describe("approve/reject team request fallbacks", () => {
    it("falls back to dynamicTables when review bundles yield no tables", () => {
      expect(
        titles(
          createToolPart(MANAGER_TOOL_NAME.APPROVE_TEAM_TIME_OFF_REQUEST, {
            reviewedEmployeeRequests: { query: FIXTURE_REVIEW_QUERY },
            pendingTeamRequests: {},
          }),
        ),
      ).toEqual([]);

      const [dynamicTable] = getToolOutputTables(
        createToolPart(MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST, {
          reviewedEmployeeRequests: { query: FIXTURE_REVIEW_QUERY },
          pendingTeamRequests: {},
          items: [{ label: "A", score: 1 }],
        }),
      );
      expect(dynamicTable?.columns.map((column) => column.key)).toEqual(
        expect.arrayContaining(["label", "score"]),
      );
    });

    it("returns dynamicTables when teamRequests is missing", () => {
      expect(
        titles(
          createToolPart(MANAGER_TOOL_NAME.APPROVE_TEAM_TIME_OFF_REQUEST, {}),
        ),
      ).toEqual([]);
      expect(
        titles(
          createToolPart(MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST, {}),
        ),
      ).toEqual([]);

      const [dynamicTable] = getToolOutputTables(
        createToolPart(MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST, {
          items: [{ label: "B", score: 2 }],
        }),
      );
      expect(dynamicTable?.columns.map((column) => column.key)).toEqual(
        expect.arrayContaining(["label", "score"]),
      );
    });

    it("falls back to dynamicTables when teamRequests cannot build a table", () => {
      expect(
        titles(
          createToolPart(MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST, {
            teamRequests: { query: FIXTURE_REVIEW_QUERY },
          }),
        ),
      ).toEqual([]);

      const [dynamicTable] = getToolOutputTables(
        createToolPart(MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST, {
          teamRequests: { query: FIXTURE_REVIEW_QUERY },
          items: [{ label: "C", score: 3 }],
        }),
      );
      expect(dynamicTable?.columns.map((column) => column.key)).toEqual(
        expect.arrayContaining(["label", "score"]),
      );
    });
  });
});
