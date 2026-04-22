import "server-only";

import type {
  EmployeeRow,
  LeaveEntitlementRow,
  RoleProfileRow,
  TeamRow,
  TimeOffRequest,
} from "@/lib/db/schema";

const DEFAULT_DB_BASE_URL = "http://127.0.0.1:4100";

function getDbBaseUrl() {
  return (
    process.env.MANAGER_DB_BASE_URL?.trim().replace(/\/+$/, "") ||
    DEFAULT_DB_BASE_URL
  );
}

async function requestDb<T>(pathname: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getDbBaseUrl()}${pathname}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `DB request failed (${response.status} ${response.statusText}) on ${pathname}: ${errorBody || "No response body"}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchTeams() {
  return requestDb<TeamRow[]>("/teams");
}

export async function fetchEmployees() {
  return requestDb<EmployeeRow[]>("/employees");
}

export async function fetchLeaveEntitlements() {
  return requestDb<LeaveEntitlementRow[]>("/leaveEntitlements");
}

export async function fetchRoleProfiles() {
  return requestDb<RoleProfileRow[]>("/roleProfiles");
}

export async function fetchTimeOffRequests() {
  return requestDb<TimeOffRequest[]>("/timeOffRequests");
}

export async function createTimeOffRequest(request: TimeOffRequest) {
  return requestDb<TimeOffRequest>("/timeOffRequests", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateTimeOffRequest(
  requestId: string,
  request: TimeOffRequest,
) {
  return requestDb<TimeOffRequest>(
    `/timeOffRequests/${encodeURIComponent(requestId)}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
  );
}

export async function deleteTimeOffRequest(requestId: string) {
  await requestDb<void>(`/timeOffRequests/${encodeURIComponent(requestId)}`, {
    method: "DELETE",
  });
}
