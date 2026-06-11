import { act, renderHook } from "@testing-library/react";
import type { UIMessage } from "ai";
import type { FormEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  APP_NAME,
  getAppEmptyHeaderHintByRole,
  getAppEmptyHeaderTitleByRole,
  getAppSubtitleByRole,
} from "@/constants/app";
import { API_ROUTE_PATH } from "@/constants/api";
import {
  CHAT_COMPOSER_COPY,
  CHAT_HELPER_COPY_BY_ROLE,
  getQuickActionsByRole,
} from "@/constants/chat";
import { PROVIDER_HELPER_HINT_COPY } from "@/constants/provider";
import { useWorkspaceApp } from "@/hooks/use-workspace-app";
import type { AppRole } from "@/lib/auth/session";
import { mockAuthSession } from "@/mocks/auth-panel";
import { mockUserChatMessage } from "@/mocks/chat-message";
import { createToolPart } from "@/mocks/transcript-tool-output";
import { mockProvider } from "@/mocks/provider-selector";
import { mockChatThread } from "@/mocks/workspace-sidebar";

const chatState = vi.hoisted(() => ({
  messages: [] as UIMessage[],
  status: "ready" as "ready" | "submitted" | "streaming",
  error: null as Error | null,
}));

type TransportOptions = {
  api: string;
  body: () => Record<string, unknown>;
};

const {
  mockUseProviderSelection,
  mockUseComposerAttachment,
  mockUseChatThreads,
  mockUseChatAutoScroll,
  mockSendMessage,
  mockClearError,
  mockStop,
  mockSetMessages,
  mockAddToolApprovalResponse,
  mockResetActiveThread,
  mockSwitchThread,
  mockCreateNewThread,
  mockDeleteThread,
  captureUseChatOptions,
  captureTransportOptions,
  transportCtorCalls,
} = vi.hoisted(() => {
  const captureUseChatOptions = { current: null as Record<string, unknown> | null };
  const captureTransportOptions = { current: null as TransportOptions | null };

  return {
    mockUseProviderSelection: vi.fn(),
    mockUseComposerAttachment: vi.fn(),
    mockUseChatThreads: vi.fn(),
    mockUseChatAutoScroll: vi.fn(),
    mockSendMessage: vi.fn(),
    mockClearError: vi.fn(),
    mockStop: vi.fn(),
    mockSetMessages: vi.fn(),
    mockAddToolApprovalResponse: vi.fn(),
    mockResetActiveThread: vi.fn(),
    mockSwitchThread: vi.fn(),
    mockCreateNewThread: vi.fn(),
    mockDeleteThread: vi.fn(),
    captureUseChatOptions,
    captureTransportOptions,
    transportCtorCalls: { count: 0 },
  };
});

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();

  return {
    ...actual,
    DefaultChatTransport: class {
      constructor(options: TransportOptions) {
        transportCtorCalls.count += 1;
        captureTransportOptions.current = options;
      }
    },
  };
});

vi.mock("@/lib/runtime-env", () => ({
  isProductionLike: vi.fn(() => false),
}));

vi.mock("@/hooks/use-provider", () => ({
  useProviderSelection: (...args: unknown[]) => mockUseProviderSelection(...args),
}));

vi.mock("@/hooks/use-composer-attachment", () => ({
  useComposerAttachment: () => mockUseComposerAttachment(),
}));

vi.mock("@/hooks/use-threads", () => ({
  useChatThreads: (...args: unknown[]) => mockUseChatThreads(...args),
}));

vi.mock("@/hooks/use-auto-scroll", () => ({
  useChatAutoScroll: (...args: unknown[]) => mockUseChatAutoScroll(...args),
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: (options: Record<string, unknown>) => {
    captureUseChatOptions.current = options;
    return {
      messages: chatState.messages,
      setMessages: mockSetMessages,
      sendMessage: mockSendMessage,
      addToolApprovalResponse: mockAddToolApprovalResponse,
      status: chatState.status,
      error: chatState.error,
      clearError: mockClearError,
      stop: mockStop,
    };
  },
}));

const authSessions = {
  user: mockAuthSession("user"),
  manager: mockAuthSession("manager"),
} as const;

function approvalRespondedMessage(approvalId: string): UIMessage {
  return {
    id: "assistant-approval",
    role: "assistant",
    parts: [
      createToolPart("submit_my_time_off_request", undefined, {
        state: "approval-responded",
        approval: { id: approvalId, approved: true },
      }),
    ],
  };
}

function setupWorkspaceMocks(
  providerOverrides: Parameters<typeof mockProvider>[0] = {},
) {
  mockUseProviderSelection.mockReturnValue(
    mockProvider({ isProviderReady: true, isOpenAIReady: true, ...providerOverrides }),
  );
  mockUseComposerAttachment.mockReturnValue({
    attachedFile: null,
    attachFile: vi.fn(),
    clearAttachment: vi.fn(),
  });

  const activeThread = mockChatThread();
  mockUseChatThreads.mockReturnValue({
    activeThread,
    allThreads: [activeThread],
    switchThread: mockSwitchThread,
    createNewThread: mockCreateNewThread,
    deleteThread: mockDeleteThread,
    resetActiveThread: mockResetActiveThread,
  });

  mockSendMessage.mockResolvedValue(undefined);
}

function renderWorkspace(authRole: AppRole = "user") {
  return renderHook(() => useWorkspaceApp(authRole, authSessions));
}

function getSendAutomaticallyWhen() {
  const callback = captureUseChatOptions.current?.sendAutomaticallyWhen;
  if (typeof callback !== "function") {
    throw new Error("sendAutomaticallyWhen was not captured");
  }
  return callback as (args: { messages: UIMessage[] }) => boolean;
}

function getTransportBody() {
  const body = captureTransportOptions.current?.body;
  if (typeof body !== "function") {
    throw new Error("transport body was not captured");
  }
  return body;
}

describe("useWorkspaceApp", () => {
  beforeEach(() => {
    chatState.messages = [];
    chatState.status = "ready";
    chatState.error = null;
    transportCtorCalls.count = 0;
    captureTransportOptions.current = null;
    setupWorkspaceMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    captureUseChatOptions.current = null;
    captureTransportOptions.current = null;
  });

  it("derives empty-conversation header copy and quick actions from role", () => {
    const { result } = renderWorkspace("manager");

    expect(result.current.auth.role).toBe("manager");
    expect(result.current.auth.session).toBe(authSessions.manager);
    expect(result.current.isEmptyConversation).toBe(true);
    expect(result.current.headerTitle).toBe(
      getAppEmptyHeaderTitleByRole("manager"),
    );
    expect(result.current.headerSubtitle).toBe(getAppSubtitleByRole("manager"));
    expect(result.current.headerHint).toBe(
      getAppEmptyHeaderHintByRole("manager"),
    );
    expect(result.current.quickActions).toEqual(getQuickActionsByRole("manager"));
  });

  it("uses active thread title and preview in the header when the conversation has messages", () => {
    chatState.messages = [mockUserChatMessage("Hello")];
    const activeThread = mockChatThread({
      title: "Team approvals",
      preview: "Show pending requests",
    });
    mockUseChatThreads.mockReturnValue({
      activeThread,
      allThreads: [activeThread],
      switchThread: mockSwitchThread,
      createNewThread: mockCreateNewThread,
      deleteThread: mockDeleteThread,
      resetActiveThread: mockResetActiveThread,
    });

    const { result } = renderWorkspace("manager");

    expect(result.current.isEmptyConversation).toBe(false);
    expect(result.current.headerTitle).toBe("Team approvals");
    expect(result.current.headerSubtitle).toBe("Show pending requests");
    expect(result.current.headerHint).toBeNull();
  });

  it("falls back to APP_NAME and role subtitle when thread header fields are missing", () => {
    chatState.messages = [mockUserChatMessage("Hello")];
    const activeThread = mockChatThread({
      title: undefined,
      preview: undefined,
    });
    mockUseChatThreads.mockReturnValue({
      activeThread,
      allThreads: [activeThread],
      switchThread: mockSwitchThread,
      createNewThread: mockCreateNewThread,
      deleteThread: mockDeleteThread,
      resetActiveThread: mockResetActiveThread,
    });

    const { result } = renderWorkspace("user");

    expect(result.current.headerTitle).toBe(APP_NAME);
    expect(result.current.headerSubtitle).toBe(getAppSubtitleByRole("user"));
    expect(result.current.headerHint).toBeNull();
  });

  it("computes canSend from input, loading state, and provider readiness", () => {
    const { result, rerender } = renderWorkspace();

    expect(result.current.canSend).toBe(false);

    act(() => {
      result.current.setInput("Hello");
    });
    rerender();
    expect(result.current.canSend).toBe(true);

    chatState.status = "streaming";
    rerender();
    expect(result.current.canSend).toBe(false);

    chatState.status = "ready";
    mockUseProviderSelection.mockReturnValue(
      mockProvider({ isProviderReady: false, isOpenAIReady: false }),
    );
    rerender();
    expect(result.current.canSend).toBe(false);
  });

  it("returns provider-specific helper text", () => {
    mockUseProviderSelection.mockReturnValue(
      mockProvider({
        isOpenAISelected: true,
        isOpenAIReady: false,
        isProviderReady: false,
      }),
    );
    const { result: openaiResult } = renderWorkspace();
    expect(openaiResult.current.helperText).toBe(
      PROVIDER_HELPER_HINT_COPY.verifyOpenAIFirst,
    );

    mockUseProviderSelection.mockReturnValue(
      mockProvider({
        selectedProvider: "ollama",
        isOpenAISelected: false,
        isOpenAIReady: false,
        isProviderReady: false,
        requestBody: { provider: "ollama" },
      }),
    );
    const { result: ollamaResult } = renderWorkspace();
    expect(ollamaResult.current.helperText).toBe(
      PROVIDER_HELPER_HINT_COPY.verifyOllamaFirst,
    );

    chatState.status = "submitted";
    setupWorkspaceMocks();
    const { result: submittingResult } = renderWorkspace("user");
    expect(submittingResult.current.helperText).toBe(
      CHAT_COMPOSER_COPY.submitHint,
    );

    chatState.status = "ready";
    setupWorkspaceMocks();
    const { result: defaultResult } = renderWorkspace("user");
    expect(defaultResult.current.helperText).toBe(
      CHAT_HELPER_COPY_BY_ROLE.user,
    );
  });

  it("submits trimmed text with provider and auth body, and restores input on failure", async () => {
    mockSendMessage.mockRejectedValueOnce(new Error("network"));

    const { result } = renderWorkspace();

    await act(async () => {
      await result.current.submitTextMessage("  Hello team  ", {
        restoreInputOnError: true,
      });
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      { text: "Hello team" },
      {
        body: {
          provider: "openai",
          authRole: "user",
        },
      },
    );
    expect(result.current.input).toBe("Hello team");
    expect(mockClearError).toHaveBeenCalled();
  });

  it("does not send when provider is not ready and keeps the draft in the input", async () => {
    mockUseProviderSelection.mockReturnValue(
      mockProvider({ isProviderReady: false, isOpenAIReady: false }),
    );

    const { result } = renderWorkspace();

    await act(async () => {
      await result.current.submitTextMessage("Blocked message");
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(result.current.input).toBe("Blocked message");
  });

  it("handleSubmit prevents default and sends the current input", async () => {
    const { result } = renderWorkspace();
    const preventDefault = vi.fn();

    act(() => {
      result.current.setInput("From form");
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as FormEvent<HTMLFormElement>);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(mockSendMessage).toHaveBeenCalledWith(
      { text: "From form" },
      expect.objectContaining({
        body: expect.objectContaining({ authRole: "user" }),
      }),
    );
  });

  it("handlePromptSelect forwards quick-action prompts", async () => {
    const { result } = renderWorkspace();

    await act(async () => {
      await result.current.handlePromptSelect("Check my balance");
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      { text: "Check my balance" },
      expect.any(Object),
    );
  });

  it("handleRoleChange clears chat state and switches auth role", () => {
    const { result } = renderWorkspace("user");

    act(() => {
      result.current.setInput("draft");
      result.current.handleRoleChange("manager");
    });

    expect(mockClearError).toHaveBeenCalled();
    expect(mockSetMessages).toHaveBeenCalledWith([]);
    expect(result.current.input).toBe("");
    expect(result.current.auth.role).toBe("manager");
    expect(result.current.auth.session).toBe(authSessions.manager);

    act(() => {
      result.current.handleRoleChange("manager");
    });
    expect(mockSetMessages).toHaveBeenCalledTimes(1);
  });

  it("handleResetChatPanel stops streaming, clears errors, and resets the thread", () => {
    chatState.status = "streaming";
    const { result, rerender } = renderWorkspace();

    act(() => {
      result.current.setInput("draft");
    });
    rerender();

    act(() => {
      result.current.handleResetChatPanel();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(mockClearError).toHaveBeenCalled();
    expect(mockResetActiveThread).toHaveBeenCalled();
    expect(result.current.input).toBe("");
  });

  it("handleStop stops the stream and clears errors", () => {
    const { result } = renderWorkspace();

    act(() => {
      result.current.handleStop();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(mockClearError).toHaveBeenCalled();
  });

  it("handleToolApproval clears errors and forwards approval responses", () => {
    const { result } = renderWorkspace();

    act(() => {
      result.current.handleToolApproval("approval-1", true);
    });

    expect(mockClearError).toHaveBeenCalled();
    expect(mockAddToolApprovalResponse).toHaveBeenCalledWith({
      id: "approval-1",
      approved: true,
    });
  });

  it("creates chat transport once with body reading from chatRequestBodyRef", () => {
    renderWorkspace();

    expect(transportCtorCalls.count).toBe(1);
    expect(captureTransportOptions.current?.api).toBe(API_ROUTE_PATH.chat);
    expect(getTransportBody()()).toEqual({
      provider: "openai",
      authRole: "user",
    });
  });

  it("transport body() returns latest role and provider without recreating transport", () => {
    const { result, rerender } = renderWorkspace();
    const readTransportBody = getTransportBody();

    act(() => {
      result.current.handleRoleChange("manager");
    });
    rerender();

    expect(transportCtorCalls.count).toBe(1);
    expect(readTransportBody()).toEqual({
      provider: "openai",
      authRole: "manager",
    });

    mockUseProviderSelection.mockReturnValue(
      mockProvider({
        isProviderReady: true,
        isOpenAIReady: true,
        selectedProvider: "ollama",
        isOpenAISelected: false,
        requestBody: {
          provider: "ollama",
          ollamaBaseUrl: "http://localhost:11434",
        },
      }),
    );
    rerender();

    expect(transportCtorCalls.count).toBe(1);
    expect(readTransportBody()).toEqual({
      provider: "ollama",
      ollamaBaseUrl: "http://localhost:11434",
      authRole: "manager",
    });
  });

  it("sendAutomaticallyWhen only auto-submits once per approval response", () => {
    renderWorkspace();
    const sendAutomaticallyWhen = getSendAutomaticallyWhen();
    const messages = [approvalRespondedMessage("approval-1")];

    expect(sendAutomaticallyWhen({ messages })).toBe(true);
    expect(sendAutomaticallyWhen({ messages })).toBe(false);
  });

  it("sendAutomaticallyWhen ignores non-assistant messages and messages without approvals", () => {
    renderWorkspace();
    const sendAutomaticallyWhen = getSendAutomaticallyWhen();

    expect(
      sendAutomaticallyWhen({
        messages: [mockUserChatMessage("Hello")],
      }),
    ).toBe(false);

    expect(
      sendAutomaticallyWhen({
        messages: [
          {
            id: "assistant-text",
            role: "assistant",
            parts: [{ type: "text", text: "Done" }],
          },
        ],
      }),
    ).toBe(false);
  });

  it("clears chat errors when provider validation errors appear", () => {
    mockUseProviderSelection.mockReturnValue(
      mockProvider({
        isProviderReady: true,
        isOpenAIReady: true,
        validationError: "Invalid API key",
      }),
    );

    renderWorkspace();

    expect(mockClearError).toHaveBeenCalled();
  });

  it("formats request errors for display", () => {
    chatState.error = new Error(
      JSON.stringify({ error: { message: "Country not supported" } }),
    );

    const { result } = renderWorkspace();

    expect(result.current.requestError).toBe("Country not supported");
  });
});
