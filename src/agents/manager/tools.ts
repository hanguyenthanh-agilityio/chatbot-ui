import { tool } from "ai";
import { z } from "zod";
import type { MockAuthSession } from "@/lib/auth/session";
import {
  approveTeamTimeOffRequest,
  listTeamTimeOffRequests,
  rejectTeamTimeOffRequest,
} from "@/agents/time-off/service";

export function createManagerTools(session: MockAuthSession) {
  return {
    list_team_time_off_requests: tool({
      description:
        "List or filter team time-off requests for the current manager. Use this for pending approvals, upcoming absences, or employee-specific request reviews.",
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
    approve_team_time_off_request: tool({
      description:
        "Approve one pending request from the current manager's team. This is a sensitive mutation and should go through UI approval before execution.",
      needsApproval: true,
      inputSchema: z.object({
        requestQuery: z
          .string()
          .trim()
          .min(1)
          .describe(
            "A team request description such as latest pending request, Mia annual leave on 2026-05-12, or apartment paperwork request.",
          ),
        comment: z.string().trim().optional(),
      }),
      execute: async ({ requestQuery, comment }) =>
        approveTeamTimeOffRequest(session, { requestQuery, comment }),
    }),
    reject_team_time_off_request: tool({
      description:
        "Reject one pending request from the current manager's team and include a short reason. This is a sensitive mutation and should go through UI approval before execution.",
      needsApproval: true,
      inputSchema: z.object({
        requestQuery: z
          .string()
          .trim()
          .min(1)
          .describe(
            "A team request description such as latest pending request, An personal leave on 2026-04-24, or paperwork request.",
          ),
        comment: z
          .string()
          .trim()
          .min(1)
          .describe("Short reason for the rejection."),
      }),
      execute: async ({ requestQuery, comment }) =>
        rejectTeamTimeOffRequest(session, { requestQuery, comment }),
    }),
  };
}
