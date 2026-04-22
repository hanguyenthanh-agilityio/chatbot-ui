import type { MockAuthSession } from "@/lib/auth/session";
import {
  listEmployeeDirectory,
  listTimeOffRequests,
  replaceTimeOffRequests,
} from "@/lib/db/store";
import type {
  EmployeeRecord,
  LeaveType,
  RequestStatus,
  TimeOffRequest,
} from "@/lib/db/schema";
import { leaveTypeLabel } from "@/utils/leave-type";

type BalanceRow = {
  leaveType: Exclude<LeaveType, "unpaid">;
  allowance: number;
  used: number;
  pending: number;
  remaining: number;
};

type FormattedRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
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

type RequestMatch = {
  id: string;
  employeeId: string;
  employeeName: string;
  label: string;
  status: RequestStatus;
  startDate: string;
  endDate: string;
};

type ListRequestInput = {
  status?: RequestStatus | "all";
  query?: string;
};

type ServiceContext = {
  employees: EmployeeRecord[];
  requests: TimeOffRequest[];
};

async function loadContext(): Promise<ServiceContext> {
  const [employees, requests] = await Promise.all([
    listEmployeeDirectory(),
    listTimeOffRequests(),
  ]);
  return { employees, requests };
}

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function getEmployeeById(
  employees: EmployeeRecord[],
  employeeId: string,
): EmployeeRecord | undefined {
  return employees.find((e) => e.employeeId === employeeId);
}

function getEmployeeOrThrow(
  employees: EmployeeRecord[],
  employeeId: string,
): EmployeeRecord {
  const employee = getEmployeeById(employees, employeeId);
  if (!employee) {
    throw new Error(`Employee ${employeeId} is not configured in manager DB.`);
  }
  return employee;
}

function getTodayIsoDate(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isIsoDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseIsoDateToUtcDay(value: string): number {
  if (!isIsoDateOnly(value)) return Number.NaN;

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return Number.NaN;
  }

  const utcMs = Date.UTC(year, month - 1, day);
  const utcDate = new Date(utcMs);

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return Number.NaN;
  }

  return Math.floor(utcMs / 86_400_000);
}

function parseRelativeDateToUtcDay(value: string, timeZone: string): number {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
  const todayDay = parseIsoDateToUtcDay(getTodayIsoDate(timeZone));

  if (!Number.isFinite(todayDay)) return Number.NaN;
  if (normalized === "today") return todayDay;
  if (normalized === "tomorrow") return todayDay + 1;
  if (normalized === "day after tomorrow") return todayDay + 2;

  const inDaysMatch = normalized.match(/^in\s+(\d+)\s+days?$/);
  if (inDaysMatch) return todayDay + Number(inDaysMatch[1]);

  const weekdayMap: Record<string, number> = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2, tues: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4, thurs: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
  };

  const currentWeekday = new Date(todayDay * 86_400_000).getUTCDay();
  const relativeWeekdayMatch = normalized.match(/^(next|this)\s+([a-z]+)$/);
  if (relativeWeekdayMatch) {
    const mode = relativeWeekdayMatch[1];
    const targetWeekday = weekdayMap[relativeWeekdayMatch[2]];
    if (typeof targetWeekday !== "number") return Number.NaN;

    let delta = (targetWeekday - currentWeekday + 7) % 7;
    if (mode === "next" || (mode === "this" && delta === 0)) {
      if (delta === 0) delta = 7;
    }
    return todayDay + delta;
  }

  const directWeekday = weekdayMap[normalized];
  if (typeof directWeekday === "number") {
    let delta = (directWeekday - currentWeekday + 7) % 7;
    if (delta === 0) delta = 7;
    return todayDay + delta;
  }

  return Number.NaN;
}

function parseDateInputToUtcDay(value: string, timeZone: string): number {
  const trimmed = value.trim();
  const absoluteDay = parseIsoDateToUtcDay(trimmed);
  if (Number.isFinite(absoluteDay)) return absoluteDay;
  return parseRelativeDateToUtcDay(trimmed, timeZone);
}

function utcDayToIsoDate(day: number): string {
  return new Date(day * 86_400_000).toISOString().slice(0, 10);
}

function countBusinessDays(fromDay: number, toDay: number): number {
  let total = 0;
  for (let day = fromDay; day <= toDay; day += 1) {
    const weekday = new Date(day * 86_400_000).getUTCDay();
    if (weekday !== 0 && weekday !== 6) total += 1;
  }
  return total;
}

function formatDateRange(startDate: string, endDate: string): string {
  return startDate === endDate ? startDate : `${startDate} to ${endDate}`;
}

function formatRequest(
  employees: EmployeeRecord[],
  request: TimeOffRequest,
): FormattedRequest {
  const employee = getEmployeeOrThrow(employees, request.employeeId);
  const label = leaveTypeLabel(request.leaveType);

  return {
    id: request.id,
    employeeId: employee.employeeId,
    employeeName: employee.name,
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

function toRequestMatch(
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

function getRequestsForEmployee(requests: TimeOffRequest[], employeeId: string) {
  return requests.filter((r) => r.employeeId === employeeId);
}

function getOpenRequestsForEmployee(
  requests: TimeOffRequest[],
  employeeId: string,
) {
  return getRequestsForEmployee(requests, employeeId).filter(
    (r) => r.status !== "cancelled" && r.status !== "rejected",
  );
}

function getTeamRequestsForManager(
  requests: TimeOffRequest[],
  session: MockAuthSession,
) {
  const managedIdSet = new Set(session.managedEmployeeIds);
  return requests.filter((r) => managedIdSet.has(r.employeeId));
}

function compareByStartDate(left: TimeOffRequest, right: TimeOffRequest): number {
  return left.startDate.localeCompare(right.startDate);
}

function overlaps(a: TimeOffRequest, startDay: number, endDay: number): boolean {
  const requestStartDay = parseIsoDateToUtcDay(a.startDate);
  const requestEndDay = parseIsoDateToUtcDay(a.endDate);
  return requestStartDay <= endDay && startDay <= requestEndDay;
}

function buildBalanceRows(
  employee: EmployeeRecord,
  requests: TimeOffRequest[],
): BalanceRow[] {
  const rows: BalanceRow[] = [
    { leaveType: "annual", allowance: employee.entitlements.annual, used: 0, pending: 0, remaining: employee.entitlements.annual },
    { leaveType: "sick", allowance: employee.entitlements.sick, used: 0, pending: 0, remaining: employee.entitlements.sick },
    { leaveType: "personal", allowance: employee.entitlements.personal, used: 0, pending: 0, remaining: employee.entitlements.personal },
  ];

  const rowByType = new Map(rows.map((r) => [r.leaveType, r]));

  for (const request of getRequestsForEmployee(requests, employee.employeeId)) {
    if (request.leaveType === "unpaid") continue;
    const row = rowByType.get(request.leaveType);
    if (!row) continue;

    if (request.status === "approved") {
      row.used += request.days;
      row.remaining = Math.max(row.allowance - row.used, 0);
    } else if (request.status === "pending") {
      row.pending += request.days;
    }
  }

  return rows;
}

function nextRequestId(requests: TimeOffRequest[]): string {
  const numericIds = requests
    .map((r) => Number(r.id.replace(/[^\d]/g, "")))
    .filter((v) => Number.isFinite(v));
  const nextValue = (numericIds.length > 0 ? Math.max(...numericIds) : 3000) + 1;
  return `REQ-${nextValue}`;
}

function filterRequestsByQuery(
  employees: EmployeeRecord[],
  requests: TimeOffRequest[],
  query?: string,
) {
  const normalizedQuery = query?.trim() ? normalizeValue(query) : null;
  if (!normalizedQuery) return requests;

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

    return haystacks.some((v) => v.includes(normalizedQuery));
  });
}

function findOwnRequestsMatchingQuery(
  ctx: ServiceContext,
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

function findTeamRequestsMatchingQuery(
  ctx: ServiceContext,
  session: MockAuthSession,
  query: string,
): TimeOffRequest[] {
  const normalizedQuery = normalizeValue(query);
  const teamRequests = getTeamRequestsForManager(ctx.requests, session).filter(
    (r) => r.status === "pending",
  );

  if (normalizedQuery.includes("latest") || normalizedQuery.includes("last")) {
    const recent = [...teamRequests].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return recent.length > 0 ? [recent[0]] : [];
  }

  return filterRequestsByQuery(ctx.employees, teamRequests, query);
}

function applyReview(
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

function buildMyTimeOffBalancePayload(
  session: MockAuthSession,
  ctx: ServiceContext,
) {
  const employee = getEmployeeOrThrow(ctx.employees, session.employeeId);
  const balances = buildBalanceRows(employee, ctx.requests);
  const upcomingRequests = getOpenRequestsForEmployee(ctx.requests, employee.employeeId)
    .filter((r) => r.startDate >= getTodayIsoDate(employee.timeZone))
    .sort(compareByStartDate)
    .slice(0, 3)
    .map((r) => formatRequest(ctx.employees, r));

  return {
    ok: true,
    employee: getEmployeeSummary(session),
    today: getTodayIsoDate(employee.timeZone),
    balances,
    upcomingRequests,
    policy: {
      annual: "Vacation or PTO should use annual leave.",
      sick: "Sick leave can be used for illness or doctor visits.",
      personal: "Personal leave is best for short personal appointments.",
      unpaid: "Unpaid leave stays available when paid balances are not enough.",
    },
  };
}

function buildMyTimeOffRequestsPayload(
  session: MockAuthSession,
  ctx: ServiceContext,
  input: ListRequestInput | undefined,
) {
  const status = input?.status ?? "all";
  const filteredRequests = filterRequestsByQuery(
    ctx.employees,
    getRequestsForEmployee(ctx.requests, session.employeeId),
    input?.query,
  )
    .filter((r) => (status === "all" ? true : r.status === status))
    .sort(compareByStartDate)
    .map((r) => formatRequest(ctx.employees, r));

  return {
    ok: true,
    scope: "self",
    status,
    query: input?.query?.trim() || null,
    total: filteredRequests.length,
    requests: filteredRequests,
  };
}

function buildTeamTimeOffRequestsPayload(
  session: MockAuthSession,
  ctx: ServiceContext,
  input: { status?: RequestStatus | "all"; employeeQuery?: string } | undefined,
) {
  if (session.role !== "manager") {
    return {
      ok: false,
      code: "MANAGER_ONLY",
      message: "Team request management is only available in Manager view.",
    };
  }

  const status = input?.status ?? "all";
  const filteredRequests = filterRequestsByQuery(
    ctx.employees,
    getTeamRequestsForManager(ctx.requests, session),
    input?.employeeQuery,
  )
    .filter((r) => (status === "all" ? true : r.status === status))
    .sort(compareByStartDate)
    .map((r) => formatRequest(ctx.employees, r));

  return {
    ok: true,
    scope: "team",
    manager: getEmployeeSummary(session),
    status,
    query: input?.employeeQuery?.trim() || null,
    total: filteredRequests.length,
    requests: filteredRequests,
  };
}

async function reviewTeamTimeOffRequest(
  session: MockAuthSession,
  ctx: ServiceContext,
  input: {
    requestQuery: string;
    comment?: string;
    nextStatus: "approved" | "rejected";
  },
) {
  const query = input.requestQuery.trim();
  if (!query) {
    return {
      ok: false,
      code: "MISSING_QUERY",
      message: `Please tell me which team request you want to ${input.nextStatus}.`,
    };
  }

  if (input.nextStatus === "rejected" && !input.comment?.trim()) {
    return {
      ok: false,
      code: "MISSING_COMMENT",
      message: "Please provide a short reason before rejecting a request.",
    };
  }

  const matches = findTeamRequestsMatchingQuery(ctx, session, query);
  if (matches.length === 0) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "I couldn't find a pending team request that matches that description.",
    };
  }

  if (matches.length > 1) {
    return {
      ok: false,
      code: "AMBIGUOUS_REQUEST",
      message: "I found more than one matching pending team request. Please be more specific.",
      matches: matches.map((r) => toRequestMatch(ctx.employees, r)),
    };
  }

  const { nextRequests, updatedRequest } = applyReview(
    ctx.requests,
    matches[0].id,
    input.nextStatus,
    input.comment,
  );

  await replaceTimeOffRequests(nextRequests);
  const nextCtx = { ...ctx, requests: nextRequests };

  return {
    ok: true,
    request: updatedRequest ? formatRequest(ctx.employees, updatedRequest) : null,
    teamRequests: buildTeamTimeOffRequestsPayload(session, nextCtx, { status: "pending" }),
  };
}

export function getEmployeeSummary(session: MockAuthSession) {
  return {
    employeeId: session.employeeId,
    name: session.name,
    email: session.email,
    team: session.team,
    manager: session.manager,
    timeZone: session.timeZone,
    role: session.role,
    managedEmployeeIds: session.managedEmployeeIds,
    managedEmployees: session.managedEmployees.map((e) => ({
      employeeId: e.employeeId,
      name: e.name,
      team: e.team,
    })),
  };
}

export async function getMyTimeOffBalance(session: MockAuthSession) {
  const ctx = await loadContext();
  return buildMyTimeOffBalancePayload(session, ctx);
}

export async function listMyTimeOffRequests(
  session: MockAuthSession,
  input?: ListRequestInput,
) {
  const ctx = await loadContext();
  return buildMyTimeOffRequestsPayload(session, ctx, input);
}

export async function submitMyTimeOffRequest(
  session: MockAuthSession,
  input: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    note?: string;
  },
) {
  const ctx = await loadContext();
  const employee = getEmployeeOrThrow(ctx.employees, session.employeeId);
  const startDay = parseDateInputToUtcDay(input.startDate, employee.timeZone);
  const endDay = parseDateInputToUtcDay(input.endDate, employee.timeZone);
  const todayDay = parseIsoDateToUtcDay(getTodayIsoDate(employee.timeZone));

  if (!Number.isFinite(startDay) || !Number.isFinite(endDay)) {
    return {
      ok: false,
      code: "INVALID_DATE",
      message:
        "I couldn't resolve the requested dates. Please use exact dates like 2026-05-02 if needed.",
    };
  }

  if (endDay < startDay) {
    return {
      ok: false,
      code: "INVALID_RANGE",
      message: "The end date must be on or after the start date.",
    };
  }

  if (startDay < todayDay) {
    return {
      ok: false,
      code: "PAST_DATE",
      message: `New time-off requests must start on or after ${getTodayIsoDate(employee.timeZone)}.`,
    };
  }

  const businessDays = countBusinessDays(startDay, endDay);
  if (businessDays <= 0) {
    return {
      ok: false,
      code: "NON_WORKING_DAYS",
      message:
        "That range only covers non-working days. Please choose at least one weekday.",
    };
  }

  const resolvedStartDate = utcDayToIsoDate(startDay);
  const resolvedEndDate = utcDayToIsoDate(endDay);

  const overlappingRequests = getOpenRequestsForEmployee(ctx.requests, employee.employeeId)
    .filter((r) => overlaps(r, startDay, endDay))
    .map((r) => toRequestMatch(ctx.employees, r));

  if (overlappingRequests.length > 0) {
    return {
      ok: false,
      code: "OVERLAP",
      message: "This request overlaps with an existing non-cancelled time-off request.",
      conflictingRequests: overlappingRequests,
    };
  }

  if (input.leaveType !== "unpaid") {
    const balance = buildBalanceRows(employee, ctx.requests).find(
      (r) => r.leaveType === input.leaveType,
    );

    if (!balance || balance.remaining < businessDays) {
      return {
        ok: false,
        code: "INSUFFICIENT_BALANCE",
        message: `You only have ${balance?.remaining ?? 0} ${input.leaveType} day${balance?.remaining === 1 ? "" : "s"} remaining.`,
      };
    }
  }

  const now = new Date().toISOString();
  const request: TimeOffRequest = {
    id: nextRequestId(ctx.requests),
    employeeId: employee.employeeId,
    leaveType: input.leaveType,
    startDate: resolvedStartDate,
    endDate: resolvedEndDate,
    days: businessDays,
    status: "pending",
    reason: input.reason.trim(),
    note: input.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const nextRequests = [...ctx.requests, request].sort(compareByStartDate);
  await replaceTimeOffRequests(nextRequests);
  const nextCtx = { ...ctx, requests: nextRequests };

  return {
    ok: true,
    request: formatRequest(ctx.employees, request),
    balance: buildMyTimeOffBalancePayload(session, nextCtx),
  };
}

export async function cancelMyTimeOffRequest(
  session: MockAuthSession,
  input: { requestQuery: string },
) {
  const ctx = await loadContext();
  const query = input.requestQuery.trim();
  if (!query) {
    return {
      ok: false,
      code: "MISSING_QUERY",
      message: "Please tell me which request you want to cancel.",
    };
  }

  const matches = findOwnRequestsMatchingQuery(ctx, session, query);

  if (matches.length === 0) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "I couldn't find a cancellable request that matches that description.",
    };
  }

  if (matches.length > 1) {
    return {
      ok: false,
      code: "AMBIGUOUS_REQUEST",
      message: "I found more than one matching request. Please choose one request more specifically.",
      matches: matches.map((r) => toRequestMatch(ctx.employees, r)),
    };
  }

  const request = matches[0];
  const requestStartDay = parseIsoDateToUtcDay(request.startDate);
  const todayDay = parseIsoDateToUtcDay(getTodayIsoDate(session.timeZone));

  if (request.status === "approved" && requestStartDay < todayDay) {
    return {
      ok: false,
      code: "ALREADY_STARTED",
      message: "That approved request has already started, so it can't be cancelled here.",
    };
  }

  const nextRequests = ctx.requests.map((r) =>
    r.id === request.id
      ? { ...r, status: "cancelled" as const, updatedAt: new Date().toISOString() }
      : r,
  );

  await replaceTimeOffRequests(nextRequests);
  const nextCtx = { ...ctx, requests: nextRequests };
  const cancelledRequest = nextRequests.find((r) => r.id === request.id);

  return {
    ok: true,
    request: cancelledRequest ? formatRequest(ctx.employees, cancelledRequest) : null,
    balance: buildMyTimeOffBalancePayload(session, nextCtx),
  };
}

export async function listTeamTimeOffRequests(
  session: MockAuthSession,
  input?: { status?: RequestStatus | "all"; employeeQuery?: string },
) {
  const ctx = await loadContext();
  return buildTeamTimeOffRequestsPayload(session, ctx, input);
}

export async function approveTeamTimeOffRequest(
  session: MockAuthSession,
  input: { requestQuery: string; comment?: string },
) {
  if (session.role !== "manager") {
    return {
      ok: false,
      code: "MANAGER_ONLY",
      message: "Approving requests is only available in Manager view.",
    };
  }

  const ctx = await loadContext();
  return reviewTeamTimeOffRequest(session, ctx, {
    ...input,
    nextStatus: "approved",
  });
}

export async function rejectTeamTimeOffRequest(
  session: MockAuthSession,
  input: { requestQuery: string; comment: string },
) {
  if (session.role !== "manager") {
    return {
      ok: false,
      code: "MANAGER_ONLY",
      message: "Rejecting requests is only available in Manager view.",
    };
  }

  const ctx = await loadContext();
  return reviewTeamTimeOffRequest(session, ctx, {
    ...input,
    nextStatus: "rejected",
  });
}
