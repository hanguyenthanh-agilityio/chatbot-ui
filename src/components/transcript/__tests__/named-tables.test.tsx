import { describe, expect, it } from "vitest";

// Components
import {
  buildMembersTableModel,
  getBalanceTableModel,
  getRequestTableModel,
} from "@/components/transcript/named-tables";
import {
  getBalanceRowActions,
  getSelfRequestRowActions,
} from "@/components/transcript/cells";

// Mocks
import {
  FIXTURE_BALANCE_ANNUAL,
  FIXTURE_MEMBER_ROW,
  FIXTURE_REQUEST_ANNUAL,
} from "@/mocks/time-off-fixtures";

describe("transcript/named-tables", () => {
  it("builds members table with row actions", () => {
    const model = buildMembersTableModel({
      id: "team-members",
      title: "Team members",
      memberRows: [FIXTURE_MEMBER_ROW],
      emptyLabel: "No team members found.",
    });

    expect(model?.columns).toHaveLength(5);
    expect(model?.rowActions?.[0]?.[0]?.label).toBe("View pending");
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
      payload: {
        requests: [
          {
            employeeName: "Mia Nguyen",
            leaveType: "sick",
            startDate: "2026-07-01",
            endDate: "2026-07-01",
            days: 1,
            status: "approved",
          },
        ],
      },
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
      title: "My leave balance",
      payload: { balances: [FIXTURE_BALANCE_ANNUAL] },
      getRowActions: getBalanceRowActions,
      emptyLabel: "No balance data found.",
    });

    expect(model?.rows).toHaveLength(1);
    expect(model?.rowActions?.[0]?.[0]?.prompt).toContain("annual");
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
