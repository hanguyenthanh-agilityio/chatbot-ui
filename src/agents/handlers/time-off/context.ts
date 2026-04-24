import type { MockAuthSession } from "@/lib/auth/session";
import type {
  EmployeeRecord,
  LeaveType,
  RequestStatus,
  TimeOffRequest,
} from "@/lib/db/schema";
import { listEmployeeDirectory } from "@/services/company-system/employees";
import { listTimeOffRequests } from "@/services/company-system/requests";
import { leaveTypeLabel } from "@/utils/leave";
import {
  formatDateRange,
  getTodayIsoDate,
  parseIsoDateToUtcDay,
} from "@/agents/handlers/common/date";

export type BalanceRow = {
  leaveType: Exclude<LeaveType, "unpaid">;
  allowance: number;
  used: number;
  pending: number;
  remaining: number;
};

export type FormattedRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  team: string;
  leaveType: LeaveType;
  leaveTypeLabel: string;
  startDate: string;
  endDate: string;
  days: number;
  status: RequestStatus;
  reason: string;
  note?: string;
  reviewComment?: string;
  label: string;
};

export type RequestMatch = {
  id: string;
  employeeId: string;
  employeeName: string;
  label: string;
  status: RequestStatus;
  startDate: string;
  endDate: string;
};

export type ListRequestInput = {
  status?: RequestStatus | "all" | "upcoming";
  query?: string;
};

export type TimeOffContext = {
  employees: EmployeeRecord[];
  requests: TimeOffRequest[];
};

/**
 * loadContext helper.
 * @returns {Promise<TimeOffContext>}
 */
export async function loadContext(): Promise<TimeOffContext> {
  const [employees, requests] = await Promise.all([
    listEmployeeDirectory(),
    listTimeOffRequests(),
  ]);
  return { employees, requests };
}

/**
 * normalizeValue helper.
 * @param {string} value
 * @returns {string}
 */
export function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Gets employee by id.
 * @param {EmployeeRecord[]} employees
 * @param {string} employeeId
 * @returns {EmployeeRecord | undefined}
 */
export function getEmployeeById(
  employees: EmployeeRecord[],
  employeeId: string,
): EmployeeRecord | undefined {
  return employees.find((e) => e.employeeId === employeeId);
}

/**
 * Gets employee or throw.
 * @param {EmployeeRecord[]} employees
 * @param {string} employeeId
 * @returns {EmployeeRecord}
 */
export function getEmployeeOrThrow(
  employees: EmployeeRecord[],
  employeeId: string,
): EmployeeRecord {
  const employee = getEmployeeById(employees, employeeId);
  if (!employee) {
    throw new Error(`Employee ${employeeId} is not configured in company system.`);
  }
  return employee;
}

/**
 * Gets employee summary.
 * @param {MockAuthSession} session
 */
export function getEmployeeSummary(session: MockAuthSession) {
  return {
    employeeId: session.employeeId,
    name: session.name,
    email: session.email,
    avatar: session.avatar,
    team: session.team,
    manager: session.manager,
    timeZone: session.timeZone,
    role: session.role,
    managedEmployeeIds: session.managedEmployeeIds,
    managedEmployees: session.managedEmployees.map((e) => ({
      employeeId: e.employeeId,
      name: e.name,
      avatar: e.avatar,
      team: e.team,
    })),
  };
}

/**
 * formatRequest helper.
 * @param {EmployeeRecord[]} employees
 * @param {TimeOffRequest} request
 * @returns {FormattedRequest}
 */
export function formatRequest(
  employees: EmployeeRecord[],
  request: TimeOffRequest,
): FormattedRequest {
  const employee = getEmployeeOrThrow(employees, request.employeeId);
  const label = leaveTypeLabel(request.leaveType);

  return {
    id: request.id,
    employeeId: employee.employeeId,
    employeeName: employee.name,
    employeeAvatar: employee.avatar,
    team: employee.team,
    leaveType: request.leaveType,
    leaveTypeLabel: label,
    startDate: request.startDate,
    endDate: request.endDate,
    days: request.days,
    status: request.status,
    reason: request.reason,
    note: request.note,
    reviewComment: request.reviewComment,
    label: `${employee.name} · ${label} · ${formatDateRange(request.startDate, request.endDate)} · ${request.days} day${request.days > 1 ? "s" : ""} · ${request.status}`,
  };
}

/**
 * Converts value to request match.
 * @param {EmployeeRecord[]} employees
 * @param {TimeOffRequest} request
 * @returns {RequestMatch}
 */
export function toRequestMatch(
  employees: EmployeeRecord[],
  request: TimeOffRequest,
): RequestMatch {
  const formatted = formatRequest(employees, request);
  return {
    id: formatted.id,
    employeeId: formatted.employeeId,
    employeeName: formatted.employeeName,
    label: formatted.label,
    status: formatted.status,
    startDate: formatted.startDate,
    endDate: formatted.endDate,
  };
}

/**
 * Gets requests for employee.
 * @param {TimeOffRequest[]} requests
 * @param {string} employeeId
 */
export function getRequestsForEmployee(requests: TimeOffRequest[], employeeId: string) {
  return requests.filter((r) => r.employeeId === employeeId);
}

/**
 * Gets open requests for employee.
 * @param {TimeOffRequest[]} requests
 * @param {string} employeeId
 */
export function getOpenRequestsForEmployee(
  requests: TimeOffRequest[],
  employeeId: string,
) {
  return getRequestsForEmployee(requests, employeeId).filter(
    (r) => r.status !== "cancelled" && r.status !== "rejected",
  );
}

/**
 * Gets team requests for manager.
 * @param {TimeOffRequest[]} requests
 * @param {MockAuthSession} session
 */
export function getTeamRequestsForManager(
  requests: TimeOffRequest[],
  session: MockAuthSession,
) {
  const managedIdSet = new Set(session.managedEmployeeIds);
  return requests.filter((r) => managedIdSet.has(r.employeeId));
}

/**
 * compareByStartDate helper.
 * @param {TimeOffRequest} left
 * @param {TimeOffRequest} right
 * @returns {number}
 */
export function compareByStartDate(
  left: TimeOffRequest,
  right: TimeOffRequest,
): number {
  return left.startDate.localeCompare(right.startDate);
}

/**
 * overlaps helper.
 * @param {TimeOffRequest} a
 * @param {number} startDay
 * @param {number} endDay
 * @returns {boolean}
 */
export function overlaps(
  a: TimeOffRequest,
  startDay: number,
  endDay: number,
): boolean {
  const requestStartDay = parseIsoDateToUtcDay(a.startDate);
  const requestEndDay = parseIsoDateToUtcDay(a.endDate);
  return requestStartDay <= endDay && startDay <= requestEndDay;
}

/**
 * filterRequestsByQuery helper.
 * @param {EmployeeRecord[]} employees
 * @param {TimeOffRequest[]} requests
 * @param {string} query
 */
export function filterRequestsByQuery(
  employees: EmployeeRecord[],
  requests: TimeOffRequest[],
  query?: string,
) {
  const normalizedQuery = query?.trim() ? normalizeValue(query) : null;
  if (!normalizedQuery) return requests;

  const STOP_WORDS = new Set(["to", "from", "a", "an", "the", "and", "or", "on", "at", "in"]);
  const tokens = normalizedQuery
    .split(/\s+/)
    .filter((t) => Boolean(t) && !STOP_WORDS.has(t));

  if (tokens.length === 0) return requests;

  return requests.filter((request) => {
    const employee = getEmployeeOrThrow(employees, request.employeeId);
    const haystacks = [
      request.id,
      request.leaveType,
      leaveTypeLabel(request.leaveType),
      request.status,
      request.reason,
      request.note ?? "",
      request.reviewComment ?? "",
      request.startDate,
      request.endDate,
      employee.name,
      employee.email,
      employee.team,
      formatDateRange(request.startDate, request.endDate),
    ].map(normalizeValue);

    // Every token must appear in at least one haystack field, supporting
    // multi-field queries like "Mia Nguyen Annual 2026-05-12 2026-05-13".
    return tokens.every((token) => haystacks.some((v) => v.includes(token)));
  });
}

/**
 * findOwnRequestsMatchingQuery helper.
 * @param {TimeOffContext} ctx
 * @param {MockAuthSession} session
 * @param {string} query
 * @returns {TimeOffRequest[]}
 */
export function findOwnRequestsMatchingQuery(
  ctx: TimeOffContext,
  session: MockAuthSession,
  query: string,
): TimeOffRequest[] {
  const normalizedQuery = normalizeValue(query);
  const todayDay = parseIsoDateToUtcDay(getTodayIsoDate(session.timeZone));
  const cancellableRequests = getOpenRequestsForEmployee(
    ctx.requests,
    session.employeeId,
  ).filter((r) => {
    const startDay = parseIsoDateToUtcDay(r.startDate);
    return r.status === "pending" || startDay >= todayDay;
  });

  if (normalizedQuery.includes("latest") || normalizedQuery.includes("last")) {
    const pendingRequests = cancellableRequests
      .filter((r) => r.status === "pending")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (pendingRequests.length > 0) return [pendingRequests[0]];

    const recent = [...cancellableRequests].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return recent.length > 0 ? [recent[0]] : [];
  }

  return filterRequestsByQuery(ctx.employees, cancellableRequests, query);
}

/**
 * findTeamRequestsMatchingQuery helper.
 * @param {TimeOffContext} ctx
 * @param {MockAuthSession} session
 * @param {string} query
 * @returns {TimeOffRequest[]}
 */
export function findTeamRequestsMatchingQuery(
  ctx: TimeOffContext,
  session: MockAuthSession,
  query: string,
  allowedStatuses: RequestStatus[] = ["pending"],
): TimeOffRequest[] {
  const normalizedQuery = normalizeValue(query);
  const allowedSet = new Set(allowedStatuses);
  const teamRequests = getTeamRequestsForManager(ctx.requests, session).filter(
    (r) => allowedSet.has(r.status),
  );

  if (normalizedQuery.includes("latest") || normalizedQuery.includes("last")) {
    const recent = [...teamRequests].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return recent.length > 0 ? [recent[0]] : [];
  }

  return filterRequestsByQuery(ctx.employees, teamRequests, query);
}

/**
 * applyReview helper.
 * @param {TimeOffRequest[]} requests
 * @param {string} requestId
 * @param {"approved" | "rejected"} nextStatus
 * @param {string} reviewComment
 */
export function applyReview(
  requests: TimeOffRequest[],
  requestId: string,
  nextStatus: "approved" | "rejected",
  reviewComment?: string,
) {
  let updatedRequest: TimeOffRequest | null = null;

  const nextRequests = requests.map((r) => {
    if (r.id !== requestId) return r;
    updatedRequest = {
      ...r,
      status: nextStatus,
      reviewComment: reviewComment?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    return updatedRequest;
  });

  return { nextRequests, updatedRequest };
}

/**
 * nextRequestId helper.
 * @param {TimeOffRequest[]} requests
 * @returns {string}
 */
export function nextRequestId(requests: TimeOffRequest[]): string {
  const numericIds = requests
    .map((r) => Number(r.id.replace(/[^\d]/g, "")))
    .filter((v) => Number.isFinite(v));
  const nextValue = (numericIds.length > 0 ? Math.max(...numericIds) : 3000) + 1;
  return `REQ-${nextValue}`;
}
