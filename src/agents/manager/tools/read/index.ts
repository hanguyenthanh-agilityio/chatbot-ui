import { tool } from "ai";
import { z } from "zod";
import type { MockAuthSession } from "@/lib/auth/session";
import { listTeamTimeOffRequests } from "@/agents/handlers/time-off";
import { MANAGER_TOOL_DESCRIPTION, MANAGER_TOOL_NAME } from "../common/definitions";

const OPTIONAL_STATUS_SCHEMA = z.preprocess(
  (value) => (value == null ? undefined : value),
  z
    .enum(["all", "upcoming", "pending", "approved", "cancelled", "rejected"])
    .optional(),
);

const OPTIONAL_EMPLOYEE_QUERY_SCHEMA = z.preprocess(
  (value) => {
    if (value == null) return undefined;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().min(1).optional(),
);

/**
 * Creates manager read tools.
 * @param {MockAuthSession} session
 */
export function createManagerReadTools(session: MockAuthSession) {
  return {
    [MANAGER_TOOL_NAME.LIST_TEAM_TIME_OFF_REQUESTS]: tool({
      description: MANAGER_TOOL_DESCRIPTION.LIST_TEAM_TIME_OFF_REQUESTS,
      inputSchema: z.object({
        status: OPTIONAL_STATUS_SCHEMA,
        employeeQuery: OPTIONAL_EMPLOYEE_QUERY_SCHEMA.describe(
          "Optional employee or request filter such as Thang, annual, pending, or 2026-05-12.",
        ),
      }),
      execute: async ({ status, employeeQuery }) =>
        listTeamTimeOffRequests(session, { status, employeeQuery }),
    }),
  };
}
