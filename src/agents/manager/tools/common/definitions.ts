export const MANAGER_TOOL_NAME = {
  LIST_TEAM_TIME_OFF_REQUESTS: "list_team_time_off_requests",
  APPROVE_TEAM_TIME_OFF_REQUEST: "approve_team_time_off_request",
  REJECT_TEAM_TIME_OFF_REQUEST: "reject_team_time_off_request",
} as const;

export const MANAGER_TOOL_DESCRIPTION = {
  LIST_TEAM_TIME_OFF_REQUESTS:
    "List or filter team time-off requests for the current manager. Use this for pending approvals, upcoming absences, or employee-specific request reviews.",
  APPROVE_TEAM_TIME_OFF_REQUEST:
    "Approve one pending request from the current manager's team. This is a sensitive mutation and should go through UI approval before execution.",
  REJECT_TEAM_TIME_OFF_REQUEST:
    "Reject one pending request from the current manager's team and include a short reason. This is a sensitive mutation and should go through UI approval before execution.",
} as const;
