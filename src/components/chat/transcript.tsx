import { isToolUIPart, type UIMessage } from "ai";
import { Fragment, type RefObject } from "react";
import { LoadingIndicator } from "@/components/chat/loading-indicator";
import { MessageAvatar, MessageBubble } from "@/components/chat/message-bubble";
import { ToolApprovalCard } from "@/components/chat/tool-approval-card";
import {
  ToolOutputTable,
  type ToolOutputTableAction,
  type ToolOutputTableColumn,
  type ToolOutputTableRow,
} from "@/components/chat/tool-output-table";
import { ChatEmptyState } from "@/components/chat/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CHAT_TRANSCRIPT_COPY } from "@/constants/chat";
import type { MessageMetadata } from "@/agents/chat-core";
import type { QuickAction } from "@/types/chat";
import type {
  ApproveTeamRequestInput,
  CancelTimeOffInput,
  RejectTeamRequestInput,
  SubmitTimeOffInput,
} from "@/types/tool";
import { getAvatarUrl, getInitialsFromName } from "@/utils/avatar";
import { formatDateWithYear, formatHumanDateRange, parseIsoDateUtc } from "@/utils/date";
import { getTextParts } from "@/utils/message";
import { leaveTypeLabel } from "@/utils/leave";

function getToolParts(message: UIMessage) {
  const toolParts = message.parts.filter((part) => isToolUIPart(part));

  return Array.from(
    new Map(
      toolParts.map((part, index) => [part.toolCallId ?? `tool-${index}`, part]),
    ).values(),
  );
}

const TOOL_STATUS_TONE_CLASS: Record<"success" | "error" | "neutral", string> = {
  error:   "border border-rose-400/28 bg-rose-500/12 text-rose-200 font-dm-sans shadow-[0_8px_20px_rgba(90,12,36,0.24)]",
  success: "border border-emerald-400/28 bg-emerald-500/12 text-emerald-100 font-dm-sans shadow-[0_8px_20px_rgba(8,70,42,0.22)]",
  neutral: "border border-white/10 bg-white/7 text-white/72 font-dm-sans shadow-[0_8px_20px_rgba(7,12,30,0.2)]",
};

const TOOL_FRIENDLY_LABEL_BY_NAME: Record<string, string> = {
  get_my_time_off_balance: "My leave balance",
  list_my_time_off_requests: "My time-off requests",
  list_employees: "All employees",
  list_team_members: "Team members",
  list_team_time_off_requests: "Team time-off requests",
  submit_my_time_off_request: "Submit time-off request",
  cancel_my_time_off_request: "Cancel time-off request",
  approve_team_time_off_request: "Approve team request",
  reject_team_time_off_request: "Reject team request",
};

function humanizeToolName(toolName: string) {
  return toolName
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFriendlyToolLabelByName(toolName: string | null) {
  if (!toolName) return CHAT_TRANSCRIPT_COPY.toolFallbackLabel;
  return TOOL_FRIENDLY_LABEL_BY_NAME[toolName] ?? humanizeToolName(toolName);
}

function getToolName(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part)) return null;

  return part.type === "dynamic-tool"
    ? part.toolName
    : part.type.replace("tool-", "");
}

function getToolStepText(part: UIMessage["parts"][number]) {
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

function isApprovalRequestedToolPart(
  part: UIMessage["parts"][number],
): part is Extract<UIMessage["parts"][number], { approval: { id: string } }> {
  return isToolUIPart(part) && part.state === "approval-requested";
}

function getApprovalCardContent(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part) || part.state !== "approval-requested") {
    return null;
  }

  const toolName = getToolName(part);

  switch (toolName) {
    case "submit_my_time_off_request": {
      const i = part.input as SubmitTimeOffInput;
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest.title,
        description: `${leaveTypeLabel(i.leaveType)} from ${i.startDate ?? "—"} to ${i.endDate ?? "—"}${i.reason ? `. Reason: ${i.reason}.` : "."}`,
        confirmLabel: CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest.confirmLabel,
        cancelLabel: CHAT_TRANSCRIPT_COPY.toolApproval.submitRequest.cancelLabel,
      };
    }
    case "cancel_my_time_off_request": {
      const i = part.input as CancelTimeOffInput;
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.title,
        description: `${CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.descriptionPrefix} ${i.requestQuery ?? CHAT_TRANSCRIPT_COPY.toolApproval.selectedRequestFallback}.`,
        confirmLabel: CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.confirmLabel,
        cancelLabel: CHAT_TRANSCRIPT_COPY.toolApproval.cancelRequest.cancelLabel,
      };
    }
    case "approve_team_time_off_request": {
      const i = part.input as ApproveTeamRequestInput;
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.title,
        description: `${CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.descriptionPrefix} ${i.requestQuery ?? CHAT_TRANSCRIPT_COPY.toolApproval.selectedRequestFallback}${i.comment ? `. ${CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.commentLabel} ${i.comment}.` : "."}`,
        confirmLabel: CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.confirmLabel,
        cancelLabel: CHAT_TRANSCRIPT_COPY.toolApproval.approveRequest.cancelLabel,
      };
    }
    case "reject_team_time_off_request": {
      const i = part.input as RejectTeamRequestInput;
      return {
        title: CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.title,
        description: `${CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.descriptionPrefix} ${i.requestQuery ?? CHAT_TRANSCRIPT_COPY.toolApproval.selectedRequestFallback}${i.comment ? `. ${CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.reasonLabel} ${i.comment}.` : "."}`,
        confirmLabel: CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.confirmLabel,
        cancelLabel: CHAT_TRANSCRIPT_COPY.toolApproval.rejectRequest.cancelLabel,
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

function getToolStatusCopy(part: UIMessage["parts"][number]) {
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
      return {
        tone: "error" as const,
        text: part.errorText || `${shortLabel} ${CHAT_TRANSCRIPT_COPY.toolStatus.failedSuffix}`,
      };
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

type ToolOutputTableModel = {
  id: string;
  title: string;
  columns: ToolOutputTableColumn[];
  rows: ToolOutputTableRow[];
  rowActions?: ToolOutputTableAction[][];
  rowActionSummaries?: string[];
  emptyLabel: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord | null {
  return isRecord(value) ? value : null;
}

function asRecordArray(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function asOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asString(value: unknown, fallback = "—") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = "—") {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : fallback;
}


function formatStatus(status: string) {
  if (!status) return "—";
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderLeaveTypeChip(label: string) {
  return <Badge variant="info" className="px-2.5 py-0.5 text-xs">{label}</Badge>;
}

function compactLeaveTypeLabel(label: string) {
  const normalized = label.trim();
  if (!normalized) return "—";

  return normalized.replace(/\s+leave$/i, "");
}

function renderStatusChip(status: string) {
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

function renderEmployeeCell(request: UnknownRecord) {
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
        className="ring-white/15"
      />

      <div className="min-w-0">
        <p className="whitespace-nowrap font-dm-sans text-sm font-semibold leading-[1.25] text-white/92">
          {employeeName}
        </p>
        {employeeTeam ? (
          <p className="mt-0.5 whitespace-nowrap font-dm-sans text-xs leading-[1.25] text-white/60">
            {employeeTeam}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function normalizeRequestStatus(status: unknown) {
  return asString(status, "").trim().toLowerCase();
}

function buildRequestQueryText(request: UnknownRecord) {
  const leaveType = compactLeaveTypeLabel(
    asString(request.leaveTypeLabel, asString(request.leaveType, "")),
  );

  const startDate = asOptionalString(request.startDate)?.trim();
  const endDate = asOptionalString(request.endDate)?.trim();
  const datePart = startDate && endDate && startDate !== endDate
    ? `${startDate} ${endDate}`
    : startDate || endDate || null;

  const parts = [
    asOptionalString(request.employeeName)?.trim(),
    leaveType && leaveType !== "—" ? leaveType : null,
    datePart,
  ].filter((part): part is string => Boolean(part));

  return parts.join(" ").trim();
}

function getRequestRowSummary(request: UnknownRecord) {
  const employeeName = asOptionalString(request.employeeName)?.trim();
  const leaveType = compactLeaveTypeLabel(
    asString(request.leaveTypeLabel, asString(request.leaveType, "")),
  );
  const dateRange = formatHumanDateRange(
    asString(request.startDate, ""),
    asString(request.endDate, ""),
  );

  return [employeeName, leaveType && leaveType !== "—" ? leaveType : null, dateRange]
    .filter((part): part is string => Boolean(part))
    .join(" • ");
}

function getBalanceRowSummary(balance: UnknownRecord) {
  const leaveType = compactLeaveTypeLabel(
    leaveTypeLabel(asString(balance.leaveType, "annual")),
  );
  const remaining = asNumber(balance.remaining, "");

  return remaining
    ? `${leaveType} • Remaining ${remaining}`
    : leaveType;
}

function isFutureOrTodayDate(dateStr: unknown): boolean {
  if (typeof dateStr !== "string" || !dateStr.trim()) return false;
  const start = parseIsoDateUtc(dateStr.trim());
  if (!start) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return start >= today;
}

function buildSelfCancelPrompt(request: UnknownRecord): string {
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

function getSelfRequestRowActions(request: UnknownRecord): ToolOutputTableAction[] {
  const status = normalizeRequestStatus(request.status);

  if (status !== "approved" && status !== "pending") {
    return [];
  }

  if (!isFutureOrTodayDate(request.startDate)) {
    return [];
  }

  const prompt = buildSelfCancelPrompt(request)
    || "I want to cancel one of my requests. Could you list my cancellable requests so I can choose one?";

  return [
    {
      label: "Cancel request",
      prompt,
      tone: "danger",
    },
  ];
}

function getTeamRequestRowActions(request: UnknownRecord): ToolOutputTableAction[] {
  const status = normalizeRequestStatus(request.status);
  const requestQuery = buildRequestQueryText(request);

  if (status === "pending") {
    return [
      {
        label: "Approve",
        prompt: requestQuery
          ? `Approve this pending team request: ${requestQuery}. Comment: Approved.`
          : "Please approve the selected pending team request. Ask me for missing request details before continuing.",
        tone: "success",
      },
      {
        label: "Reject",
        prompt: requestQuery
          ? `Reject this pending team request: ${requestQuery}.`
          : "Please reject the selected pending team request. Ask me for a short rejection reason and any missing request details before continuing.",
        tone: "danger",
      },
    ];
  }

  if (status === "approved") {
    return [
      {
        label: "Reject",
        prompt: requestQuery
          ? `Reject this approved team request: ${requestQuery}.`
          : "Please reject the selected approved team request. Ask me for a short rejection reason and any missing request details before continuing.",
        tone: "danger",
      },
    ];
  }

  return [];
}

function getBalanceRowActions(balance: UnknownRecord): ToolOutputTableAction[] {
  const leaveType = asOptionalString(balance.leaveType)?.trim().toLowerCase();
  if (!leaveType) {
    return [];
  }

  return [
    {
      label: "Request this type",
      prompt: `I want to submit a ${leaveType} time-off request.`,
      tone: "success",
    },
  ];
}

function getMemberRowActions(member: UnknownRecord): ToolOutputTableAction[] {
  const employeeName = asOptionalString(member.employeeName)?.trim();
  if (!employeeName) return [];

  const pendingCount = typeof member.pendingCount === "number" ? member.pendingCount : 0;
  const actions: ToolOutputTableAction[] = [];

  if (pendingCount > 0) {
    actions.push({
      label: "View pending",
      prompt: `Show ${employeeName}'s pending time-off requests.`,
      tone: "neutral",
    });
  }

  actions.push({
    label: "View all",
    prompt: `Show all time-off requests for ${employeeName}.`,
    tone: "neutral",
  });

  return actions;
}

function getMemberRowSummary(member: UnknownRecord) {
  return asOptionalString(member.employeeName)?.trim() ?? "";
}

function buildMembersTableModel(params: {
  id: string;
  title: string;
  memberRows: UnknownRecord[];
  emptyLabel: string;
}): ToolOutputTableModel | null {
  const { memberRows } = params;

  const columns: ToolOutputTableColumn[] = [
    { key: "employee", label: "Employee", className: "sm:pr-4" },
    { key: "pendingCount", label: "Pending", align: "center", className: "font-semibold tabular-nums" },
    { key: "approvedCount", label: "Approved", align: "center", className: "font-semibold tabular-nums" },
    { key: "cancelledCount", label: "Cancelled", align: "center", className: "font-semibold tabular-nums" },
    { key: "totalCount", label: "Total", align: "center", className: "font-semibold tabular-nums" },
  ];

  const rows = memberRows.map((member) => ({
    employee: renderEmployeeCell(member),
    pendingCount: asNumber(member.pendingCount, "0"),
    approvedCount: asNumber(member.approvedCount, "0"),
    cancelledCount: asNumber(member.cancelledCount, "0"),
    totalCount: asNumber(member.totalCount, "0"),
  }));

  const rowActions = memberRows.map((member) => getMemberRowActions(member));
  const rowActionSummaries = memberRows.map((member) => getMemberRowSummary(member));

  return {
    id: params.id,
    title: params.title,
    columns,
    rows,
    rowActions,
    rowActionSummaries,
    emptyLabel: params.emptyLabel,
  };
}

function getRequestRowActionBuilder(toolName: string | null) {
  switch (toolName) {
    case "list_team_time_off_requests":
    case "approve_team_time_off_request":
    case "reject_team_time_off_request":
      return getTeamRequestRowActions;
    case "list_my_time_off_requests":
    case "get_my_time_off_balance":
    case "submit_my_time_off_request":
    case "cancel_my_time_off_request":
      return getSelfRequestRowActions;
    default:
      return (request: UnknownRecord) => {
        const hasEmployee = Boolean(asOptionalString(request.employeeName)?.trim());
        return hasEmployee
          ? getTeamRequestRowActions(request)
          : getSelfRequestRowActions(request);
      };
  }
}

function getRequestTableModel(params: {
  id: string;
  title: string;
  payload: UnknownRecord;
  showEmployee: boolean;
  emptyLabel: string;
  getRowActions?: (request: UnknownRecord) => ToolOutputTableAction[];
}): ToolOutputTableModel | null {
  if (!Array.isArray(params.payload.requests)) {
    return null;
  }

  const columns: ToolOutputTableColumn[] = params.showEmployee
    ? [
        { key: "employee", label: "Employee", className: "sm:pr-4" },
        { key: "leaveType", label: "Leave type", align: "center" },
        {
          key: "dateRange",
          label: "Date range",
          align: "center",
          className: "whitespace-nowrap",
        },
        {
          key: "days",
          label: "Days",
          align: "center",
          className: "font-semibold tabular-nums",
        },
        { key: "status", label: "Status", align: "center" },
      ]
    : [
        { key: "leaveType", label: "Leave type", align: "center" },
        {
          key: "dateRange",
          label: "Date range",
          align: "center",
          className: "whitespace-nowrap",
        },
        {
          key: "days",
          label: "Days",
          align: "center",
          className: "font-semibold tabular-nums",
        },
        { key: "status", label: "Status", align: "center" },
      ];

  const requestRows = asRecordArray(params.payload.requests);
  const rows = requestRows.map((request) => {
    const row: ToolOutputTableRow = {
      leaveType: renderLeaveTypeChip(
        compactLeaveTypeLabel(
          asString(request.leaveTypeLabel, asString(request.leaveType)),
        ),
      ),
      dateRange: formatHumanDateRange(
        asString(request.startDate, ""),
        asString(request.endDate, ""),
      ),
      days: asNumber(request.days),
      status: renderStatusChip(asString(request.status, "")),
    };

    if (params.showEmployee) {
      row.employee = renderEmployeeCell(request);
    }

    return row;
  });

  const rowActions = params.getRowActions
    ? requestRows.map((request) => params.getRowActions?.(request) ?? [])
    : undefined;
  const rowActionSummaries = rowActions
    ? requestRows.map((request) => getRequestRowSummary(request))
    : undefined;

  return {
    id: params.id,
    title: params.title,
    columns,
    rows,
    rowActions,
    rowActionSummaries,
    emptyLabel: params.emptyLabel,
  };
}

function getBalanceTableModel(params: {
  id: string;
  title: string;
  payload: UnknownRecord;
  emptyLabel: string;
  getRowActions?: (balance: UnknownRecord) => ToolOutputTableAction[];
}): ToolOutputTableModel | null {
  if (!Array.isArray(params.payload.balances)) {
    return null;
  }

  const columns: ToolOutputTableColumn[] = [
    { key: "leaveType", label: "Leave type", align: "center" },
    {
      key: "allowance",
      label: "Allowance",
      align: "center",
      className: "font-semibold tabular-nums",
    },
    {
      key: "used",
      label: "Used",
      align: "center",
      className: "font-semibold tabular-nums",
    },
    {
      key: "pending",
      label: "Pending",
      align: "center",
      className: "font-semibold tabular-nums",
    },
    {
      key: "remaining",
      label: "Remaining",
      align: "center",
      className: "font-semibold tabular-nums",
    },
  ];

  const balanceRows = asRecordArray(params.payload.balances);
  const rows = balanceRows.map((balance) => ({
    leaveType: renderLeaveTypeChip(
      compactLeaveTypeLabel(leaveTypeLabel(asString(balance.leaveType, "annual"))),
    ),
    allowance: asNumber(balance.allowance),
    used: asNumber(balance.used),
    pending: asNumber(balance.pending),
    remaining: asNumber(balance.remaining),
  }));

  const rowActions = params.getRowActions
    ? balanceRows.map((balance) => params.getRowActions?.(balance) ?? [])
    : undefined;
  const rowActionSummaries = rowActions
    ? balanceRows.map((balance) => getBalanceRowSummary(balance))
    : undefined;

  return {
    id: params.id,
    title: params.title,
    columns,
    rows,
    rowActions,
    rowActionSummaries,
    emptyLabel: params.emptyLabel,
  };
}

type RecordCollection = {
  path: string[];
  rows: UnknownRecord[];
};

const GENERIC_TABLE_TITLE_BY_KEY: Record<string, string> = {
  balances: "Leave balance",
  upcomingrequests: "Upcoming requests",
  teamrequests: "Team requests",
  requests: "Requests",
  matches: "Matching requests",
  conflictingrequests: "Conflicting requests",
  records: "Records",
  items: "Items",
  rows: "Rows",
  results: "Results",
};

const GENERIC_COLUMN_LABEL_BY_KEY: Record<string, string> = {
  id: "ID",
  employeeId: "Employee ID",
  requestId: "Request ID",
  leaveType: "Leave type",
  leaveTypeLabel: "Leave type",
  dateRange: "Date range",
};

const GENERIC_NUMERIC_COLUMN_KEY_REGEX =
  /(^|_)(count|total|days?|allowance|used|pending|remaining|hours?)$/i;
const STRUCTURAL_COLLECTION_KEYS = new Set([
  "records",
  "items",
  "rows",
  "results",
  "data",
  "list",
]);

function toKebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function toComparableKey(value: string) {
  return value.replace(/[_\-\s]/g, "").toLowerCase();
}

function toHumanLabel(value: string) {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "Records";
  }

  return words
    .map((word) =>
      word.toLowerCase() === "id"
        ? "ID"
        : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
    )
    .join(" ");
}

function getCollectionTitle(path: string[], toolName: string | null) {
  if (path.length === 0) {
    return getFriendlyToolLabelByName(toolName);
  }

  const leaf = path[path.length - 1] ?? "records";
  const parent = path[path.length - 2] ?? "";
  const leafComparable = toComparableKey(leaf);

  if (
    STRUCTURAL_COLLECTION_KEYS.has(leafComparable) &&
    parent.length > 0
  ) {
    return toHumanLabel(parent);
  }

  if (
    leafComparable === "requests" &&
    path.some((segment) => toComparableKey(segment).includes("team"))
  ) {
    return "Team requests";
  }

  if (
    leafComparable === "requests" &&
    path.some((segment) => toComparableKey(segment).includes("upcoming"))
  ) {
    return "Upcoming requests";
  }

  return GENERIC_TABLE_TITLE_BY_KEY[leafComparable] ?? toHumanLabel(leaf);
}

function getCollectionId(path: string[], toolName: string | null) {
  const segments = path.length > 0 ? path : [toolName ?? "records"];
  const id = segments.map((segment) => toKebabCase(segment)).join("-");

  return id.length > 0 ? id : "records";
}

function collectRecordCollections(
  value: unknown,
  path: string[] = [],
  depth = 0,
): RecordCollection[] {
  if (depth > 5 || value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    const rows = value.filter(isRecord);

    if (rows.length > 0 && rows.length === value.length) {
      return [{ path, rows }];
    }

    return [];
  }

  const record = asRecord(value);
  if (!record) {
    return [];
  }

  return Object.entries(record).flatMap(([key, nestedValue]) =>
    collectRecordCollections(nestedValue, [...path, key], depth + 1),
  );
}

function isPrimitiveValue(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function canRenderCellValue(value: unknown) {
  if (isPrimitiveValue(value)) return true;
  return Array.isArray(value) && value.every((item) => isPrimitiveValue(item));
}

function hasRenderableColumnValue(rows: UnknownRecord[], key: string) {
  return rows.some((row) => {
    const value = row[key];
    if (value === undefined || value === null || value === "") {
      return false;
    }

    return canRenderCellValue(value);
  });
}

function isNumericColumn(rows: UnknownRecord[], key: string) {
  if (GENERIC_NUMERIC_COLUMN_KEY_REGEX.test(key)) {
    return true;
  }

  const values = rows
    .map((row) => row[key])
    .filter((value) => value !== null && value !== undefined && value !== "");

  if (values.length === 0) {
    return false;
  }

  return values.every((value) => typeof value === "number" && Number.isFinite(value));
}

function formatGenericCellValue(value: unknown, key: string) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();
    if (!normalizedValue) return "—";

    if (key.toLowerCase().endsWith("date")) {
      const parsedDate = parseIsoDateUtc(normalizedValue);
      if (parsedDate) {
        return formatDateWithYear(parsedDate);
      }
    }

    return normalizedValue;
  }

  if (Array.isArray(value)) {
    const primitiveItems = value.filter((item) => isPrimitiveValue(item));
    if (primitiveItems.length === value.length) {
      const joinedValue = primitiveItems
        .map((item) => (item === null ? "—" : String(item)))
        .join(", ");

      return joinedValue.length > 0 ? joinedValue : "—";
    }
  }

  return "—";
}

function isBalanceLikeRecord(row: UnknownRecord) {
  return (
    "leaveType" in row &&
    "allowance" in row &&
    "used" in row &&
    "pending" in row &&
    "remaining" in row
  );
}

function isRequestLikeRecord(row: UnknownRecord) {
  const hasLeaveType = "leaveType" in row || "leaveTypeLabel" in row;
  const hasDateRange = "dateRange" in row || "startDate" in row || "endDate" in row;
  const hasStatus = "status" in row;

  return hasLeaveType && hasDateRange && hasStatus;
}

function getGenericTableModel(params: {
  id: string;
  title: string;
  rows: UnknownRecord[];
  emptyLabel: string;
}): ToolOutputTableModel | null {
  const discoveredKeys: string[] = [];

  for (const row of params.rows) {
    for (const key of Object.keys(row)) {
      if (!discoveredKeys.includes(key)) {
        discoveredKeys.push(key);
      }
    }
  }

  if (discoveredKeys.length === 0) {
    return null;
  }

  const selectedKeys: string[] = [];
  const includeEmployeeColumn = discoveredKeys.includes("employeeName");
  const includeLeaveTypeColumn =
    discoveredKeys.includes("leaveType") || discoveredKeys.includes("leaveTypeLabel");
  const includeDateRangeColumn =
    discoveredKeys.includes("dateRange") ||
    discoveredKeys.includes("startDate") ||
    discoveredKeys.includes("endDate");

  if (includeEmployeeColumn) selectedKeys.push("employee");
  if (includeLeaveTypeColumn) {
    selectedKeys.push(discoveredKeys.includes("leaveType") ? "leaveType" : "leaveTypeLabel");
  }
  if (includeDateRangeColumn) selectedKeys.push("dateRange");
  if (discoveredKeys.includes("status")) selectedKeys.push("status");

  const excludedKeys = new Set<string>();
  if (includeEmployeeColumn) {
    excludedKeys.add("employeeName");
    excludedKeys.add("employeeAvatar");
    excludedKeys.add("team");
  }
  if (includeLeaveTypeColumn && discoveredKeys.includes("leaveType")) {
    excludedKeys.add("leaveTypeLabel");
  }
  if (includeDateRangeColumn) {
    excludedKeys.add("startDate");
    excludedKeys.add("endDate");
    excludedKeys.add("dateRange");
  }

  for (const key of discoveredKeys) {
    if (selectedKeys.includes(key) || excludedKeys.has(key)) continue;
    if (!hasRenderableColumnValue(params.rows, key)) continue;
    selectedKeys.push(key);
  }

  if (selectedKeys.length === 0) {
    return null;
  }

  const columns: ToolOutputTableColumn[] = selectedKeys.map((key) => {
    if (key === "employee") {
      return { key, label: "Employee" };
    }

    if (key === "dateRange") {
      return { key, label: "Date range", className: "whitespace-nowrap" };
    }

    if (key === "status") {
      return { key, label: "Status", className: "sm:pl-2" };
    }

    const align = isNumericColumn(params.rows, key)
      ? ("center" as const)
      : ("left" as const);
    const className = isNumericColumn(params.rows, key)
      ? "font-semibold tabular-nums"
      : undefined;

    return {
      key,
      label: GENERIC_COLUMN_LABEL_BY_KEY[key] ?? toHumanLabel(key),
      align,
      className,
    };
  });

  const rows = params.rows.map((row) => {
    const tableRow: ToolOutputTableRow = {};

    for (const key of selectedKeys) {
      if (key === "employee") {
        tableRow[key] = renderEmployeeCell(row);
        continue;
      }

      if (key === "leaveType" || key === "leaveTypeLabel") {
        const leaveType = asString(
          row.leaveTypeLabel,
          asString(row.leaveType, asString(row.leaveTypeLabel)),
        );
        tableRow[key] = renderLeaveTypeChip(compactLeaveTypeLabel(leaveType));
        continue;
      }

      if (key === "dateRange") {
        const explicitDateRange = asOptionalString(row.dateRange)?.trim();
        tableRow[key] = explicitDateRange
          ? explicitDateRange
          : formatHumanDateRange(asString(row.startDate, ""), asString(row.endDate, ""));
        continue;
      }

      if (key === "status") {
        tableRow[key] = renderStatusChip(asString(row.status, ""));
        continue;
      }

      tableRow[key] = formatGenericCellValue(row[key], key);
    }

    return tableRow;
  });

  return {
    id: params.id,
    title: params.title,
    columns,
    rows,
    emptyLabel: params.emptyLabel,
  };
}

function getDynamicToolOutputTables(output: unknown, toolName: string | null) {
  const collections = collectRecordCollections(output);
  if (collections.length === 0) {
    return [] as ToolOutputTableModel[];
  }

  const idCollisionCount = new Map<string, number>();

  return collections
    .map((collection, index) => {
      const baseId = getCollectionId(collection.path, toolName);
      const collisionCount = idCollisionCount.get(baseId) ?? 0;
      idCollisionCount.set(baseId, collisionCount + 1);

      const id =
        collisionCount === 0 ? baseId : `${baseId}-${collisionCount + 1}`;
      const title = getCollectionTitle(collection.path, toolName);
      const rows = collection.rows;

      if (rows.every(isBalanceLikeRecord)) {
        return getBalanceTableModel({
          id,
          title,
          payload: { balances: rows },
          getRowActions: getBalanceRowActions,
          emptyLabel: "No records found.",
        });
      }

      if (rows.every(isRequestLikeRecord)) {
        return getRequestTableModel({
          id,
          title,
          payload: { requests: rows },
          showEmployee: rows.some((row) => Boolean(asOptionalString(row.employeeName))),
          getRowActions: getRequestRowActionBuilder(toolName),
          emptyLabel: "No records found.",
        });
      }

      return getGenericTableModel({
        id,
        title: title || `${getFriendlyToolLabelByName(toolName)} ${index + 1}`,
        rows,
        emptyLabel: "No records found.",
      });
    })
    .filter((table): table is ToolOutputTableModel => table !== null);
}

function getToolOutputTables(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part) || part.state !== "output-available" || part.preliminary) {
    return [] as ToolOutputTableModel[];
  }

  const toolName = getToolName(part);
  const output = asRecord(part.output);
  const dynamicTables = getDynamicToolOutputTables(part.output, toolName);

  if (!toolName) {
    return dynamicTables;
  }

  if (!output) {
    return dynamicTables;
  }

  switch (toolName) {
    case "list_employees": {
      const table = buildMembersTableModel({
        id: "all-employees",
        title: "Project members",
        memberRows: asRecordArray(output.employees),
        emptyLabel: "No employees found.",
      });
      return table ? [table] : dynamicTables;
    }

    case "list_team_members": {
      const table = buildMembersTableModel({
        id: "team-members",
        title: "Team members",
        memberRows: asRecordArray(output.members),
        emptyLabel: "No team members found.",
      });
      return table ? [table] : dynamicTables;
    }

    case "list_my_time_off_requests": {
      const requests = getRequestTableModel({
        id: "my-time-off-requests",
        title: "My time-off requests",
        payload: output,
        showEmployee: false,
        getRowActions: getSelfRequestRowActions,
        emptyLabel: "No time-off requests found.",
      });
      return requests ? [requests] : dynamicTables;
    }

    case "list_team_time_off_requests": {
      const requests = getRequestTableModel({
        id: "team-time-off-requests",
        title: "Team time-off requests",
        payload: output,
        showEmployee: true,
        getRowActions: getTeamRequestRowActions,
        emptyLabel: "No team requests found.",
      });
      return requests ? [requests] : dynamicTables;
    }

    case "get_my_time_off_balance": {
      const tables = [
        getBalanceTableModel({
          id: "my-time-off-balance",
          title: "My leave balance",
          payload: output,
          getRowActions: getBalanceRowActions,
          emptyLabel: "No balance data found.",
        }),
        getRequestTableModel({
          id: "my-upcoming-requests",
          title: "Upcoming requests",
          payload: {
            requests: output.upcomingRequests,
          },
          showEmployee: false,
          getRowActions: getSelfRequestRowActions,
          emptyLabel: "No upcoming requests.",
        }),
      ].filter((table): table is ToolOutputTableModel => table !== null);

      return tables.length > 0 ? tables : dynamicTables;
    }

    case "submit_my_time_off_request": {
      const balance = asRecord(output.balance);
      if (!balance) return dynamicTables;

      const tables = [
        getBalanceTableModel({
          id: "updated-time-off-balance",
          title: "Updated leave balance",
          payload: balance,
          getRowActions: getBalanceRowActions,
          emptyLabel: "No balance data found.",
        }),
        getRequestTableModel({
          id: "updated-upcoming-requests",
          title: "Upcoming requests",
          payload: {
            requests: balance.upcomingRequests,
          },
          showEmployee: false,
          getRowActions: getSelfRequestRowActions,
          emptyLabel: "No upcoming requests.",
        }),
      ].filter((table): table is ToolOutputTableModel => table !== null);

      return tables.length > 0 ? tables : dynamicTables;
    }

    case "cancel_my_time_off_request": {
      const requests = asRecord(output.requests);
      if (!requests) return dynamicTables;

      const table = getRequestTableModel({
        id: "my-time-off-requests",
        title: "My time-off requests",
        payload: requests,
        showEmployee: false,
        getRowActions: getSelfRequestRowActions,
        emptyLabel: "No time-off requests found.",
      });
      return table ? [table] : dynamicTables;
    }

    case "approve_team_time_off_request":
    case "reject_team_time_off_request": {
      const teamRequests = asRecord(output.teamRequests);
      if (!teamRequests) return dynamicTables;

      const requests = getRequestTableModel({
        id: "pending-team-time-off-requests",
        title: "Pending team requests",
        payload: teamRequests,
        showEmployee: true,
        getRowActions: getTeamRequestRowActions,
        emptyLabel: "No pending team requests.",
      });
      return requests ? [requests] : dynamicTables;
    }

    default:
      return dynamicTables;
  }
}

type MutationSuccessCard = {
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

function getMutationSuccessCard(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part) || part.state !== "output-available" || part.preliminary) {
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
  if (toolName === "approve_team_time_off_request") title = "Request approved";
  else if (toolName === "reject_team_time_off_request") title = "Request rejected";
  else if (toolName === "cancel_my_time_off_request") title = "Request cancelled";
  else if (toolName === "submit_my_time_off_request") title = "Request submitted";
  else return null;

  const employeeName = asString(request.employeeName, "Employee");
  const employeeAvatar = asOptionalString(request.employeeAvatar)?.trim() || undefined;
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
  const reviewComment = asOptionalString(request.reviewComment)?.trim() || undefined;

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

const BULLET_LIST_LINE_REGEX = /^[-*•]\s+/;
const MARKDOWN_TABLE_LINE_REGEX = /^\|.*\|\s*$/;
const PIPE_SEPARATED_ROW_LINE_REGEX = /^(?:\|?\s*[^|]+\s*\|){2,}\s*[^|]+\|?\s*$/;

function splitParagraphs(text: string) {
  const byBlankLine = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (byBlankLine.length > 1) {
    return byBlankLine;
  }

  return text
    .split(/\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function stripRedundantStructuredListText(text: string) {
  const sanitized = text
    .split(/\r?\n/)
    .filter((line) => {
      const trimmedLine = line.trim();
      return (
        !BULLET_LIST_LINE_REGEX.test(trimmedLine) &&
        !MARKDOWN_TABLE_LINE_REGEX.test(trimmedLine) &&
        !PIPE_SEPARATED_ROW_LINE_REGEX.test(trimmedLine)
      );
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return sanitized;
}

const FOLLOW_UP_LINE_START_REGEX =
  /^(which|what|would|do|does|did|is|are|can|could|shall|should|let me know|feel free|if you need|if you'd like|i will|next|please let me know)\b/i;
const FOLLOW_UP_LINE_CONTAINS_REGEX =
  /\b(let me know|if you need|if you'd like|anything else|next page|would you like|please specify)\b/i;

function isLikelyFollowUpParagraph(paragraph: string) {
  const normalizedParagraph = paragraph.trim();

  if (normalizedParagraph.length === 0) {
    return false;
  }

  return (
    normalizedParagraph.endsWith("?") ||
    FOLLOW_UP_LINE_START_REGEX.test(normalizedParagraph) ||
    FOLLOW_UP_LINE_CONTAINS_REGEX.test(normalizedParagraph)
  );
}

const TABLE_LEAD_IN_PARAGRAPH_REGEX =
  /\b(here\s+(?:is|are)|i\s+(?:found|pulled|listed)|below|following)\b/i;
const TABLE_POST_NOTE_PARAGRAPH_REGEX =
  /\b(please\s+review|take\s+(?:appropriate|any\s+necessary)\s+action|let\s+me\s+know|if\s+you\s+need|if\s+you'?d\s+like|anything\s+else|next\s+step)\b/i;

function isLikelyTableLeadInParagraph(paragraph: string) {
  const normalized = paragraph.trim();
  if (!normalized) return false;

  return (
    normalized.endsWith(":") ||
    TABLE_LEAD_IN_PARAGRAPH_REGEX.test(normalized)
  );
}

function isLikelyPostTableParagraph(paragraph: string) {
  const normalized = paragraph.trim();
  if (!normalized) return false;

  return (
    isLikelyFollowUpParagraph(normalized) ||
    TABLE_POST_NOTE_PARAGRAPH_REGEX.test(normalized)
  );
}

type TableTextPlacement = {
  beforeTables: string;
  afterTables: string | null;
};

function splitTextBeforeAndAfterTables(text: string): TableTextPlacement {
  if (!text.trim()) {
    return { beforeTables: "", afterTables: null };
  }

  const paragraphs = splitParagraphs(text);

  if (paragraphs.length < 2) {
    return { beforeTables: text, afterTables: null };
  }

  const [firstParagraph, ...remainingParagraphs] = paragraphs;
  const shouldPlaceAfterFirstParagraph =
    isLikelyTableLeadInParagraph(firstParagraph) &&
    remainingParagraphs.some((paragraph) =>
      isLikelyPostTableParagraph(paragraph),
    );

  if (shouldPlaceAfterFirstParagraph) {
    return {
      beforeTables: firstParagraph,
      afterTables: remainingParagraphs.join("\n\n"),
    };
  }

  // Find the last table lead-in paragraph anywhere (handles lead-ins that are
  // not the first paragraph, e.g. when preceded by a mutation confirmation).
  let lastLeadInIndex = -1;
  for (let i = 0; i < paragraphs.length - 1; i++) {
    if (isLikelyTableLeadInParagraph(paragraphs[i])) {
      lastLeadInIndex = i;
    }
  }

  if (lastLeadInIndex >= 0) {
    const afterText = paragraphs.slice(lastLeadInIndex + 1).join("\n\n");
    return {
      beforeTables: paragraphs.slice(0, lastLeadInIndex + 1).join("\n\n"),
      afterTables: afterText || null,
    };
  }

  const trailingFollowUpParagraphs: string[] = [];
  const leadingParagraphs = [...paragraphs];

  while (leadingParagraphs.length > 1) {
    const candidate = leadingParagraphs.at(-1);

    if (!candidate || !isLikelyFollowUpParagraph(candidate)) {
      break;
    }

    trailingFollowUpParagraphs.unshift(candidate);
    leadingParagraphs.pop();
  }

  if (trailingFollowUpParagraphs.length === 0) {
    return { beforeTables: text, afterTables: null };
  }

  return {
    beforeTables: leadingParagraphs.join("\n\n"),
    afterTables: trailingFollowUpParagraphs.join("\n\n"),
  };
}

function shouldUseTableLeadInLayout(tableIds: string[]) {
  const idSet = new Set(tableIds);

  const hasBalancePair =
    idSet.has("my-time-off-balance") && idSet.has("my-upcoming-requests");
  const hasUpdatedBalancePair =
    idSet.has("updated-time-off-balance") &&
    idSet.has("updated-upcoming-requests");

  return hasBalancePair || hasUpdatedBalancePair;
}

function getTableLeadInText(tableId: string, tableIds: string[]): string | null {
  const idSet = new Set(tableIds);

  const hasBalancePair =
    idSet.has("my-time-off-balance") && idSet.has("my-upcoming-requests");

  if (hasBalancePair) {
    if (tableId === "my-time-off-balance") {
      return "You have the following remaining leave days:";
    }

    if (tableId === "my-upcoming-requests") {
      return "Here is your upcoming request:";
    }
  }

  const hasUpdatedBalancePair =
    idSet.has("updated-time-off-balance") &&
    idSet.has("updated-upcoming-requests");

  if (hasUpdatedBalancePair) {
    if (tableId === "updated-time-off-balance") {
      return "Your remaining leave days are now:";
    }

    if (tableId === "updated-upcoming-requests") {
      return "Here is your upcoming request:";
    }
  }

  return null;
}

function normalizeComparableLine(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[:.]\s*$/g, "");
}

function getRenderedTableLeadIns(tableIds: string[]) {
  return tableIds
    .map((tableId) => getTableLeadInText(tableId, tableIds))
    .filter((line): line is string => Boolean(line));
}

function extractTableLeadInFollowUp(text: string, renderedLeadIns: string[]) {
  if (!text.trim()) return null;

  const suppressedLines = new Set(renderedLeadIns.map(normalizeComparableLine));

  const remainingLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) => !suppressedLines.has(normalizeComparableLine(line)),
    );

  const nonHeadingLines = remainingLines.filter((line) => !line.endsWith(":"));
  return nonHeadingLines.at(-1) ?? remainingLines.at(-1) ?? null;
}

function readMessageMeta(message: UIMessage) {
  if (!message.metadata || typeof message.metadata !== "object") {
    return null;
  }

  const metadata = message.metadata as Partial<MessageMetadata>;

  return {
    agent: metadata.agent ?? CHAT_TRANSCRIPT_COPY.defaultAgentName,
    agentLabel: metadata.agentLabel ?? CHAT_TRANSCRIPT_COPY.defaultAgentLabel,
  };
}

function getAssistantInitials(message: UIMessage) {
  const metadata = readMessageMeta(message);
  const badgeMap = CHAT_TRANSCRIPT_COPY.assistantBadgeByAgent;
  const agent = metadata?.agent;

  if (agent && agent in badgeMap) {
    return badgeMap[agent as keyof typeof badgeMap];
  }

  return badgeMap[CHAT_TRANSCRIPT_COPY.defaultAgentName];
}

type ChatTranscriptProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  messages: UIMessage[];
  isLoading: boolean;
  userAvatarUrl?: string;
  userAvatarLabel?: string;
  userInitials?: string;
  quickActions: QuickAction[];
  onSelectPrompt: (prompt: string) => void;
  onToolApproval: (id: string, approved: boolean) => void;
};

export function ChatTranscript({
  containerRef,
  messages,
  isLoading,
  userAvatarUrl,
  userAvatarLabel = "User avatar",
  userInitials = CHAT_TRANSCRIPT_COPY.userBadge,
  quickActions,
  onSelectPrompt,
  onToolApproval,
}: ChatTranscriptProps) {
  const lastMessage = messages.at(-1);

  return (
    <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      {messages.length === 0 ? (
        <ChatEmptyState quickActions={quickActions} onSelectPrompt={onSelectPrompt} />
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          {messages.map((message) => {
            const rawText = getTextParts(message).join("\n").trim();
            const toolParts = getToolParts(message);
            const isUser = message.role === "user";
            const isLastMessage = message.id === lastMessage?.id;
            const approvalParts = toolParts.filter(isApprovalRequestedToolPart);
            const outputTables = toolParts.flatMap((part, partIndex) =>
              getToolOutputTables(part).map((table) => ({
                ...table,
                key: `${message.id}-${part.toolCallId ?? partIndex}-${table.id}`,
              })),
            );
            const currentToolStep = [...toolParts]
              .reverse()
              .map((part) => getToolStepText(part))
              .find((step): step is string => Boolean(step));
            const thinkingLabel = currentToolStep ?? "Thinking";
            const shouldDeferOutputTables = !isUser && isLastMessage && isLoading;
            const visibleOutputTables = shouldDeferOutputTables
              ? []
              : outputTables.filter((table) => table.rows.length > 0);
            const embedOutputTablesInBubble = !isUser && visibleOutputTables.length > 0;
            const tableIds = visibleOutputTables.map((table) => table.id);
            const useTableLeadInLayout =
              !isUser && shouldUseTableLeadInLayout(tableIds);
            const renderedTableLeadIns = useTableLeadInLayout
              ? getRenderedTableLeadIns(tableIds)
              : [];
            const normalizedText =
              !isUser && visibleOutputTables.length > 0
                ? stripRedundantStructuredListText(rawText)
                : rawText;
            const tableLeadInFollowUp = useTableLeadInLayout
              ? extractTableLeadInFollowUp(normalizedText, renderedTableLeadIns)
              : null;
            const shouldSplitTextAroundTables =
              !isUser && visibleOutputTables.length > 0 && !useTableLeadInLayout;
            const textPlacement = useTableLeadInLayout
              ? { beforeTables: "", afterTables: tableLeadInFollowUp }
              : shouldSplitTextAroundTables
                ? splitTextBeforeAndAfterTables(normalizedText)
                : { beforeTables: normalizedText, afterTables: null };
            const text = textPlacement.beforeTables;
            const shouldShowThinkingSkeleton =
              !isUser &&
              isLastMessage &&
              isLoading &&
              text.length === 0 &&
              approvalParts.length === 0;
            const mutationSuccessCards = toolParts
              .map((part, partIndex) => {
                const success = getMutationSuccessCard(part);
                if (!success) return null;
                const card: MutationSuccessCard = {
                  ...success,
                  key: `${message.id}-success-${part.toolCallId ?? partIndex}`,
                };
                return card;
              })
              .filter((item): item is MutationSuccessCard => item !== null);
            const statusParts = toolParts
              .map((part) => getToolStatusCopy(part))
              .filter((item) => item !== null);
            const shouldRenderBubble = text.length > 0 || embedOutputTablesInBubble;

            // Render the rich success card content (reused in both split and single layouts).
            const successCardContent = mutationSuccessCards.map((card) => (
              <div
                key={card.key}
                className="w-fit max-w-full overflow-hidden rounded-xl border border-emerald-400/28 bg-emerald-500/6"
              >
                <div className="border-b border-emerald-400/20 bg-emerald-500/8 px-4 py-2">
                  <p className="font-dm-sans text-sm font-semibold text-emerald-100">
                    {card.title}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      variant="user"
                      src={card.employeeAvatar ?? getAvatarUrl(card.employeeName)}
                      alt={`${card.employeeName} avatar`}
                      initials={getInitialsFromName(card.employeeName)}
                      size="sm"
                      className="ring-emerald-400/20"
                    />
                    <div>
                      <p className="font-dm-sans text-sm font-semibold leading-tight text-emerald-100">
                        {card.employeeName}
                      </p>
                      {card.team ? (
                        <p className="font-dm-sans text-xs leading-tight text-emerald-100/60">
                          {card.team}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
                    <Badge variant="success" className="px-2.5 py-0.5 text-xs">
                      {card.leaveTypeLabel}
                    </Badge>
                    <span className="font-dm-sans text-xs text-emerald-100/80">
                      {card.dateRange}
                    </span>
                    <span className="font-dm-sans text-xs text-emerald-100/80">
                      {card.days} {card.days === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>
                {card.reviewComment ? (
                  <div className="border-t border-emerald-400/15 px-4 py-2">
                    <p className="font-dm-sans text-xs text-emerald-100/65">
                      Comment: {card.reviewComment}
                    </p>
                  </div>
                ) : null}
              </div>
            ));

            // The second part of the message: text bubble + table + status badges.
            const hasSecondContent =
              shouldRenderBubble ||
              shouldShowThinkingSkeleton ||
              approvalParts.length > 0 ||
              (!embedOutputTablesInBubble && visibleOutputTables.length > 0) ||
              statusParts.length > 0;

            const secondContent = (
              <>
                {shouldRenderBubble ? (
                  <MessageBubble
                    isUser={isUser}
                    text={text || undefined}
                    fullWidth={embedOutputTablesInBubble}
                  >
                    {embedOutputTablesInBubble ? (
                      <div className="space-y-3">
                        {visibleOutputTables.map((table) => (
                          <div key={table.key} className="space-y-2">
                            {useTableLeadInLayout ? (
                              <p className="font-dm-sans text-sm text-white/82">
                                {getTableLeadInText(table.id, tableIds)}
                              </p>
                            ) : null}
                            <ToolOutputTable
                              title={table.title}
                              columns={table.columns}
                              rows={table.rows}
                              rowActions={table.rowActions}
                              rowActionSummaries={table.rowActionSummaries}
                              onActionClick={onSelectPrompt}
                              disableActions={isLoading}
                              emptyLabel={table.emptyLabel}
                            />
                          </div>
                        ))}
                        {textPlacement.afterTables ? (
                          <p className="whitespace-pre-wrap font-dm-sans text-sm text-white/78">
                            {textPlacement.afterTables}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </MessageBubble>
                ) : null}

                {shouldShowThinkingSkeleton ? (
                  <LoadingIndicator
                    showAvatar={false}
                    label={thinkingLabel}
                    className="max-w-[72%]"
                  />
                ) : null}

                {approvalParts.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {approvalParts.map((part, index) => {
                      const content = getApprovalCardContent(part);

                      if (!content) {
                        return null;
                      }

                      return (
                        <ToolApprovalCard
                          key={`${message.id}-approval-${part.toolCallId ?? index}`}
                          title={content.title}
                          description={content.description}
                          confirmLabel={content.confirmLabel}
                          cancelLabel={content.cancelLabel}
                          onConfirm={() => onToolApproval(part.approval.id, true)}
                          onCancel={() => onToolApproval(part.approval.id, false)}
                        />
                      );
                    })}
                  </div>
                ) : null}

                {!embedOutputTablesInBubble && visibleOutputTables.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {visibleOutputTables.map((table) => (
                      <ToolOutputTable
                        key={table.key}
                        title={table.title}
                        columns={table.columns}
                        rows={table.rows}
                        rowActions={table.rowActions}
                        rowActionSummaries={table.rowActionSummaries}
                        onActionClick={onSelectPrompt}
                        disableActions={isLoading}
                        emptyLabel={table.emptyLabel}
                      />
                    ))}
                  </div>
                ) : null}

                {statusParts.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {statusParts.map((statusPart, index) => (
                      <Card
                        key={`${message.id}-status-${index}`}
                        className={`px-4 py-3 text-sm leading-relaxed ${TOOL_STATUS_TONE_CLASS[statusPart.tone]}`}
                      >
                        {statusPart.text}
                      </Card>
                    ))}
                  </div>
                ) : null}
              </>
            );

            // When a mutation success card exists alongside other content, render
            // two separate visual messages so the card and the follow-up text/table
            // appear as distinct chat bubbles.
            const shouldSplitMessage =
              !isUser && mutationSuccessCards.length > 0 && hasSecondContent;

            if (shouldSplitMessage) {
              return (
                <Fragment key={message.id}>
                  <article className="flex gap-3 justify-start">
                    <MessageAvatar
                      initials={getAssistantInitials(message)}
                      isUser={false}
                    />
                    <div className="min-w-0 max-w-full flex-1">
                      <div className="space-y-2">{successCardContent}</div>
                    </div>
                  </article>

                  <article className="flex gap-3 justify-start">
                    <MessageAvatar
                      initials={getAssistantInitials(message)}
                      isUser={false}
                    />
                    <div className="min-w-0 max-w-full flex-1">{secondContent}</div>
                  </article>
                </Fragment>
              );
            }

            return (
              <article
                key={message.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser ? (
                  <MessageAvatar
                    initials={getAssistantInitials(message)}
                    isUser={false}
                  />
                ) : null}

                <div className={`min-w-0 ${isUser ? "max-w-[85%]" : "max-w-full flex-1"}`}>
                  {mutationSuccessCards.length > 0 ? (
                    <div className="space-y-2">{successCardContent}</div>
                  ) : null}

                  {hasSecondContent ? (
                    <div className={mutationSuccessCards.length > 0 ? "mt-3" : undefined}>
                      {secondContent}
                    </div>
                  ) : null}
                </div>

                {isUser ? (
                  <MessageAvatar
                    initials={userInitials}
                    isUser={true}
                    avatarUrl={userAvatarUrl}
                    avatarLabel={userAvatarLabel}
                  />
                ) : null}
              </article>
            );
          })}

          {isLoading && lastMessage?.role === "user" ? (
            <LoadingIndicator label="Thinking" />
          ) : null}
        </div>
      )}
    </div>
  );
}
