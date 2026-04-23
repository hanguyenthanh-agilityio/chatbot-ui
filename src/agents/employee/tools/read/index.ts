import { tool } from "ai";
import { z } from "zod";
import type { MockAuthSession } from "@/lib/auth/session";
import {
  getMyTimeOffBalance,
  listMyTimeOffRequests,
} from "@/agents/handlers/time-off";
import { EMPLOYEE_TOOL_DESCRIPTION, EMPLOYEE_TOOL_NAME } from "../common/definitions";

const OPTIONAL_STATUS_SCHEMA = z.preprocess(
  (value) => (value == null ? undefined : value),
  z
    .enum(["all", "upcoming", "pending", "approved", "cancelled", "rejected"])
    .optional(),
);

const OPTIONAL_QUERY_SCHEMA = z.preprocess(
  (value) => {
    if (value == null) return undefined;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().min(1).optional(),
);

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
        status: OPTIONAL_STATUS_SCHEMA,
        query: OPTIONAL_QUERY_SCHEMA.describe(
          "Optional filter such as annual, pending, family trip, 2026-05-08, or approved.",
        ),
      }),
      execute: async ({ status, query }) =>
        listMyTimeOffRequests(session, { status, query }),
    }),
  };
}
