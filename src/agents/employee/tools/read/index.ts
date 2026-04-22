import { tool } from "ai";
import { z } from "zod";
import type { MockAuthSession } from "@/lib/auth/session";
import {
  getMyTimeOffBalance,
  listMyTimeOffRequests,
} from "@/agents/handlers/time-off";
import { EMPLOYEE_TOOL_DESCRIPTION, EMPLOYEE_TOOL_NAME } from "../common/definitions";

/**
 * Creates employee read tools.
 * @param {MockAuthSession} session
 */
export function createEmployeeReadTools(session: MockAuthSession) {
  return {
    [EMPLOYEE_TOOL_NAME.GET_MY_TIME_OFF_BALANCE]: tool({
      description: EMPLOYEE_TOOL_DESCRIPTION.GET_MY_TIME_OFF_BALANCE,
      inputSchema: z.object({}),
      execute: async () => getMyTimeOffBalance(session),
    }),

    [EMPLOYEE_TOOL_NAME.LIST_MY_TIME_OFF_REQUESTS]: tool({
      description: EMPLOYEE_TOOL_DESCRIPTION.LIST_MY_TIME_OFF_REQUESTS,
      inputSchema: z.object({
        status: z
          .enum(["all", "pending", "approved", "cancelled", "rejected"])
          .optional(),
        query: z
          .string()
          .trim()
          .min(1)
          .optional()
          .describe(
            "Optional filter such as annual, pending, family trip, 2026-05-08, or approved.",
          ),
      }),
      execute: async ({ status, query }) =>
        listMyTimeOffRequests(session, { status, query }),
    }),
  };
}
