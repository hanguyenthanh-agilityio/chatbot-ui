import { tool } from "ai";
import { z } from "zod";
import type { MockAuthSession } from "@/lib/auth/session";
import {
  getMyTimeOffBalance,
  listMyTimeOffRequests,
} from "@/agents/handlers/time-off";
import { EMPLOYEE_TOOL_DESCRIPTION, EMPLOYEE_TOOL_NAME } from "../common/definitions";

const leaveTypeSchema = z
  .enum(["annual", "sick", "personal", "unpaid"])
  .describe("Type of leave.");

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
 * @param {{ skipDatePicker?: boolean }} options
 */
export function createEmployeeReadTools(
  session: MockAuthSession,
  options?: { skipDatePicker?: boolean },
) {
  const base = {
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

  if (options?.skipDatePicker) {
    return base;
  }

  return {
    ...base,
    [EMPLOYEE_TOOL_NAME.COLLECT_DATE_RANGE]: tool({
      description: EMPLOYEE_TOOL_DESCRIPTION.COLLECT_DATE_RANGE,
      inputSchema: z.object({
        leaveType: leaveTypeSchema,
        reason: z.string().trim().min(1).describe("Short reason for the leave."),
      }),
      execute: async () => ({ ok: true }),
    }),
  };
}
