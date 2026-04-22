import { tool } from "ai";
import { z } from "zod";
import type { MockAuthSession } from "@/lib/auth/session";
import {
  cancelMyTimeOffRequest,
  getMyTimeOffBalance,
  listMyTimeOffRequests,
  submitMyTimeOffRequest,
} from "@/agents/time-off/service";

const leaveTypeSchema = z
  .enum(["annual", "sick", "personal", "unpaid"])
  .describe(
    "Type of leave. Map vacation/PTO to annual, illness/doctor to sick, personal errand to personal.",
  );

export function createTimeOffTools(session: MockAuthSession) {
  return {
    get_my_time_off_balance: tool({
      description:
        "Get the current user's leave balances, approver, and the next few upcoming requests.",
      inputSchema: z.object({}),
      execute: async () => getMyTimeOffBalance(session),
    }),
    list_my_time_off_requests: tool({
      description:
        "List the current user's time-off requests. Use for upcoming requests, history, or when you need to identify a request before cancelling.",
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
    submit_my_time_off_request: tool({
      description:
        "Create a new time-off request for the current user. This is a sensitive mutation and should go through UI approval before execution.",
      needsApproval: true,
      inputSchema: z.object({
        leaveType: leaveTypeSchema,
        startDate: z
          .string()
          .trim()
          .min(1)
          .describe("Start date, e.g. 2026-05-02, tomorrow, or next monday."),
        endDate: z
          .string()
          .trim()
          .min(1)
          .describe("End date, e.g. 2026-05-02 or next friday."),
        reason: z.string().trim().min(1).describe("Short reason for the leave."),
        note: z.string().trim().optional(),
      }),
      execute: async ({ leaveType, startDate, endDate, reason, note }) =>
        submitMyTimeOffRequest(session, {
          leaveType,
          startDate,
          endDate,
          reason,
          note,
        }),
    }),
    cancel_my_time_off_request: tool({
      description:
        "Cancel one of the current user's cancellable requests. This is a sensitive mutation and should go through UI approval before execution. Use a clear request description such as latest pending request, annual leave on 2026-06-15, or family trip request.",
      needsApproval: true,
      inputSchema: z.object({
        requestQuery: z
          .string()
          .trim()
          .min(1)
          .describe(
            "Human description of the request to cancel, such as latest pending request or annual leave on 2026-06-15.",
          ),
      }),
      execute: async ({ requestQuery }) =>
        cancelMyTimeOffRequest(session, { requestQuery }),
    }),
  };
}
