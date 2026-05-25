import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

// Components
import {
  buildSelfCancelPrompt,
  buildTeamActionPrompt,
  getBalanceRowActions,
  getMemberRowActions,
  getRequestRowActionBuilder,
  getSelfRequestRowActions,
  getTeamRequestRowActions,
  renderEmployeeCell,
  renderLeaveTypeChip,
  renderStatusChip,
} from "@/components/transcript/cells";

// Mocks
import {
  FIXTURE_REQUEST_FUTURE,
  FIXTURE_TEAM,
} from "@/mocks/time-off-fixtures";

describe("transcript/cells", () => {
  afterEach(() => cleanup());

  it.each([
    ["leave-type", () => renderLeaveTypeChip("Annual")],
    ["status-approved", () => renderStatusChip("approved")],
    ["status-rejected", () => renderStatusChip("rejected")],
    [
      "employee",
      () =>
        renderEmployeeCell({ ...FIXTURE_REQUEST_FUTURE, team: FIXTURE_TEAM }),
    ],
  ] as const)("snapshot: %s", (_name, node) => {
    const { container } = render(node());
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("builds prompts and row actions", () => {
    expect(buildSelfCancelPrompt(FIXTURE_REQUEST_FUTURE)).toContain(
      "cancel my Annual leave",
    );
    expect(buildTeamActionPrompt(FIXTURE_REQUEST_FUTURE, "approve")).toContain(
      "Approve Mia Nguyen",
    );
    expect(
      getSelfRequestRowActions({
        ...FIXTURE_REQUEST_FUTURE,
        status: "approved",
      })[0]?.label,
    ).toBe("Cancel request");
    expect(
      getTeamRequestRowActions({
        ...FIXTURE_REQUEST_FUTURE,
        status: "pending",
      }).map((a) => a.label),
    ).toEqual(["Approve", "Reject"]);
    expect(getBalanceRowActions({ leaveType: "annual" })[0]?.label).toBe(
      "Request this type",
    );
    expect(
      getMemberRowActions({ employeeName: "Mia Nguyen", pendingCount: 1 }).map(
        (a) => a.label,
      ),
    ).toEqual(["View pending", "View all"]);
    expect(
      getRequestRowActionBuilder("list_team_time_off_requests")({
        ...FIXTURE_REQUEST_FUTURE,
        status: "pending",
      }).map((a) => a.label),
    ).toEqual(["Approve", "Reject"]);
  });

  it("covers empty and fallback branches", () => {
    expect(renderStatusChip("")).toBe("—");

    expect(
      getSelfRequestRowActions({ status: "rejected", startDate: "2099-01-01" }),
    ).toEqual([]);
    expect(
      getSelfRequestRowActions({ status: "approved", startDate: "2020-01-01" }),
    ).toEqual([]);
    expect(
      getSelfRequestRowActions({
        status: "pending",
        startDate: "2099-01-01",
      })[0]?.prompt,
    ).toBe(
      "I want to cancel one of my requests. Could you list my cancellable requests so I can choose one?",
    );

    const pendingFallback = getTeamRequestRowActions({
      status: "pending",
      startDate: "2099-01-01",
    });
    expect(pendingFallback[0]?.prompt).toBe(
      "Please approve the selected pending team request.",
    );
    expect(pendingFallback[1]?.prompt).toBe(
      "Please reject the selected pending team request.",
    );

    expect(
      getTeamRequestRowActions({
        ...FIXTURE_REQUEST_FUTURE,
        status: "approved",
      })[0]?.label,
    ).toBe("Reject");
    expect(
      getTeamRequestRowActions({ status: "approved", startDate: "2020-01-01" }),
    ).toEqual([]);
    expect(
      getTeamRequestRowActions({
        status: "rejected",
        startDate: "2099-01-01",
      })[0]?.prompt,
    ).toBe("Please approve the selected rejected team request.");
    expect(
      getTeamRequestRowActions({
        status: "cancelled",
        startDate: "2099-01-01",
      }),
    ).toEqual([]);

    expect(getBalanceRowActions({})).toEqual([]);
    expect(getMemberRowActions({})).toEqual([]);

    const fallback = getRequestRowActionBuilder(null);
    expect(
      fallback({
        status: "approved",
        leaveTypeLabel: "Annual",
        startDate: "2099-01-01",
        endDate: "2099-01-02",
      })[0]?.label,
    ).toBe("Cancel request");
    expect(
      fallback({ ...FIXTURE_REQUEST_FUTURE, status: "pending" }).map(
        (action) => action.label,
      ),
    ).toEqual(["Approve", "Reject"]);
    expect(getRequestRowActionBuilder("cancel_my_time_off_request")).toBe(
      getSelfRequestRowActions,
    );
  });
});
