/** Shared time-off rows for mocks and transcript tests. */

import { LEAVE_TYPE_LABEL_BY_TYPE } from "@/constants/leave";

export const FIXTURE_TEAM = "Flash";
export const FIXTURE_EMPLOYEE_AN = "An Pham";
export const FIXTURE_REVIEW_QUERY = "Mia";

export const FIXTURE_BALANCE_ANNUAL = {
  leaveType: "annual",
  allowance: 14,
  used: 2,
  pending: 1,
  remaining: 11,
};

export const FIXTURE_BALANCE_SICK = {
  leaveType: "sick",
  allowance: 5,
  used: 1,
  pending: 0,
  remaining: 4,
};

export const FIXTURE_BALANCE_PERSONAL = {
  leaveType: "personal",
  allowance: 2,
  used: 0,
  pending: 0,
  remaining: 2,
};

export const FIXTURE_BALANCES = [
  FIXTURE_BALANCE_ANNUAL,
  FIXTURE_BALANCE_SICK,
  FIXTURE_BALANCE_PERSONAL,
];

export const FIXTURE_REQUEST_ANNUAL = {
  leaveType: "annual",
  leaveTypeLabel: LEAVE_TYPE_LABEL_BY_TYPE.annual,
  startDate: "2026-06-10",
  endDate: "2026-06-12",
  days: 3,
  status: "pending",
};

export const FIXTURE_REQUEST_SICK = {
  leaveType: "sick",
  leaveTypeLabel: LEAVE_TYPE_LABEL_BY_TYPE.sick,
  startDate: "2026-05-02",
  endDate: "2026-05-02",
  days: 1,
  status: "approved",
};

export const FIXTURE_REQUESTS = [FIXTURE_REQUEST_ANNUAL, FIXTURE_REQUEST_SICK];

/** Future dates — row actions / cancel flows in tests */
export const FIXTURE_REQUEST_FUTURE = {
  employeeName: "Mia Nguyen",
  leaveType: "annual",
  leaveTypeLabel: LEAVE_TYPE_LABEL_BY_TYPE.annual,
  startDate: "2099-06-10",
  endDate: "2099-06-12",
  days: 3,
  status: "pending",
};

export const FIXTURE_MEMBER_ROW = {
  employeeName: "Mia Nguyen",
  team: FIXTURE_TEAM,
  pendingCount: 1,
  approvedCount: 2,
  cancelledCount: 0,
  totalCount: 3,
};

/** Minimal shapes for tool-output mapping tests */
export const FIXTURE_BALANCE = FIXTURE_BALANCE_ANNUAL;

export const FIXTURE_REQUEST = {
  leaveType: FIXTURE_REQUEST_ANNUAL.leaveType,
  startDate: FIXTURE_REQUEST_FUTURE.startDate,
  endDate: FIXTURE_REQUEST_FUTURE.endDate,
  days: FIXTURE_REQUEST_ANNUAL.days,
  status: FIXTURE_REQUEST_ANNUAL.status,
};

export const FIXTURE_MEMBER = {
  employeeName: FIXTURE_MEMBER_ROW.employeeName,
  pendingCount: 0,
  approvedCount: 1,
  cancelledCount: 0,
  totalCount: 1,
};

export const FIXTURE_TEAM_REQUEST = {
  ...FIXTURE_REQUEST,
  employeeName: FIXTURE_MEMBER_ROW.employeeName,
};

export const FIXTURE_TEAM_REQUEST_SICK = {
  employeeName: FIXTURE_MEMBER_ROW.employeeName,
  leaveType: FIXTURE_REQUEST_SICK.leaveType,
  startDate: "2026-07-01",
  endDate: "2026-07-01",
  days: 1,
  status: FIXTURE_REQUEST_SICK.status,
};

export const FIXTURE_REQUEST_CANCELLED = {
  ...FIXTURE_REQUEST,
  status: "cancelled" as const,
};

export const FIXTURE_GENERIC_TABLE_ROWS = [
  {
    employeeName: FIXTURE_MEMBER_ROW.employeeName,
    team: FIXTURE_TEAM,
    leaveTypeLabel: FIXTURE_REQUEST_ANNUAL.leaveTypeLabel,
    startDate: FIXTURE_REQUEST_ANNUAL.startDate,
    endDate: FIXTURE_REQUEST_ANNUAL.endDate,
    status: FIXTURE_REQUEST_ANNUAL.status,
  },
];

export function teamRequestWith(overrides: Record<string, unknown> = {}) {
  return { ...FIXTURE_TEAM_REQUEST, ...overrides };
}
