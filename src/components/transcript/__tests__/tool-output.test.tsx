import { cleanup, render } from "@testing-library/react";
import type { UIMessage } from "ai";
import { afterEach, describe, expect, it } from "vitest";

import { ToolOutputTable } from "@/components/chat/tool-output-table";
import { getToolOutputTables } from "@/components/transcript/tool-output";
import {
  createToolPart,
  FIXTURE_BALANCE,
  FIXTURE_MEMBER,
  FIXTURE_REQUEST,
  getTablesFromToolPart,
  mockBalanceToolPart,
  mockTeamMembersToolPart,
} from "@/mocks/transcript-tool-output";

const teamRequest = (overrides: Record<string, unknown> = {}) => ({
  ...FIXTURE_REQUEST,
  employeeName: "Mia Nguyen",
  ...overrides,
});

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
    expect(titles(mockBalanceToolPart())).toEqual(["My leave balance"]);
    expect(titles(mockTeamMembersToolPart())).toEqual(["Team members"]);
    expect(titles(createToolPart("list_my_time_off_requests", { requests: [FIXTURE_REQUEST] }))).toEqual([
      "My time-off requests",
    ]);
    expect(titles(createToolPart("list_employees", { employees: [FIXTURE_MEMBER] }))).toEqual([
      "Project members",
    ]);
    expect(titles(createToolPart("list_team_time_off_requests", { requests: [teamRequest()] }))).toEqual([
      "Team time-off requests",
    ]);
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
    ).toEqual(["My leave balance", "Upcoming requests"]);

    expect(
      titles(
        createToolPart("submit_my_time_off_request", {
          balance: { balances: [FIXTURE_BALANCE], upcomingRequests: [FIXTURE_REQUEST] },
        }),
      )[0],
    ).toBe("Updated leave balance");

    expect(
      titles(
        createToolPart("cancel_my_time_off_request", {
          cancelledRequests: { requests: [{ ...FIXTURE_REQUEST, status: "cancelled" }] },
        }),
      )[0],
    ).toBe("Cancelled requests");

    expect(
      titles(
        createToolPart("approve_team_time_off_request", {
          reviewedEmployeeRequests: {
            query: "Mia",
            requests: [teamRequest({ status: "approved" })],
          },
          pendingTeamRequests: { requests: [teamRequest({ employeeName: "An Pham" })] },
        }),
      ),
    ).toEqual(["Mia's requests", "Pending team requests"]);

    expect(
      titles(
        createToolPart("reject_team_time_off_request", {
          teamRequests: { requests: [teamRequest()] },
        }),
      )[0],
    ).toBe("Team time-off requests");

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
          pendingTeamRequests: { requests: [teamRequest()] },
        }),
      ),
    ).toEqual(["Pending team requests"]);
  });
});
