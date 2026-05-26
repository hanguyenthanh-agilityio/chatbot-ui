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
  ROW_ACTION_FALLBACKS,
  ROW_ACTION_LABELS,
} from "@/components/transcript/cells";
import { compactLeaveTypeLabel } from "@/components/transcript/utils";

// Mocks
import {
  FIXTURE_BALANCE_ANNUAL,
  FIXTURE_MEMBER_ROW,
  FIXTURE_REQUEST_FUTURE,
  FIXTURE_REQUEST_SICK,
  FIXTURE_TEAM,
} from "@/mocks/time-off-fixtures";

describe("transcript/cells", () => {
  afterEach(() => cleanup());

  it.each([
    [
      "leave-type",
      () =>
        renderLeaveTypeChip(
          compactLeaveTypeLabel(FIXTURE_REQUEST_FUTURE.leaveTypeLabel),
        ),
    ],
    ["status-approved", () => renderStatusChip(FIXTURE_REQUEST_SICK.status)],
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
      compactLeaveTypeLabel(FIXTURE_REQUEST_FUTURE.leaveTypeLabel),
    );
    expect(buildTeamActionPrompt(FIXTURE_REQUEST_FUTURE, "approve")).toContain(
      FIXTURE_REQUEST_FUTURE.employeeName,
    );
    expect(
      getSelfRequestRowActions({
        ...FIXTURE_REQUEST_FUTURE,
        status: "approved",
      })[0]?.label,
    ).toBe(ROW_ACTION_LABELS.cancelRequest);
    expect(
      getTeamRequestRowActions({
        ...FIXTURE_REQUEST_FUTURE,
        status: "pending",
      }).map((action) => action.label),
    ).toEqual([ROW_ACTION_LABELS.approve, ROW_ACTION_LABELS.reject]);
    expect(
      getBalanceRowActions({ leaveType: FIXTURE_BALANCE_ANNUAL.leaveType })[0]
        ?.label,
    ).toBe(ROW_ACTION_LABELS.requestThisType);
    expect(
      getMemberRowActions(FIXTURE_MEMBER_ROW).map((action) => action.label),
    ).toEqual([ROW_ACTION_LABELS.viewPending, ROW_ACTION_LABELS.viewAll]);
    expect(
      getRequestRowActionBuilder("list_team_time_off_requests")({
        ...FIXTURE_REQUEST_FUTURE,
        status: "pending",
      }).map((action) => action.label),
    ).toEqual([ROW_ACTION_LABELS.approve, ROW_ACTION_LABELS.reject]);
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
        startDate: FIXTURE_REQUEST_FUTURE.startDate,
      })[0]?.prompt,
    ).toBe(ROW_ACTION_FALLBACKS.selfCancelList);

    const pendingFallback = getTeamRequestRowActions({
      status: "pending",
      startDate: FIXTURE_REQUEST_FUTURE.startDate,
    });
    expect(pendingFallback[0]?.prompt).toBe(
      ROW_ACTION_FALLBACKS.teamApprovePending,
    );
    expect(pendingFallback[1]?.prompt).toBe(
      ROW_ACTION_FALLBACKS.teamRejectPending,
    );

    expect(
      getTeamRequestRowActions({
        ...FIXTURE_REQUEST_FUTURE,
        status: "approved",
      })[0]?.label,
    ).toBe(ROW_ACTION_LABELS.reject);
    expect(
      getTeamRequestRowActions({ status: "approved", startDate: "2020-01-01" }),
    ).toEqual([]);
    expect(
      getTeamRequestRowActions({
        status: "rejected",
        startDate: FIXTURE_REQUEST_FUTURE.startDate,
      })[0]?.prompt,
    ).toBe(ROW_ACTION_FALLBACKS.teamApproveRejected);
    expect(
      getTeamRequestRowActions({
        status: "cancelled",
        startDate: FIXTURE_REQUEST_FUTURE.startDate,
      }),
    ).toEqual([]);

    expect(getBalanceRowActions({})).toEqual([]);
    expect(getMemberRowActions({})).toEqual([]);

    const fallback = getRequestRowActionBuilder(null);
    expect(
      fallback({
        status: "approved",
        leaveTypeLabel: FIXTURE_REQUEST_FUTURE.leaveTypeLabel,
        startDate: FIXTURE_REQUEST_FUTURE.startDate,
        endDate: FIXTURE_REQUEST_FUTURE.endDate,
      })[0]?.label,
    ).toBe(ROW_ACTION_LABELS.cancelRequest);
    expect(
      fallback({ ...FIXTURE_REQUEST_FUTURE, status: "pending" }).map(
        (action) => action.label,
      ),
    ).toEqual([ROW_ACTION_LABELS.approve, ROW_ACTION_LABELS.reject]);
    expect(getRequestRowActionBuilder("cancel_my_time_off_request")).toBe(
      getSelfRequestRowActions,
    );
  });
});
