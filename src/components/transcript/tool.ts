import { isToolUIPart, type UIMessage } from "ai";
import { CHAT_TRANSCRIPT_COPY } from "@/constants/chat";
import type {
  ApproveTeamRequestInput,
  CancelTimeOffInput,
  RejectTeamRequestInput,
  SubmitTimeOffInput,
} from "@/types/tool";
import type { MessageMetadata } from "@/agents/chat-core";
import { formatHumanDateRange } from "@/utils/date";
import {
  EMPLOYEE_TOOL_NAME,
} from "@/agents/employee/tools/common/definitions";
import { MANAGER_TOOL_NAME } from "@/agents/manager/tools/common/definitions";
import {
  asRecord,
  asString,
  asOptionalString,
  compactLeaveTypeLabel,
} from "./utils";
import { leaveTypeLabel } from "@/utils/leave";

export const TOOL_STATUS_TONE_CLASS: Record<
  "success" | "error" | "neutral",
  string
> = {
  error:
    "border border-rose-400/28 bg-rose-500/12 text-rose-200 shadow-tool-rose light:border-rose-300/70 light:bg-rose-50 light:text-rose-800 light:shadow-none",
  success:
    "border border-emerald-400/28 bg-emerald-500/12 text-emerald-100 shadow-tool-emerald light:border-emerald-300/70 light:bg-emerald-50 light:text-emerald-900 light:shadow-none",
  neutral:
    "border border-white/10 bg-white/7 text-white/72 shadow-tool-neutral light:border-app-border light:bg-app-surface-subtle light:text-app-fg-muted light:shadow-none",
};

export const TOOL_FRIENDLY_LABEL_BY_NAME: Record<string, string> = {
  [EMPLOYEE_TOOL_NAME.GET_MY_TIME_OFF_BALANCE]: "My leave balance",
  [EMPLOYEE_TOOL_NAME.LIST_MY_TIME_OFF_REQUESTS]: "My time-off requests",
  [MANAGER_TOOL_NAME.LIST_EMPLOYEES]: "All employees",
  [MANAGER_TOOL_NAME.LIST_TEAM_MEMBERS]: "Team members",
  [MANAGER_TOOL_NAME.LIST_TEAM_TIME_OFF_REQUESTS]: "Team time-off requests",
  [EMPLOYEE_TOOL_NAME.SUBMIT_MY_TIME_OFF_REQUEST]: "Submit time-off request",
  [EMPLOYEE_TOOL_NAME.CANCEL_MY_TIME_OFF_REQUEST]: "Cancel time-off request",
  [MANAGER_TOOL_NAME.APPROVE_TEAM_TIME_OFF_REQUEST]: "Approve team request",
  [MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST]: "Reject team request",
};

/** Table titles rendered in tool-output (subset reuse friendly tool labels). */
export const TOOL_OUTPUT_TABLE_TITLES = {
  myLeaveBalance:
    TOOL_FRIENDLY_LABEL_BY_NAME[EMPLOYEE_TOOL_NAME.GET_MY_TIME_OFF_BALANCE],
  myTimeOffRequests:
    TOOL_FRIENDLY_LABEL_BY_NAME[EMPLOYEE_TOOL_NAME.LIST_MY_TIME_OFF_REQUESTS],
  teamMembers:
    TOOL_FRIENDLY_LABEL_BY_NAME[MANAGER_TOOL_NAME.LIST_TEAM_MEMBERS],
  teamTimeOffRequests:
    TOOL_FRIENDLY_LABEL_BY_NAME[
      MANAGER_TOOL_NAME.LIST_TEAM_TIME_OFF_REQUESTS
    ],
  projectMembers: "Project members",
  upcomingRequests: "Upcoming requests",
  updatedLeaveBalance: "Updated leave balance",
  cancelledRequests: "Cancelled requests",
  pendingTeamRequests: "Pending team requests",
} as const;

export function employeeRequestsTableTitle(query: string) {
  return `${query}'s requests`;
}

export function getToolParts(message: UIMessage) {
  const toolParts = message.parts.filter((part) => isToolUIPart(part));

  return Array.from(
    new Map(
      toolParts.map((part, index) => [
        part.toolCallId ?? `tool-${index}`,
        part,
      ]),
    ).values(),
  );
}

export function humanizeToolName(toolName: string) {
  return toolName
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getFriendlyToolLabelByName(toolName: string | null) {
  if (!toolName) return CHAT_TRANSCRIPT_COPY.toolFallbackLabel;
  return TOOL_FRIENDLY_LABEL_BY_NAME[toolName] ?? humanizeToolName(toolName);
}

export function getToolName(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part)) return null;

  return part.type === "dynamic-tool"
    ? part.toolName
    : part.type.replace("tool-", "");
}

export function getToolStepText(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part)) return null;

  switch (part.state) {
    case "input-streaming":
    case "input-available":
    case "output-available":
    case "output-error":
      return `Call tool: ${getFriendlyToolLabelByName(getToolName(part))}`;
    case "approval-responded":
      return part.approval.approved
        ? `Call tool: ${getFriendlyToolLabelByName(getToolName(part))}`
        : null;
    default:
      return null;
  }
}

export function isDatePickerToolPart(
  part: UIMessage["parts"][number],
): boolean {
  return (
    isToolUIPart(part) &&
    getToolName(part) === EMPLOYEE_TOOL_NAME.COLLECT_DATE_RANGE &&
    part.state === "output-available"
  );
}

export function getDatePickerLeaveType(
  part: UIMessage["parts"][number],
): string {
  if (!isToolUIPart(part)) return "";
  const input = part.input as Record<string, unknown> | null;
  return typeof input?.leaveType === "string" ? input.leaveType : "";
}

export function isApprovalRequestedToolPart(
  part: UIMessage["parts"][number],
): part is Extract<UIMessage["parts"][number], { approval: { id: string } }> {
  return isToolUIPart(part) && part.state === "approval-requested";
}

export function getApprovalCardContent(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part) || part.state !== "approval-requested") {
    return null;
  }

  const toolName = getToolName(part);

  switch (toolName) {
    case EMPLOYEE_TOOL_NAME.SUBMIT_MY_TIME_OFF_REQUEST: {
      const i = part.input as SubmitTimeOffInput;
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest.title,
        description: `${leaveTypeLabel(i.leaveType)} from ${i.startDate ?? "—"} to ${i.endDate ?? "—"}${i.reason ? `. Reason: ${i.reason}.` : "."}`,
        confirmLabel:
          CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest.confirmLabel,
        cancelLabel:
          CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest.cancelLabel,
      };
    }
    case EMPLOYEE_TOOL_NAME.CANCEL_MY_TIME_OFF_REQUEST: {
      const i = part.input as CancelTimeOffInput;
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.title,
        description: `${CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.descriptionPrefix} ${i.requestQuery ?? CHAT_TRANSCRIPT_COPY.toolApproval.selectedRequestFallback}.`,
        confirmLabel:
          CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.confirmLabel,
        cancelLabel:
          CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.cancelLabel,
      };
    }
    case MANAGER_TOOL_NAME.APPROVE_TEAM_TIME_OFF_REQUEST: {
      const i = part.input as ApproveTeamRequestInput;
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.title,
        description: `${CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.descriptionPrefix} ${i.requestQuery ?? CHAT_TRANSCRIPT_COPY.toolApproval.selectedRequestFallback}${i.comment ? `. ${CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.commentLabel} ${i.comment}.` : "."}`,
        confirmLabel:
          CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.confirmLabel,
        cancelLabel:
          CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.cancelLabel,
      };
    }
    case MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST: {
      const i = part.input as RejectTeamRequestInput;
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.title,
        description: `${CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.descriptionPrefix} ${i.requestQuery ?? CHAT_TRANSCRIPT_COPY.toolApproval.selectedRequestFallback}${i.comment ? `. ${CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.reasonLabel} ${i.comment}.` : "."}`,
        confirmLabel:
          CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.confirmLabel,
        cancelLabel:
          CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.cancelLabel,
      };
    }
    default:
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.default.title,
        description: CHAT_TRANSCRIPT_COPY.toolApproval.default.description,
        confirmLabel: CHAT_TRANSCRIPT_COPY.toolApproval.default.confirmLabel,
        cancelLabel: CHAT_TRANSCRIPT_COPY.toolApproval.default.cancelLabel,
      };
  }
}

export function getToolStatusCopy(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part)) {
    return null;
  }

  const toolName = getToolName(part);
  const shortLabel = getFriendlyToolLabelByName(toolName);

  switch (part.state) {
    case "approval-responded":
      return {
        tone: "neutral" as const,
        text: part.approval.approved
          ? `${shortLabel} ${CHAT_TRANSCRIPT_COPY.toolStatus.confirmedSuffix}`
          : `${shortLabel} ${CHAT_TRANSCRIPT_COPY.toolStatus.cancelledSuffix}`,
      };
    case "output-error":
      // Never surface raw errorText (may contain Zod/JSON validation details).
      // The agent's text response already explains what went wrong to the user.
      return null;
    case "output-denied":
      return {
        tone: "neutral" as const,
        text: `${shortLabel} ${CHAT_TRANSCRIPT_COPY.toolStatus.cancelledSuffix}`,
      };
    case "output-available":
      return null;
    default:
      return null;
  }
}

export type MutationSuccessCard = {
  key: string;
  title: string;
  employeeName: string;
  employeeAvatar?: string;
  team?: string;
  leaveTypeLabel: string;
  dateRange: string;
  days: number;
  rawStatus: string;
  reviewComment?: string;
};

export function getMutationSuccessCard(part: UIMessage["parts"][number]) {
  if (
    !isToolUIPart(part) ||
    part.state !== "output-available" ||
    part.preliminary
  ) {
    return null;
  }

  const output = asRecord(part.output);
  if (!output || output.ok !== true) {
    return null;
  }

  const request = asRecord(output.request);
  if (!request) {
    return null;
  }

  const toolName = getToolName(part);

  let title: string;
  if (
    toolName === MANAGER_TOOL_NAME.APPROVE_TEAM_TIME_OFF_REQUEST
  )
    title = "Request approved";
  else if (
    toolName === MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST
  )
    title = "Request rejected";
  else if (toolName === EMPLOYEE_TOOL_NAME.CANCEL_MY_TIME_OFF_REQUEST)
    title = "Request cancelled";
  else if (toolName === EMPLOYEE_TOOL_NAME.SUBMIT_MY_TIME_OFF_REQUEST)
    title = "Request submitted";
  else return null;

  const employeeName = asString(request.employeeName, "Employee");
  const employeeAvatar =
    asOptionalString(request.employeeAvatar)?.trim() || undefined;
  const team = asOptionalString(request.team)?.trim() || undefined;
  const label = compactLeaveTypeLabel(
    asString(request.leaveTypeLabel, asString(request.leaveType, "Leave")),
  );
  const dateRange = formatHumanDateRange(
    asString(request.startDate, ""),
    asString(request.endDate, ""),
  );
  const days =
    typeof request.days === "number" && Number.isFinite(request.days)
      ? (request.days as number)
      : 0;
  const rawStatus = asString(request.status, "");
  const reviewComment =
    asOptionalString(request.reviewComment)?.trim() || undefined;

  return {
    title,
    employeeName,
    employeeAvatar,
    team,
    leaveTypeLabel: label,
    dateRange,
    days,
    rawStatus,
    reviewComment,
  };
}

export function readMessageMeta(message: UIMessage) {
  if (!message.metadata || typeof message.metadata !== "object") {
    return null;
  }

  const metadata = message.metadata as Partial<MessageMetadata>;

  return {
    agent: metadata.agent ?? CHAT_TRANSCRIPT_COPY.defaultAgentName,
    agentLabel: metadata.agentLabel ?? CHAT_TRANSCRIPT_COPY.defaultAgentLabel,
  };
}

export function getAssistantInitials(message: UIMessage) {
  const metadata = readMessageMeta(message);
  const badgeMap = CHAT_TRANSCRIPT_COPY.assistantBadgeByAgent;
  const agent = metadata?.agent;

  if (agent && agent in badgeMap) {
    return badgeMap[agent as keyof typeof badgeMap];
  }

  return badgeMap[CHAT_TRANSCRIPT_COPY.defaultAgentName];
}
