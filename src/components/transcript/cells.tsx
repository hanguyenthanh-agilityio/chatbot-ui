// Components
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ToolOutputTableAction } from "@/components/chat/tool-output-table";
import { EMPLOYEE_TOOL_NAME } from "@/agents/employee/tools/common/definitions";
import { MANAGER_TOOL_NAME } from "@/agents/manager/tools/common/definitions";

// Utils
import { getAvatarUrl, getInitialsFromName } from "@/utils/avatar";
import { formatHumanDateRange } from "@/utils/date";
import {
  asString,
  asOptionalString,
  formatStatus,
  compactLeaveTypeLabel,
  normalizeRequestStatus,
  isFutureOrTodayDate,
  type UnknownRecord,
} from "./utils";

export const ROW_ACTION_LABELS = {
  cancelRequest: "Cancel request",
  approve: "Approve",
  reject: "Reject",
  requestThisType: "Request this type",
  viewPending: "View pending",
  viewAll: "View all",
} as const;

export const ROW_ACTION_FALLBACKS = {
  selfCancelList:
    "I want to cancel one of my requests. Could you list my cancellable requests so I can choose one?",
  teamApprovePending: "Please approve the selected pending team request.",
  teamRejectPending: "Please reject the selected pending team request.",
  teamApproveRejected: "Please approve the selected rejected team request.",
  teamRejectApproved: "Please reject the selected approved team request.",
} as const;

const EMPLOYEE_CELL_NAME_CLASSES =
  "whitespace-nowrap text-sm font-semibold leading-compact text-white/92 light:text-app-fg";

const EMPLOYEE_CELL_TEAM_CLASSES =
  "mt-0.5 whitespace-nowrap text-xs leading-compact text-white/60 light:text-app-fg-muted";

const EMPLOYEE_CELL_AVATAR_RING = "ring-white/15 light:ring-app-border-muted";

export function renderLeaveTypeChip(label: string) {
  return (
    <Badge variant="info" className="px-2.5 py-0.5 text-xs">
      {label}
    </Badge>
  );
}

export function renderStatusChip(status: string) {
  if (!status) return "—";

  const normalizedStatus = status.toLowerCase();
  const statusVariant =
    normalizedStatus === "approved"
      ? "success"
      : normalizedStatus === "pending"
        ? "warning"
        : normalizedStatus === "rejected"
          ? "danger"
          : "neutral";

  return (
    <Badge variant={statusVariant} className="px-2.5 py-0.5 text-xs">
      {formatStatus(status)}
    </Badge>
  );
}

export function renderEmployeeCell(request: UnknownRecord) {
  const employeeName = asString(request.employeeName);
  const employeeTeam = asString(request.team, "");
  const employeeAvatar =
    asOptionalString(request.employeeAvatar)?.trim() ||
    getAvatarUrl(employeeName);

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar
        variant="user"
        src={employeeAvatar}
        alt={`${employeeName} avatar`}
        initials={getInitialsFromName(employeeName)}
        size="sm"
        className={EMPLOYEE_CELL_AVATAR_RING}
      />

      <div className="min-w-0">
        <p className={EMPLOYEE_CELL_NAME_CLASSES}>{employeeName}</p>
        {employeeTeam ? (
          <p className={EMPLOYEE_CELL_TEAM_CLASSES}>{employeeTeam}</p>
        ) : null}
      </div>
    </div>
  );
}

export function buildSelfCancelPrompt(request: UnknownRecord): string {
  const leaveType = compactLeaveTypeLabel(
    asString(request.leaveTypeLabel, asString(request.leaveType, "")),
  );
  const startDate = asOptionalString(request.startDate)?.trim() ?? "";
  const endDate = asOptionalString(request.endDate)?.trim() ?? "";
  const dateRange = formatHumanDateRange(startDate, endDate);

  if (leaveType && leaveType !== "—" && dateRange) {
    return `I'd like to cancel my ${leaveType} leave ${dateRange}.`;
  }
  return "";
}

export function buildTeamActionPrompt(
  request: UnknownRecord,
  action: "approve" | "reject",
): string {
  const name = asOptionalString(request.employeeName)?.trim() ?? "";
  const leaveType = compactLeaveTypeLabel(
    asString(request.leaveTypeLabel, asString(request.leaveType, "")),
  );
  const startDate = asOptionalString(request.startDate)?.trim() ?? "";
  const endDate = asOptionalString(request.endDate)?.trim() ?? "";
  const dateRange = formatHumanDateRange(startDate, endDate);
  if (!name || !leaveType || leaveType === "—" || !dateRange) return "";
  if (action === "approve") {
    return `Approve ${name}'s ${leaveType} leave ${dateRange}. Comment: Approved.`;
  }
  return `Reject ${name}'s ${leaveType} leave ${dateRange}. Reason: Not approved.`;
}

export function getSelfRequestRowActions(
  request: UnknownRecord,
): ToolOutputTableAction[] {
  const status = normalizeRequestStatus(request.status);

  if (status !== "approved" && status !== "pending") {
    return [];
  }

  if (!isFutureOrTodayDate(request.startDate)) {
    return [];
  }

  const prompt =
    buildSelfCancelPrompt(request) ||
    ROW_ACTION_FALLBACKS.selfCancelList;

  return [
    {
      label: ROW_ACTION_LABELS.cancelRequest,
      prompt,
      tone: "danger",
    },
  ];
}

export function getTeamRequestRowActions(
  request: UnknownRecord,
): ToolOutputTableAction[] {
  const status = normalizeRequestStatus(request.status);

  const isFuture = isFutureOrTodayDate(request.startDate);

  if (status === "pending") {
    return [
      {
        label: ROW_ACTION_LABELS.approve,
        prompt:
          buildTeamActionPrompt(request, "approve") ||
          ROW_ACTION_FALLBACKS.teamApprovePending,
        tone: "success",
      },
      {
        label: ROW_ACTION_LABELS.reject,
        prompt:
          buildTeamActionPrompt(request, "reject") ||
          ROW_ACTION_FALLBACKS.teamRejectPending,
        tone: "danger",
      },
    ];
  }

  if (!isFuture) return [];

  if (status === "approved") {
    return [
      {
        label: ROW_ACTION_LABELS.reject,
        prompt:
          buildTeamActionPrompt(request, "reject") ||
          ROW_ACTION_FALLBACKS.teamRejectApproved,
        tone: "danger",
      },
    ];
  }

  if (status === "rejected") {
    return [
      {
        label: ROW_ACTION_LABELS.approve,
        prompt:
          buildTeamActionPrompt(request, "approve") ||
          ROW_ACTION_FALLBACKS.teamApproveRejected,
        tone: "success",
      },
    ];
  }

  return [];
}

export function getBalanceRowActions(
  balance: UnknownRecord,
): ToolOutputTableAction[] {
  const leaveType = asOptionalString(balance.leaveType)?.trim().toLowerCase();
  if (!leaveType) {
    return [];
  }

  return [
    {
      label: ROW_ACTION_LABELS.requestThisType,
      prompt: `I want to submit a ${leaveType} time-off request.`,
      tone: "success",
    },
  ];
}

export function getMemberRowActions(
  member: UnknownRecord,
): ToolOutputTableAction[] {
  const employeeName = asOptionalString(member.employeeName)?.trim();
  if (!employeeName) return [];

  const pendingCount =
    typeof member.pendingCount === "number" ? member.pendingCount : 0;
  const actions: ToolOutputTableAction[] = [];

  if (pendingCount > 0) {
    actions.push({
      label: ROW_ACTION_LABELS.viewPending,
      prompt: `Show ${employeeName}'s pending time-off requests.`,
      tone: "neutral",
    });
  }

  actions.push({
    label: ROW_ACTION_LABELS.viewAll,
    prompt: `Show all time-off requests for ${employeeName}.`,
    tone: "neutral",
  });

  return actions;
}

export function getRequestRowActionBuilder(toolName: string | null) {
  switch (toolName) {
    case MANAGER_TOOL_NAME.LIST_TEAM_TIME_OFF_REQUESTS:
    case MANAGER_TOOL_NAME.APPROVE_TEAM_TIME_OFF_REQUEST:
    case MANAGER_TOOL_NAME.REJECT_TEAM_TIME_OFF_REQUEST:
      return getTeamRequestRowActions;
    case EMPLOYEE_TOOL_NAME.LIST_MY_TIME_OFF_REQUESTS:
    case EMPLOYEE_TOOL_NAME.GET_MY_TIME_OFF_BALANCE:
    case EMPLOYEE_TOOL_NAME.SUBMIT_MY_TIME_OFF_REQUEST:
    case EMPLOYEE_TOOL_NAME.CANCEL_MY_TIME_OFF_REQUEST:
      return getSelfRequestRowActions;
    default:
      return (request: UnknownRecord) => {
        const hasEmployee = Boolean(
          asOptionalString(request.employeeName)?.trim(),
        );
        return hasEmployee
          ? getTeamRequestRowActions(request)
          : getSelfRequestRowActions(request);
      };
  }
}
