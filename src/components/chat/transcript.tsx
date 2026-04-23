import { isToolUIPart, type UIMessage } from "ai";
import type { RefObject } from "react";
import { LoadingIndicator } from "@/components/chat/loading-indicator";
import { MessageAvatar, MessageBubble } from "@/components/chat/message-bubble";
import { ToolApprovalCard } from "@/components/chat/tool-approval-card";
import {
  ToolOutputTable,
  type ToolOutputTableColumn,
  type ToolOutputTableRow,
} from "@/components/chat/tool-output-table";
import { ToolStatusBadge } from "@/components/chat/tool-status-badge";
import { ChatEmptyState } from "@/components/chat/empty-state";
import { UserAvatar } from "@/components/ui/user-avatar";
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

const TOOL_FRIENDLY_LABEL_BY_NAME: Record<string, string> = {
  get_my_time_off_balance: "My leave balance",
  list_my_time_off_requests: "My time-off requests",
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

const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_WITH_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const MONTH_DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function parseIsoDateUtc(value: string) {
  if (!ISO_DATE_ONLY_REGEX.test(value)) return null;

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function formatDateRange(startDate: string, endDate: string) {
  if (!startDate && !endDate) return "—";

  if (!startDate || !endDate) {
    const single = startDate || endDate;
    const parsed = parseIsoDateUtc(single);
    return parsed ? DATE_WITH_YEAR_FORMATTER.format(parsed) : single;
  }

  const parsedStart = parseIsoDateUtc(startDate);
  const parsedEnd = parseIsoDateUtc(endDate);

  if (!parsedStart || !parsedEnd) {
    return startDate === endDate ? startDate : `${startDate} → ${endDate}`;
  }

  if (startDate === endDate) {
    return DATE_WITH_YEAR_FORMATTER.format(parsedStart);
  }

  const sameYear = parsedStart.getUTCFullYear() === parsedEnd.getUTCFullYear();
  const sameMonth = sameYear && parsedStart.getUTCMonth() === parsedEnd.getUTCMonth();

  if (sameMonth) {
    return `${MONTH_DAY_FORMATTER.format(parsedStart)}–${parsedEnd.getUTCDate()}, ${parsedStart.getUTCFullYear()}`;
  }

  if (sameYear) {
    return `${MONTH_DAY_FORMATTER.format(parsedStart)} – ${MONTH_DAY_FORMATTER.format(parsedEnd)}, ${parsedStart.getUTCFullYear()}`;
  }

  return `${DATE_WITH_YEAR_FORMATTER.format(parsedStart)} – ${DATE_WITH_YEAR_FORMATTER.format(parsedEnd)}`;
}

function formatStatus(status: string) {
  if (!status) return "—";
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderLeaveTypeChip(label: string) {
  return (
    <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-medium text-cyan-100">
      {label}
    </span>
  );
}

function compactLeaveTypeLabel(label: string) {
  const normalized = label.trim();
  if (!normalized) return "—";

  return normalized.replace(/\s+leave$/i, "");
}

function renderStatusChip(status: string) {
  if (!status) return "—";

  const normalizedStatus = status.toLowerCase();
  const statusClass =
    normalizedStatus === "approved"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
      : normalizedStatus === "pending"
        ? "border-amber-300/35 bg-amber-500/15 text-amber-100"
        : normalizedStatus === "rejected"
          ? "border-rose-400/35 bg-rose-500/15 text-rose-100"
          : "border-white/20 bg-white/10 text-white/75";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
    >
      {formatStatus(status)}
    </span>
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
      <UserAvatar
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

function getRequestTableModel(params: {
  id: string;
  title: string;
  payload: UnknownRecord;
  showEmployee: boolean;
  emptyLabel: string;
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

  const rows = asRecordArray(params.payload.requests).map((request) => {
    const row: ToolOutputTableRow = {
      leaveType: renderLeaveTypeChip(
        compactLeaveTypeLabel(
          asString(request.leaveTypeLabel, asString(request.leaveType)),
        ),
      ),
      dateRange: formatDateRange(
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

  return {
    id: params.id,
    title: params.title,
    columns,
    rows,
    emptyLabel: params.emptyLabel,
  };
}

function getBalanceTableModel(params: {
  id: string;
  title: string;
  payload: UnknownRecord;
  emptyLabel: string;
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

  const rows = asRecordArray(params.payload.balances).map((balance) => ({
    leaveType: renderLeaveTypeChip(
      compactLeaveTypeLabel(leaveTypeLabel(asString(balance.leaveType, "annual"))),
    ),
    allowance: asNumber(balance.allowance),
    used: asNumber(balance.used),
    pending: asNumber(balance.pending),
    remaining: asNumber(balance.remaining),
  }));

  return {
    id: params.id,
    title: params.title,
    columns,
    rows,
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
        return DATE_WITH_YEAR_FORMATTER.format(parsedDate);
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
          : formatDateRange(asString(row.startDate, ""), asString(row.endDate, ""));
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
          emptyLabel: "No records found.",
        });
      }

      if (rows.every(isRequestLikeRecord)) {
        return getRequestTableModel({
          id,
          title,
          payload: { requests: rows },
          showEmployee: rows.some((row) => Boolean(asOptionalString(row.employeeName))),
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
    case "list_my_time_off_requests": {
      const requests = getRequestTableModel({
        id: "my-time-off-requests",
        title: "My time-off requests",
        payload: output,
        showEmployee: false,
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
          emptyLabel: "No balance data found.",
        }),
        getRequestTableModel({
          id: "my-upcoming-requests",
          title: "Upcoming requests",
          payload: {
            requests: output.upcomingRequests,
          },
          showEmployee: false,
          emptyLabel: "No upcoming requests.",
        }),
      ].filter((table): table is ToolOutputTableModel => table !== null);

      return tables.length > 0 ? tables : dynamicTables;
    }

    case "submit_my_time_off_request":
    case "cancel_my_time_off_request": {
      const balance = asRecord(output.balance);
      if (!balance) return dynamicTables;

      const tables = [
        getBalanceTableModel({
          id: "updated-time-off-balance",
          title: "Updated leave balance",
          payload: balance,
          emptyLabel: "No balance data found.",
        }),
        getRequestTableModel({
          id: "updated-upcoming-requests",
          title: "Upcoming requests",
          payload: {
            requests: balance.upcomingRequests,
          },
          showEmployee: false,
          emptyLabel: "No upcoming requests.",
        }),
      ].filter((table): table is ToolOutputTableModel => table !== null);

      return tables.length > 0 ? tables : dynamicTables;
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
        emptyLabel: "No pending team requests.",
      });
      return requests ? [requests] : dynamicTables;
    }

    default:
      return dynamicTables;
  }
}

const BULLET_LIST_LINE_REGEX = /^[-*•]\s+/;
const MARKDOWN_TABLE_LINE_REGEX = /^\|.*\|\s*$/;

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
        !MARKDOWN_TABLE_LINE_REGEX.test(trimmedLine)
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

type TableTextPlacement = {
  beforeTables: string;
  afterTables: string | null;
};

function splitTextBeforeAndAfterTables(text: string): TableTextPlacement {
  if (!text.trim()) {
    return {
      beforeTables: "",
      afterTables: null,
    };
  }

  const paragraphs = splitParagraphs(text);

  if (paragraphs.length < 2) {
    return {
      beforeTables: text,
      afterTables: null,
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
    return {
      beforeTables: text,
      afterTables: null,
    };
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
            const visibleOutputTables = shouldDeferOutputTables ? [] : outputTables;
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
            const statusParts = toolParts
              .map((part) => getToolStatusCopy(part))
              .filter((item) => item !== null);
            const shouldRenderBubble = text.length > 0 || embedOutputTablesInBubble;

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
                          emptyLabel={table.emptyLabel}
                        />
                      ))}
                    </div>
                  ) : null}

                  {statusParts.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {statusParts.map((statusPart, index) => (
                        <ToolStatusBadge
                          key={`${message.id}-status-${index}`}
                          text={statusPart.text}
                          tone={statusPart.tone}
                        />
                      ))}
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
