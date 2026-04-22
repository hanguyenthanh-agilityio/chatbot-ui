import "server-only";

import {
  createTimeOffRequest,
  deleteTimeOffRequest,
  fetchEmployees,
  fetchLeaveEntitlements,
  fetchRoleProfiles,
  fetchTeams,
  fetchTimeOffRequests,
  updateTimeOffRequest,
} from "@/lib/db/client";
import type {
  EmployeeRecord,
  EmployeeRow,
  LeaveEntitlementRow,
  RoleProfileRow,
  TeamRow,
  TimeOffRequest,
} from "@/lib/db/schema";

export type AppDatabase = {
  teams: TeamRow[];
  employees: EmployeeRow[];
  leaveEntitlements: LeaveEntitlementRow[];
  roleProfiles: RoleProfileRow[];
  timeOffRequests: TimeOffRequest[];
  updatedAt: string;
};

const APP_ROLE_KEYS = ["user", "manager"] as const;

function cloneRows<T>(rows: T[]): T[] {
  return rows.map((row) => ({ ...row }));
}

function isTeamRow(value: unknown): value is TeamRow {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<TeamRow>;
  return typeof c.teamId === "string" && typeof c.name === "string";
}

function isEmployeeRow(value: unknown): value is EmployeeRow {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<EmployeeRow>;
  return (
    typeof c.employeeId === "string" &&
    typeof c.name === "string" &&
    typeof c.email === "string" &&
    typeof c.teamId === "string" &&
    typeof c.timeZone === "string" &&
    (typeof c.managerEmployeeId === "string" ||
      typeof c.managerEmployeeId === "undefined" ||
      c.managerEmployeeId === null)
  );
}

function isLeaveEntitlementRow(value: unknown): value is LeaveEntitlementRow {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<LeaveEntitlementRow>;
  return (
    typeof c.employeeId === "string" &&
    typeof c.annual === "number" &&
    typeof c.sick === "number" &&
    typeof c.personal === "number"
  );
}

function isRoleProfileRow(value: unknown): value is RoleProfileRow {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<RoleProfileRow>;
  return (
    (c.role === "user" || c.role === "manager") &&
    typeof c.employeeId === "string"
  );
}

function isTimeOffRequest(value: unknown): value is TimeOffRequest {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<TimeOffRequest>;
  return (
    typeof c.id === "string" &&
    typeof c.employeeId === "string" &&
    typeof c.leaveType === "string" &&
    typeof c.startDate === "string" &&
    typeof c.endDate === "string" &&
    typeof c.days === "number" &&
    typeof c.status === "string" &&
    typeof c.reason === "string" &&
    typeof c.createdAt === "string" &&
    typeof c.updatedAt === "string"
  );
}

function buildDefaultRoleProfiles(employees: EmployeeRow[]): RoleProfileRow[] {
  const fallbackUserId = employees[0]?.employeeId;
  const fallbackManagerId =
    employees.find((e) =>
      employees.some((c) => c.managerEmployeeId === e.employeeId),
    )?.employeeId ?? fallbackUserId;

  const rows: RoleProfileRow[] = [];
  if (fallbackUserId) rows.push({ role: "user", employeeId: fallbackUserId });
  if (fallbackManagerId) rows.push({ role: "manager", employeeId: fallbackManagerId });
  return rows;
}

function normalizeDatabase(value: unknown): AppDatabase {
  if (!value || typeof value !== "object") {
    return {
      teams: [],
      employees: [],
      leaveEntitlements: [],
      roleProfiles: [],
      timeOffRequests: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const candidate = value as Partial<AppDatabase>;
  const teams = Array.isArray(candidate.teams)
    ? cloneRows(candidate.teams.filter(isTeamRow))
    : [];
  const teamIdSet = new Set(teams.map((t) => t.teamId));

  const parsedEmployees = Array.isArray(candidate.employees)
    ? cloneRows(candidate.employees.filter(isEmployeeRow))
    : [];
  const employees =
    teamIdSet.size > 0
      ? parsedEmployees.filter((e) => teamIdSet.has(e.teamId))
      : parsedEmployees;
  const employeeIdSet = new Set(employees.map((e) => e.employeeId));

  const leaveEntitlements = Array.isArray(candidate.leaveEntitlements)
    ? cloneRows(
        candidate.leaveEntitlements
          .filter(isLeaveEntitlementRow)
          .filter((e) => employeeIdSet.has(e.employeeId)),
      )
    : [];

  const parsedRoleProfiles = Array.isArray(candidate.roleProfiles)
    ? cloneRows(
        candidate.roleProfiles
          .filter(isRoleProfileRow)
          .filter((p) => employeeIdSet.has(p.employeeId)),
      )
    : [];
  const defaultRoleProfiles = buildDefaultRoleProfiles(employees);
  const roleProfileMap = new Map(parsedRoleProfiles.map((p) => [p.role, p]));
  const roleProfiles = APP_ROLE_KEYS.map(
    (role) =>
      roleProfileMap.get(role) ??
      defaultRoleProfiles.find((p) => p.role === role),
  ).filter((p): p is RoleProfileRow => Boolean(p));

  const timeOffRequests = Array.isArray(candidate.timeOffRequests)
    ? cloneRows(
        candidate.timeOffRequests
          .filter(isTimeOffRequest)
          .filter((r) => employeeIdSet.has(r.employeeId)),
      )
    : [];

  return {
    teams,
    employees,
    leaveEntitlements,
    roleProfiles,
    timeOffRequests,
    updatedAt:
      typeof candidate.updatedAt === "string"
        ? candidate.updatedAt
        : new Date().toISOString(),
  };
}

async function syncTimeOffRequests(requests: TimeOffRequest[]) {
  const existing = await fetchTimeOffRequests();
  const existingById = new Map(
    existing.filter(isTimeOffRequest).map((r) => [r.id, r]),
  );
  const nextIdSet = new Set(requests.map((r) => r.id));

  const writes = requests.map((r) =>
    existingById.has(r.id)
      ? updateTimeOffRequest(r.id, r)
      : createTimeOffRequest(r),
  );
  const deletes = existing
    .filter((r) => isTimeOffRequest(r) && !nextIdSet.has(r.id))
    .map((r) => deleteTimeOffRequest((r as TimeOffRequest).id));

  await Promise.all([...writes, ...deletes]);
}

export async function readDatabase(): Promise<AppDatabase> {
  const [teams, employees, leaveEntitlements, roleProfiles, timeOffRequests] =
    await Promise.all([
      fetchTeams(),
      fetchEmployees(),
      fetchLeaveEntitlements(),
      fetchRoleProfiles(),
      fetchTimeOffRequests(),
    ]);

  return normalizeDatabase({
    teams,
    employees,
    leaveEntitlements,
    roleProfiles,
    timeOffRequests,
    updatedAt: new Date().toISOString(),
  });
}

export async function writeDatabase(database: AppDatabase): Promise<AppDatabase> {
  const normalized = normalizeDatabase(database);
  await syncTimeOffRequests(normalized.timeOffRequests);
  return readDatabase();
}

export async function listTimeOffRequests(): Promise<TimeOffRequest[]> {
  const requests = await fetchTimeOffRequests();
  return cloneRows(requests.filter(isTimeOffRequest));
}

export async function replaceTimeOffRequests(
  requests: TimeOffRequest[],
): Promise<TimeOffRequest[]> {
  const valid = cloneRows(requests.filter(isTimeOffRequest));
  await syncTimeOffRequests(valid);
  return listTimeOffRequests();
}

export async function listEmployeeRows(): Promise<EmployeeRow[]> {
  const employees = await fetchEmployees();
  return cloneRows(employees.filter(isEmployeeRow));
}

export async function listRoleProfiles(): Promise<RoleProfileRow[]> {
  const roleProfiles = await fetchRoleProfiles();
  return cloneRows(roleProfiles.filter(isRoleProfileRow));
}

export async function listEmployeeDirectory(): Promise<EmployeeRecord[]> {
  const [teams, employees, leaveEntitlements] = await Promise.all([
    fetchTeams(),
    fetchEmployees(),
    fetchLeaveEntitlements(),
  ]);

  const teamById = new Map(teams.map((t) => [t.teamId, t.name]));
  const employeeById = new Map(employees.map((e) => [e.employeeId, e]));
  const entitlementByEmployeeId = new Map(
    leaveEntitlements.map((e) => [e.employeeId, e]),
  );

  return employees.filter(isEmployeeRow).map((employee) => {
    const manager =
      employee.managerEmployeeId &&
      employeeById.get(employee.managerEmployeeId)?.name;
    const entitlement = entitlementByEmployeeId.get(employee.employeeId);

    return {
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      team: teamById.get(employee.teamId) ?? employee.teamId,
      manager: manager ?? "Not assigned",
      timeZone: employee.timeZone,
      entitlements: {
        annual: entitlement?.annual ?? 0,
        sick: entitlement?.sick ?? 0,
        personal: entitlement?.personal ?? 0,
      },
    };
  });
}
