import "server-only";

import {
  listEmployeeDirectory,
  listEmployeeRows,
  listRoleProfiles,
} from "@/lib/db/store";
import {
  getRoleLabel,
  type AppRole,
  type MockAuthSession,
} from "@/lib/auth/session";

const SESSION_ID_BY_ROLE: Record<AppRole, string> = {
  user: "db-user-session",
  manager: "db-manager-session",
};

async function buildSessionsByRole(): Promise<Record<AppRole, MockAuthSession>> {
  const [employeeDirectory, employeeRows, roleProfiles] = await Promise.all([
    listEmployeeDirectory(),
    listEmployeeRows(),
    listRoleProfiles(),
  ]);
  const employeeById = new Map(
    employeeDirectory.map((employee) => [employee.employeeId, employee]),
  );
  const roleEmployeeIdMap = new Map(
    roleProfiles.map((profile) => [profile.role, profile.employeeId]),
  );

  function buildRoleSession(role: AppRole): MockAuthSession {
    const managerFallbackEmployeeId = employeeRows.find((employee) =>
      employeeRows.some(
        (candidate) => candidate.managerEmployeeId === employee.employeeId,
      ),
    )?.employeeId;
    const fallbackEmployeeId =
      role === "manager"
        ? managerFallbackEmployeeId
        : employeeRows[0]?.employeeId;
    const roleEmployeeId =
      roleEmployeeIdMap.get(role) ?? fallbackEmployeeId ?? employeeRows[0]?.employeeId;

    if (!roleEmployeeId) {
      throw new Error("Manager database has no employees configured.");
    }

    const employee = employeeById.get(roleEmployeeId);
    if (!employee) {
      throw new Error(`Employee ${roleEmployeeId} not found in employee directory.`);
    }

    const managedEmployeeIds = employeeRows
      .filter((candidate) => candidate.managerEmployeeId === roleEmployeeId)
      .map((candidate) => candidate.employeeId);
    const managedEmployees = managedEmployeeIds
      .map((employeeId) => employeeById.get(employeeId))
      .filter((candidate): candidate is NonNullable<typeof candidate> =>
        Boolean(candidate),
      );

    return {
      ...employee,
      sessionId: SESSION_ID_BY_ROLE[role],
      role,
      employeeId: roleEmployeeId,
      managedEmployeeIds,
      roleLabel: getRoleLabel(role),
      managedEmployees,
    };
  }

  return {
    user: buildRoleSession("user"),
    manager: buildRoleSession("manager"),
  };
}

export async function getMockAuthSession(
  role: AppRole = "user",
): Promise<MockAuthSession> {
  const sessions = await buildSessionsByRole();
  return sessions[role];
}

export async function getMockAuthSessionsByRole(): Promise<
  Record<AppRole, MockAuthSession>
> {
  return buildSessionsByRole();
}
