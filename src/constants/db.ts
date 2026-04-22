export const COMPANY_SYSTEM_DEFAULT_BASE_URL = "http://127.0.0.1:4100";

export const COMPANY_SYSTEM_ENDPOINT_PATH = {
  teams: "/teams",
  employees: "/employees",
  leaveEntitlements: "/leaveEntitlements",
  roleProfiles: "/roleProfiles",
  timeOffRequests: "/timeOffRequests",
} as const;

export const COMPANY_SYSTEM_COPY = {
  requestFailedPrefix: "Company system request failed",
  noResponseBody: "No response body",
} as const;
