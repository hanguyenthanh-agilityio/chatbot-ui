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
import {
  CHAT_STREAMING_PLACEHOLDER_TEXT,
  CHAT_TRANSCRIPT_COPY,
} from "@/constants/chat";
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

function getToolLabel(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part)) return part.type;

  return part.type === "dynamic-tool"
    ? part.toolName
    : part.type.replace("tool-", "");
}

function getToolName(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part)) return null;

  return part.type === "dynamic-tool"
    ? part.toolName
    : part.type.replace("tool-", "");
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
  const shortLabel =
    toolName?.replaceAll("_", " ") ?? CHAT_TRANSCRIPT_COPY.toolFallbackLabel;

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
      return {
        tone: "success" as const,
        text: `${shortLabel} ${CHAT_TRANSCRIPT_COPY.toolStatus.completedSuffix}`,
      };
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

function formatDateRange(startDate: string, endDate: string) {
  if (!startDate && !endDate) return "—";
  if (!endDate || startDate === endDate) return startDate || endDate;
  if (!startDate) return endDate;
  return `${startDate} → ${endDate}`;
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
        size="md"
        className="ring-white/15"
      />

      <div className="min-w-0">
        <p className="truncate font-dm-sans text-sm font-semibold text-white/92">
          {employeeName}
        </p>
        {employeeTeam ? (
          <p className="truncate font-dm-sans text-xs text-white/55">
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
        { key: "employee", label: "Employee" },
        { key: "leaveType", label: "Leave type" },
        { key: "dateRange", label: "Date range" },
        {
          key: "days",
          label: "Days",
          align: "right",
          className: "font-semibold tabular-nums",
        },
        { key: "status", label: "Status" },
      ]
    : [
        { key: "leaveType", label: "Leave type" },
        { key: "dateRange", label: "Date range" },
        {
          key: "days",
          label: "Days",
          align: "right",
          className: "font-semibold tabular-nums",
        },
        { key: "status", label: "Status" },
      ];

  const rows = asRecordArray(params.payload.requests).map((request) => {
    const row: ToolOutputTableRow = {
      leaveType: renderLeaveTypeChip(
        asString(request.leaveTypeLabel, asString(request.leaveType)),
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
    { key: "leaveType", label: "Leave type" },
    {
      key: "allowance",
      label: "Allowance",
      align: "right",
      className: "font-semibold tabular-nums",
    },
    {
      key: "used",
      label: "Used",
      align: "right",
      className: "font-semibold tabular-nums",
    },
    {
      key: "pending",
      label: "Pending",
      align: "right",
      className: "font-semibold tabular-nums",
    },
    {
      key: "remaining",
      label: "Remaining",
      align: "right",
      className: "font-semibold tabular-nums",
    },
  ];

  const rows = asRecordArray(params.payload.balances).map((balance) => ({
    leaveType: renderLeaveTypeChip(
      leaveTypeLabel(asString(balance.leaveType, "annual")),
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

function getToolOutputTables(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part) || part.state !== "output-available" || part.preliminary) {
    return [] as ToolOutputTableModel[];
  }

  const toolName = getToolName(part);
  const output = asRecord(part.output);

  if (!toolName || !output) {
    return [] as ToolOutputTableModel[];
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
      return requests ? [requests] : [];
    }

    case "list_team_time_off_requests": {
      const requests = getRequestTableModel({
        id: "team-time-off-requests",
        title: "Team time-off requests",
        payload: output,
        showEmployee: true,
        emptyLabel: "No team requests found.",
      });
      return requests ? [requests] : [];
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

      return tables;
    }

    case "submit_my_time_off_request":
    case "cancel_my_time_off_request": {
      const balance = asRecord(output.balance);
      if (!balance) return [];

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

      return tables;
    }

    case "approve_team_time_off_request":
    case "reject_team_time_off_request": {
      const teamRequests = asRecord(output.teamRequests);
      if (!teamRequests) return [];

      const requests = getRequestTableModel({
        id: "pending-team-time-off-requests",
        title: "Pending team requests",
        payload: teamRequests,
        showEmployee: true,
        emptyLabel: "No pending team requests.",
      });
      return requests ? [requests] : [];
    }

    default:
      return [];
  }
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
            const text = getTextParts(message).join("\n").trim();
            const toolParts = getToolParts(message);
            const isUser = message.role === "user";
            const approvalParts = toolParts.filter(isApprovalRequestedToolPart);
            const outputTables = toolParts.flatMap((part, partIndex) =>
              getToolOutputTables(part).map((table) => ({
                ...table,
                key: `${message.id}-${part.toolCallId ?? partIndex}-${table.id}`,
              })),
            );
            const statusParts = toolParts
              .map((part) => getToolStatusCopy(part))
              .filter((item) => item !== null);
            const shouldRenderBubble =
              text.length > 0 || (message.role === "assistant" && toolParts.length === 0);

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
                      placeholder={text ? undefined : CHAT_STREAMING_PLACEHOLDER_TEXT}
                    />
                  ) : null}

                  {toolParts.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {toolParts.map((part, index) => (
                        <span
                          key={`${message.id}-${part.toolCallId ?? index}`}
                          className="font-dm-sans inline-flex rounded-full border border-white/10 bg-white/[.06] px-2.5 py-1 text-[11px] font-medium text-white/40"
                        >
                          {getToolLabel(part)}
                        </span>
                      ))}
                    </div>
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

                  {outputTables.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {outputTables.map((table) => (
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
            <LoadingIndicator />
          ) : null}
        </div>
      )}
    </div>
  );
}
