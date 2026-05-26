import { describe, expect, it } from "vitest";

// Components
import {
  buildMembersTableModel,
  getBalanceTableModel,
  getRequestTableModel,
} from "@/components/transcript/named-tables";
import {
  getBalanceRowActions,
  getMemberRowActions,
  getSelfRequestRowActions,
} from "@/components/transcript/cells";
import { TOOL_OUTPUT_TABLE_TITLES } from "@/components/transcript/tool";

// Mocks
import {
  FIXTURE_BALANCE_ANNUAL,
  FIXTURE_MEMBER_ROW,
  FIXTURE_REQUEST_ANNUAL,
  FIXTURE_TEAM_REQUEST_SICK,
} from "@/mocks/time-off-fixtures";

describe("transcript/named-tables", () => {
  it("builds members table with row actions", () => {
    const model = buildMembersTableModel({
      id: "team-members",
      title: TOOL_OUTPUT_TABLE_TITLES.teamMembers,
      memberRows: [FIXTURE_MEMBER_ROW],
      emptyLabel: "No team members found.",
    });

    expect(model?.columns).toHaveLength(5);
    expect(model?.rowActions?.[0]?.map((action) => action.label)).toEqual(
      getMemberRowActions(FIXTURE_MEMBER_ROW).map((action) => action.label),
    );
  });

  it("builds request table with and without employee column", () => {
    const selfModel = getRequestTableModel({
      id: "my-requests",
      title: "My requests",
      payload: { requests: [FIXTURE_REQUEST_ANNUAL] },
      showEmployee: false,
      getRowActions: getSelfRequestRowActions,
      emptyLabel: "No requests.",
    });

    const teamModel = getRequestTableModel({
      id: "team-requests",
      title: "Team requests",
      payload: { requests: [FIXTURE_TEAM_REQUEST_SICK] },
      showEmployee: true,
      emptyLabel: "No team requests.",
    });

    expect(selfModel?.columns.some((column) => column.key === "employee")).toBe(
      false,
    );
    expect(teamModel?.columns.some((column) => column.key === "employee")).toBe(
      true,
    );
  });

  it("builds balance table with row actions", () => {
    const model = getBalanceTableModel({
      id: "balance",
      title: TOOL_OUTPUT_TABLE_TITLES.myLeaveBalance,
      payload: { balances: [FIXTURE_BALANCE_ANNUAL] },
      getRowActions: getBalanceRowActions,
      emptyLabel: "No balance data found.",
    });

    expect(model?.rows).toHaveLength(1);
    expect(model?.rowActions?.[0]?.[0]?.prompt).toContain(
      FIXTURE_BALANCE_ANNUAL.leaveType,
    );
  });

  it("returns null when payload shape is invalid", () => {
    expect(
      getRequestTableModel({
        id: "x",
        title: "X",
        payload: {},
        showEmployee: false,
        emptyLabel: "Empty",
      }),
    ).toBeNull();

    expect(
      getBalanceTableModel({
        id: "x",
        title: "X",
        payload: {},
        emptyLabel: "Empty",
      }),
    ).toBeNull();
  });
});
