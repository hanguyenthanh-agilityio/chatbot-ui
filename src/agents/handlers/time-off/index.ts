import type { MockAuthSession } from "@/lib/auth/session";
import type { LeaveType, RequestStatus, TimeOffRequest } from "@/lib/db/schema";
import { replaceTimeOffRequests } from "@/services/company-system/requests";
import {
  buildMyTimeOffBalancePayload,
  buildBalanceRows,
  getMyTimeOffBalance,
} from "./balance";
import {
  applyReview,
  compareByStartDate,
  filterRequestsByQuery,
  findOwnRequestsMatchingQuery,
  findTeamRequestsMatchingQuery,
  formatRequest,
  getEmployeeOrThrow,
  getEmployeeSummary,
  getOpenRequestsForEmployee,
  getRequestsForEmployee,
  getTeamRequestsForManager,
  loadContext,
  nextRequestId,
  overlaps,
  toRequestMatch,
  type ListRequestInput,
  type TimeOffContext,
} from "./context";
import {
  countBusinessDays,
  getTodayIsoDate,
  parseDateInputToUtcDay,
  parseIsoDateToUtcDay,
  utcDayToIsoDate,
} from "@/agents/handlers/common/date";
import { notifyTimeOffApproved } from "@/services/slack";

type TeamRequestListInput = {
  status?: RequestStatus | "all" | "upcoming";
  employeeQuery?: string;
};

type ReviewTeamRequestInput = {
  requestQuery: string;
  comment?: string;
  nextStatus: "approved" | "rejected";
};

type SubmitMyTimeOffRequestInput = {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  note?: string;
};

type RequestQueryInput = {
  requestQuery: string;
};

type OptionalCommentRequestInput = {
  requestQuery: string;
  comment?: string;
};

type RequiredCommentRequestInput = {
  requestQuery: string;
  comment: string;
};

/**
 * Validates manager role.
 * @param {MockAuthSession} session
 */
function requireManagerRole(session: MockAuthSession) {
  if (session.role !== "manager") {
    return {
      ok: false as const,
      code: "MANAGER_ONLY",
      message: "This action is only available in Manager view.",
    };
  }
  return null;
}

/**
 * withRequests helper.
 * @param {TimeOffContext} ctx
 * @param {TimeOffRequest[]} requests
 * @returns {TimeOffContext}
 */
function withRequests(ctx: TimeOffContext, requests: TimeOffRequest[]): TimeOffContext {
  return { ...ctx, requests };
}

function normalizeInlineWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseMutationRequestInput(
  requestQuery: string,
  comment?: string,
) {
  const extractedCommentMatch = requestQuery.match(
    /\b(?:use\s+)?comment\s*:\s*["“]?([^"”\n]+?)["”]?(?=$|[.?!])/i,
  );
  const extractedComment = extractedCommentMatch?.[1]?.trim();

  let normalizedQuery = requestQuery;

  const trailingInstructionPatterns = [
    /\bask for confirmation\b.*$/i,
    /\bplease confirm\b.*$/i,
    /\bbefore running\b.*$/i,
  ];

  for (const pattern of trailingInstructionPatterns) {
    normalizedQuery = normalizedQuery.replace(pattern, "");
  }

  normalizedQuery = normalizedQuery
    .replace(
      /\b(?:use\s+)?comment\s*:\s*["“]?([^"”\n]+?)["”]?(?=$|[.?!])/gi,
      "",
    )
    .replace(
      /^\s*(?:please\s+)?(?:approve|reject)\s+(?:this\s+)?(?:pending\s+)?(?:team\s+)?request\s*:?\s*/i,
      "",
    )
    .replace(/^\s*request\s*:?\s*/i, "");

  const sanitizedQuery = normalizeInlineWhitespace(normalizedQuery);
  const resolvedComment =
    comment?.trim() || (extractedComment ? normalizeInlineWhitespace(extractedComment) : undefined);

  return {
    requestQuery: sanitizedQuery || normalizeInlineWhitespace(requestQuery),
    comment: resolvedComment,
  };
}

/**
 * Builds my time off requests payload.
 * @param {MockAuthSession} session
 * @param {TimeOffContext} ctx
 * @param {ListRequestInput | undefined} input
 */
function buildMyTimeOffRequestsPayload(
  session: MockAuthSession,
  ctx: TimeOffContext,
  input: ListRequestInput | undefined,
) {
  const status = input?.status ?? "all";
  const todayDay = parseIsoDateToUtcDay(getTodayIsoDate(session.timeZone));
  const filteredRequests = filterRequestsByQuery(
    ctx.employees,
    getRequestsForEmployee(ctx.requests, session.employeeId),
    input?.query,
  )
    .filter((request) => {
      if (status === "all") return true;
      if (status === "upcoming") {
        const startDay = parseIsoDateToUtcDay(request.startDate);
        return (
          Number.isFinite(startDay) &&
          startDay >= todayDay &&
          request.status !== "cancelled" &&
          request.status !== "rejected"
        );
      }
      return request.status === status;
    })
    .sort(compareByStartDate)
    .map((request) => formatRequest(ctx.employees, request));

  return {
    ok: true,
    scope: "self",
    status,
    query: input?.query?.trim() || null,
    total: filteredRequests.length,
    requests: filteredRequests,
  };
}

/**
 * Builds team time off requests payload.
 * @param {MockAuthSession} session
 * @param {TimeOffContext} ctx
 * @param {TeamRequestListInput | undefined} input
 */
function buildTeamTimeOffRequestsPayload(
  session: MockAuthSession,
  ctx: TimeOffContext,
  input: TeamRequestListInput | undefined,
) {
  const denied = requireManagerRole(session);
  if (denied) return denied;

  const status = input?.status ?? "all";
  const todayDay = parseIsoDateToUtcDay(getTodayIsoDate(session.timeZone));
  const filteredRequests = filterRequestsByQuery(
    ctx.employees,
    getTeamRequestsForManager(ctx.requests, session),
    input?.employeeQuery,
  )
    .filter((request) => {
      if (status === "all") return true;
      if (status === "upcoming") {
        const startDay = parseIsoDateToUtcDay(request.startDate);
        return (
          Number.isFinite(startDay) &&
          startDay >= todayDay &&
          request.status !== "cancelled" &&
          request.status !== "rejected"
        );
      }
      return request.status === status;
    })
    .sort(compareByStartDate)
    .map((request) => formatRequest(ctx.employees, request));

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

/**
 * reviewTeamTimeOffRequest helper.
 * @param {MockAuthSession} session
 * @param {TimeOffContext} ctx
 * @param {ReviewTeamRequestInput} input
 */
async function reviewTeamTimeOffRequest(
  session: MockAuthSession,
  ctx: TimeOffContext,
  input: ReviewTeamRequestInput,
) {
  const parsedInput = parseMutationRequestInput(input.requestQuery, input.comment);
  const query = parsedInput.requestQuery;
  const comment = parsedInput.comment;

  if (!query) {
    return {
      ok: false,
      code: "MISSING_QUERY",
      message: `Please tell me which team request you want to ${input.nextStatus}.`,
    };
  }

  if (input.nextStatus === "rejected" && !comment) {
    return {
      ok: false,
      code: "MISSING_COMMENT",
      message: "Please provide a short reason before rejecting a request.",
    };
  }

  const allowedStatuses: ("pending" | "approved")[] =
    input.nextStatus === "rejected" ? ["pending", "approved"] : ["pending"];
  const matches = findTeamRequestsMatchingQuery(ctx, session, query, allowedStatuses);
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
      matches: matches.map((request) => toRequestMatch(ctx.employees, request)),
    };
  }

  const { nextRequests, updatedRequest } = applyReview(
    ctx.requests,
    matches[0].id,
    input.nextStatus,
    comment,
  );

  const persistedRequests = await replaceTimeOffRequests(nextRequests);
  const nextCtx = withRequests(ctx, persistedRequests);

  if (input.nextStatus === "approved" && updatedRequest) {
    const formatted = formatRequest(ctx.employees, updatedRequest);
    void notifyTimeOffApproved(formatted.employeeName, formatted.startDate, formatted.endDate);
  }

  return {
    ok: true,
    request: updatedRequest ? formatRequest(ctx.employees, updatedRequest) : null,
    teamRequests: buildTeamTimeOffRequestsPayload(session, nextCtx, {
      status: "pending",
    }),
  };
}

export { getMyTimeOffBalance };

/**
 * Lists team members with their time-off request summaries.
 * @param {MockAuthSession} session
 */
export async function listTeamMembers(session: MockAuthSession) {
  const denied = requireManagerRole(session);
  if (denied) return denied;

  const ctx = await loadContext();
  const teamRequests = getTeamRequestsForManager(ctx.requests, session);
  const todayDay = parseIsoDateToUtcDay(getTodayIsoDate(session.timeZone));

  const members = session.managedEmployees.map((e) => {
    const employeeRequests = teamRequests.filter((r) => r.employeeId === e.employeeId);
    const pendingCount = employeeRequests.filter((r) => r.status === "pending").length;
    const upcomingCount = employeeRequests.filter((r) => {
      const startDay = parseIsoDateToUtcDay(r.startDate);
      return (
        r.status !== "cancelled" &&
        r.status !== "rejected" &&
        Number.isFinite(startDay) &&
        startDay >= todayDay
      );
    }).length;

    return {
      employeeId: e.employeeId,
      employeeName: e.name,
      employeeAvatar: e.avatar,
      team: e.team,
      pendingCount,
      upcomingCount,
      totalCount: employeeRequests.length,
    };
  });

  return {
    ok: true,
    scope: "team",
    manager: getEmployeeSummary(session),
    totalMembers: members.length,
    members,
  };
}

/**
 * Lists all employees in the company with their time-off request summaries.
 * @param {MockAuthSession} session
 */
export async function listAllEmployees(session: MockAuthSession) {
  const ctx = await loadContext();
  const todayDay = parseIsoDateToUtcDay(getTodayIsoDate(session.timeZone));

  const projectEmployees = ctx.employees.filter((e) => e.team === session.team);

  const employees = projectEmployees.map((e) => {
    const employeeRequests = ctx.requests.filter((r) => r.employeeId === e.employeeId);
    const pendingCount = employeeRequests.filter((r) => r.status === "pending").length;
    const upcomingCount = employeeRequests.filter((r) => {
      const startDay = parseIsoDateToUtcDay(r.startDate);
      return (
        r.status !== "cancelled" &&
        r.status !== "rejected" &&
        Number.isFinite(startDay) &&
        startDay >= todayDay
      );
    }).length;

    return {
      employeeId: e.employeeId,
      employeeName: e.name,
      employeeAvatar: e.avatar,
      team: e.team,
      pendingCount,
      upcomingCount,
      totalCount: employeeRequests.length,
    };
  });

  return {
    ok: true,
    totalEmployees: employees.length,
    employees,
  };
}

/**
 * Lists my time off requests.
 * @param {MockAuthSession} session
 * @param {ListRequestInput} input
 */
export async function listMyTimeOffRequests(
  session: MockAuthSession,
  input?: ListRequestInput,
) {
  const ctx = await loadContext();
  return buildMyTimeOffRequestsPayload(session, ctx, input);
}

/**
 * submitMyTimeOffRequest helper.
 * @param {MockAuthSession} session
 * @param {SubmitMyTimeOffRequestInput} input
 */
export async function submitMyTimeOffRequest(
  session: MockAuthSession,
  input: SubmitMyTimeOffRequestInput,
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

  const overlappingRequests = getOpenRequestsForEmployee(
    ctx.requests,
    employee.employeeId,
  )
    .filter((request) => overlaps(request, startDay, endDay))
    .map((request) => toRequestMatch(ctx.employees, request));

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
      (row) => row.leaveType === input.leaveType,
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
  const persistedRequests = await replaceTimeOffRequests(nextRequests);
  const nextCtx = withRequests(ctx, persistedRequests);
  const persistedRequest = persistedRequests.find(
    (savedRequest) => savedRequest.id === request.id,
  );

  return {
    ok: true,
    request: formatRequest(ctx.employees, persistedRequest ?? request),
    balance: buildMyTimeOffBalancePayload(session, nextCtx),
  };
}

/**
 * cancelMyTimeOffRequest helper.
 * @param {MockAuthSession} session
 * @param {RequestQueryInput} input
 */
export async function cancelMyTimeOffRequest(
  session: MockAuthSession,
  input: RequestQueryInput,
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
      matches: matches.map((request) => toRequestMatch(ctx.employees, request)),
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

  const nextRequests = ctx.requests.map((item) =>
    item.id === request.id
      ? {
          ...item,
          status: "cancelled" as const,
          updatedAt: new Date().toISOString(),
        }
      : item,
  );
  const persistedRequests = await replaceTimeOffRequests(nextRequests);
  const nextCtx = withRequests(ctx, persistedRequests);
  const cancelledRequest = persistedRequests.find((item) => item.id === request.id);

  return {
    ok: true,
    request: cancelledRequest ? formatRequest(ctx.employees, cancelledRequest) : null,
    balance: buildMyTimeOffBalancePayload(session, nextCtx),
  };
}

/**
 * Lists team time off requests.
 * @param {MockAuthSession} session
 * @param {TeamRequestListInput | undefined} input
 */
export async function listTeamTimeOffRequests(
  session: MockAuthSession,
  input?: TeamRequestListInput,
) {
  const ctx = await loadContext();
  return buildTeamTimeOffRequestsPayload(session, ctx, input);
}

/**
 * approveTeamTimeOffRequest helper.
 * @param {MockAuthSession} session
 * @param {OptionalCommentRequestInput} input
 */
export async function approveTeamTimeOffRequest(
  session: MockAuthSession,
  input: OptionalCommentRequestInput,
) {
  const denied = requireManagerRole(session);
  if (denied) return denied;

  const ctx = await loadContext();
  return reviewTeamTimeOffRequest(session, ctx, {
    ...input,
    nextStatus: "approved",
  });
}

/**
 * rejectTeamTimeOffRequest helper.
 * @param {MockAuthSession} session
 * @param {RequiredCommentRequestInput} input
 */
export async function rejectTeamTimeOffRequest(
  session: MockAuthSession,
  input: RequiredCommentRequestInput,
) {
  const denied = requireManagerRole(session);
  if (denied) return denied;

  const ctx = await loadContext();
  return reviewTeamTimeOffRequest(session, ctx, {
    ...input,
    nextStatus: "rejected",
  });
}
