import { isToolUIPart, type UIMessage } from "ai";
import type { RefObject } from "react";
import { ChatEmptyState } from "@/components/time-off/chat-empty-state";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { STREAMING_PLACEHOLDER_TEXT } from "@/constants/ui";
import { getTextParts } from "@/utils/chat-message";
import { leaveTypeLabel } from "@/utils/leave-type";

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
  const input =
    part && typeof part.input === "object" && part.input
      ? (part.input as Record<string, unknown>)
      : {};

  switch (toolName) {
    case "submit_my_time_off_request":
      return {
        title: "Confirm time-off request",
        description: `${leaveTypeLabel(input.leaveType)} from ${String(input.startDate ?? "—")} to ${String(input.endDate ?? "—")}${input.reason ? `. Reason: ${String(input.reason)}.` : "."}`,
        confirmLabel: "Confirm request",
        cancelLabel: "Cancel",
      };
    case "cancel_my_time_off_request":
      return {
        title: "Confirm cancellation",
        description: `Cancel request: ${String(input.requestQuery ?? "selected request")}.`,
        confirmLabel: "Confirm cancel",
        cancelLabel: "Keep request",
      };
    case "approve_team_time_off_request":
      return {
        title: "Confirm approval",
        description: `Approve team request: ${String(input.requestQuery ?? "selected request")}${input.comment ? `. Comment: ${String(input.comment)}.` : "."}`,
        confirmLabel: "Confirm approve",
        cancelLabel: "Cancel",
      };
    case "reject_team_time_off_request":
      return {
        title: "Confirm rejection",
        description: `Reject team request: ${String(input.requestQuery ?? "selected request")}${input.comment ? `. Reason: ${String(input.comment)}.` : "."}`,
        confirmLabel: "Confirm reject",
        cancelLabel: "Cancel",
      };
    default:
      return {
        title: "Confirm action",
        description: "Please review this action before it runs.",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
      };
  }
}

function getToolStatusCopy(part: UIMessage["parts"][number]) {
  if (!isToolUIPart(part)) {
    return null;
  }

  const toolName = getToolName(part);
  const shortLabel = toolName?.replaceAll("_", " ") ?? "Action";

  switch (part.state) {
    case "approval-responded":
      return {
        tone: "neutral" as const,
        text: part.approval.approved
          ? `${shortLabel} confirmed. Executing...`
          : `${shortLabel} cancelled.`,
      };
    case "output-error":
      return {
        tone: "error" as const,
        text: part.errorText || `${shortLabel} failed.`,
      };
    case "output-denied":
      return {
        tone: "neutral" as const,
        text: `${shortLabel} cancelled.`,
      };
    case "output-available":
      return {
        tone: "success" as const,
        text: `${shortLabel} completed.`,
      };
    default:
      return null;
  }
}

function readMessageMeta(message: UIMessage) {
  if (!message.metadata || typeof message.metadata !== "object") {
    return null;
  }

  const metadata = message.metadata as {
    agent?: unknown;
    agentLabel?: unknown;
  };

  return {
    agent:
      typeof metadata.agent === "string" ? metadata.agent : "time-off",
    agentLabel:
      typeof metadata.agentLabel === "string"
        ? metadata.agentLabel
        : "Time Off Agent",
  };
}

function getInitials(message: UIMessage) {
  if (message.role !== "assistant") {
    return "You";
  }

  const metadata = readMessageMeta(message);
  switch (metadata?.agent) {
    case "manager":
      return "MG";
    case "coordinator":
      return "CO";
    default:
      return "TO";
  }
}

type ChatTranscriptProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  messages: UIMessage[];
  isLoading: boolean;
  quickActions: Array<{ label: string; prompt: string }>;
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
        <ChatEmptyState
          quickActions={quickActions}
          onSelectPrompt={onSelectPrompt}
        />
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
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {getInitials(message)}
                  </div>
                ) : null}

                <div className={`min-w-0 ${isUser ? "max-w-[85%]" : "max-w-full flex-1"}`}>
                  {!isUser && agentMetadata ? (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
                        {agentMetadata.agentLabel}
                      </span>
                    </div>
                  ) : null}

                  {shouldRenderBubble ? (
                    <div
                      className={`rounded-3xl px-4 py-3 shadow-sm ${
                        isUser
                          ? "ml-auto bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      {text ? (
                        <Text
                          variant="inherit"
                          className="whitespace-pre-wrap text-[15px] leading-7"
                        >
                          {text}
                        </Text>
                      ) : (
                        <Text
                          variant="muted"
                          className="whitespace-pre-wrap leading-relaxed"
                        >
                          {STREAMING_PLACEHOLDER_TEXT}
                        </Text>
                      )}
                    </div>
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
                          <div
                            key={`${message.id}-approval-${part.toolCallId ?? index}`}
                            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
                          >
                            <Text as="p" className="text-sm font-semibold text-amber-900">
                              {content.title}
                            </Text>
                            <Text variant="caption" className="mt-1 block text-amber-800">
                              {content.description}
                            </Text>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  onToolApproval(part.approval.id, true)
                                }
                              >
                                {content.confirmLabel}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  onToolApproval(part.approval.id, false)
                                }
                              >
                                {content.cancelLabel}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {statusParts.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {statusParts.map((statusPart, index) => (
                        <div
                          key={`${message.id}-status-${index}`}
                          className={`rounded-2xl px-4 py-3 text-sm ${
                            statusPart.tone === "error"
                              ? "border border-red-200 bg-red-50 text-red-700"
                              : statusPart.tone === "success"
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {statusPart.text}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {isUser ? (
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    {getInitials(message)}
                  </div>
                ) : null}
              </article>
            );
          })}

          {isLoading && lastMessage?.role === "user" ? (
            <article className="flex gap-3">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                TO
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
                </div>
              </div>
            </article>
          ) : null}
        </div>
      )}
    </div>
  );
}
