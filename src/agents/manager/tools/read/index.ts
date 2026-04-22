import { tool } from "ai";
import { z } from "zod";
import type { MockAuthSession } from "@/lib/auth/session";
import { listTeamTimeOffRequests } from "@/agents/handlers/time-off";
import { MANAGER_TOOL_DESCRIPTION, MANAGER_TOOL_NAME } from "../common/definitions";

/**
 * Creates manager read tools.
 * @param {MockAuthSession} session
 */
export function createManagerReadTools(session: MockAuthSession) {
  return {
    [MANAGER_TOOL_NAME.LIST_TEAM_TIME_OFF_REQUESTS]: tool({
      description: MANAGER_TOOL_DESCRIPTION.LIST_TEAM_TIME_OFF_REQUESTS,
      inputSchema: z.object({
        status: z
          .enum(["all", "pending", "approved", "cancelled", "rejected"])
          .optional(),
        employeeQuery: z
          .string()
          .trim()
          .min(1)
          .optional()
          .describe(
            "Optional employee or request filter such as Thang, annual, pending, or 2026-05-12.",
          ),
      }),
      execute: async ({ status, employeeQuery }) =>
        listTeamTimeOffRequests(session, { status, employeeQuery }),
    }),
  };
}
