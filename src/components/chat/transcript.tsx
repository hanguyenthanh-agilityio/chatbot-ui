import { isToolUIPart, type UIMessage } from "ai";
import type { RefObject } from "react";
import { AgentBadge } from "@/components/chat/agent-badge";
import { LoadingIndicator } from "@/components/chat/loading-indicator";
import { MessageAvatar, MessageBubble } from "@/components/chat/message-bubble";
import { ToolApprovalCard } from "@/components/chat/tool-approval-card";
import { ToolStatusBadge } from "@/components/chat/tool-status-badge";
import { ChatEmptyState } from "@/components/chat/empty-state";
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

function getInitials(message: UIMessage) {
  if (message.role !== "assistant") {
    return CHAT_TRANSCRIPT_COPY.userBadge;
  }

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
  quickActions: QuickAction[];
  onSelectPrompt: (prompt: string) => void;
  onToolApproval: (id: string, approved: boolean) => void;
};

export function ChatTranscript({
  containerRef,
  messages,
  isLoading,
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
            const agentMetadata = readMessageMeta(message);
            const approvalParts = toolParts.filter(isApprovalRequestedToolPart);
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
                  <MessageAvatar initials={getInitials(message)} isUser={false} />
                ) : null}

                <div className={`min-w-0 ${isUser ? "max-w-[85%]" : "max-w-full flex-1"}`}>
                  {!isUser && agentMetadata ? (
                    <div className="mb-2 flex items-center gap-2">
                      <AgentBadge label={agentMetadata.agentLabel} />
                    </div>
                  ) : null}

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
                          className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
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
                  <MessageAvatar initials={getInitials(message)} isUser={true} />
                ) : null}
              </article>
            );
          })}

          {isLoading && lastMessage?.role === "user" ? (
            <LoadingIndicator badge={CHAT_TRANSCRIPT_COPY.loadingBadge} />
          ) : null}
        </div>
      )}
    </div>
  );
}
