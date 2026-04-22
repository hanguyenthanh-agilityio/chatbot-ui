import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import type { AppRole } from "@/lib/auth/session";

export type AgentName = "coordinator" | "time-off" | "manager";

export type AgentMetadata = {
  agent: AgentName;
  agentLabel: string;
  accessRole: AppRole;
};

export function getAgentMetadata(
  agent: AgentName,
  accessRole: AppRole,
): AgentMetadata {
  switch (agent) {
    case "coordinator":
      return {
        agent,
        agentLabel: "Coordinator Agent",
        accessRole,
      };
    case "manager":
      return {
        agent,
        agentLabel: "Manager Agent",
        accessRole,
      };
    case "time-off":
      return {
        agent,
        agentLabel: "Time Off Agent",
        accessRole,
      };
  }
}

export function createStaticAgentResponse({
  text,
  agent,
  accessRole,
  originalMessages,
}: {
  text: string;
  agent: AgentName;
  accessRole: AppRole;
  originalMessages?: UIMessage[];
}) {
  const metadata = getAgentMetadata(agent, accessRole);

  const stream = createUIMessageStream({
    originalMessages,
    execute: ({ writer }) => {
      const textPartId = `${agent}-message`;

      writer.write({
        type: "start",
        messageMetadata: metadata,
      });
      writer.write({
        type: "text-start",
        id: textPartId,
      });
      writer.write({
        type: "text-delta",
        id: textPartId,
        delta: text,
      });
      writer.write({
        type: "text-end",
        id: textPartId,
      });
      writer.write({
        type: "finish",
        finishReason: "stop",
        messageMetadata: metadata,
      });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
