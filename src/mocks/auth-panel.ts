import { SESSION_ID_BY_ROLE } from "@/constants/auth";
import { getRoleLabel, type AppRole, type MockAuthSession } from "@/lib/auth/session";

const baseEmployee = {
  employeeId: "EMP-1001",
  name: "Thang Ho Quang",
  email: "thang.hoquang@asnet.com.vn",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=auth-panel-mock",
  team: "Platform",
  manager: "Linh Tran",
  timeZone: "Asia/Ho_Chi_Minh",
  entitlements: { annual: 14, sick: 5, personal: 2 },
} as const;

const miaEmployee = {
  employeeId: "EMP-1007",
  name: "Mia Nguyen",
  email: "mia.nguyen@asnet.com.vn",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=mia-mock",
  team: "Platform",
  manager: "Linh Tran",
  timeZone: "Asia/Ho_Chi_Minh",
  entitlements: { annual: 12, sick: 4, personal: 2 },
} as const;

/**
 * Minimal {@link MockAuthSession} for Storybook / component tests (no DB).
 */
export function mockAuthSession(
  role: AppRole,
  overrides?: Partial<MockAuthSession>,
): MockAuthSession {
  const managedEmployees = role === "manager" ? [{ ...miaEmployee }] : [];
  const managedEmployeeIds = managedEmployees.map((e) => e.employeeId);

  return {
    ...baseEmployee,
    sessionId: SESSION_ID_BY_ROLE[role],
    role,
    employeeId: baseEmployee.employeeId,
    managedEmployeeIds,
    roleLabel: getRoleLabel(role),
    managedEmployees,
    ...overrides,
  };
}
