import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceApp } from "@/components/workspace/app";
import {
  getAppEmptyHeaderHintByRole,
  getAppEmptyHeaderTitleByRole,
  getAppSubtitleByRole,
} from "@/constants/app";
import { mockAuthSession } from "@/mocks/auth-panel";
import { mockChatThread } from "@/mocks/workspace-sidebar";
import { mockProvider } from "@/mocks/provider-selector";
import { DEFAULT_THEME } from "@/constants/theme";

const mockUseWorkspaceApp = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-workspace-app", () => ({
  useWorkspaceApp: mockUseWorkspaceApp,
}));

const authSessions = {
  user: mockAuthSession("user"),
  manager: mockAuthSession("manager"),
};

function mockWorkspaceState(overrides: Record<string, unknown> = {}) {
  const activeThread = mockChatThread();
  return {
    input: "",
    setInput: vi.fn(),
    auth: {
      role: "user" as const,
      session: authSessions.user,
      requestBody: { authRole: "user" },
    },
    provider: mockProvider({ isProviderReady: true }),
    messages: [],
    isLoading: false,
    canSend: false,
    requestError: null,
    isEmptyConversation: true,
    quickActions: [],
    headerTitle: getAppEmptyHeaderTitleByRole("user"),
    headerSubtitle: getAppSubtitleByRole("user"),
    headerHint: getAppEmptyHeaderHintByRole("user"),
    helperText: "Helper",
    messagesContainerRef: createRef<HTMLDivElement>(),
    activeThread,
    allThreads: [activeThread],
    switchThread: vi.fn(),
    createNewThread: vi.fn(),
    deleteThread: vi.fn(),
    submitTextMessage: vi.fn(),
    handleSubmit: vi.fn(),
    handlePromptSelect: vi.fn(),
    handleToolApproval: vi.fn(),
    handleRoleChange: vi.fn(),
    handleStop: vi.fn(),
    ...overrides,
  };
}

function renderApp() {
  return render(
    <ThemeProvider>
      <WorkspaceApp authSessions={authSessions} />
    </ThemeProvider>,
  );
}

describe("WorkspaceApp", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = DEFAULT_THEME;
    mockUseWorkspaceApp.mockReturnValue(mockWorkspaceState());
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it.each([
    ["empty", {}],
    [
      "with-messages",
      {
        isEmptyConversation: false,
        headerHint: null,
        headerTitle: "Leave balance",
        messages: [mockChatThread().messages[0]!],
      },
    ],
    [
      "success-toast",
      {
        provider: mockProvider({
          isProviderReady: true,
          successMessage: "Provider verified",
        }),
      },
    ],
    [
      "provider-error",
      {
        provider: mockProvider({
          isProviderReady: true,
          validationError: "Invalid API key",
        }),
      },
    ],
  ])("snapshot %s", (_id, overrides) => {
    mockUseWorkspaceApp.mockReturnValue(mockWorkspaceState(overrides));
    const { container } = renderApp();
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("shows empty-state header copy", () => {
    renderApp();
    expect(
      screen.getByRole("heading", {
        name: getAppEmptyHeaderTitleByRole("user"),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(getAppEmptyHeaderHintByRole("user")),
    ).toBeInTheDocument();
  });

  it("shows success toast when provider reports success", () => {
    mockUseWorkspaceApp.mockReturnValue(
      mockWorkspaceState({
        provider: mockProvider({
          isProviderReady: true,
          successMessage: "Provider verified",
        }),
      }),
    );
    renderApp();
    expect(screen.getByRole("status")).toHaveTextContent("Provider verified");
  });
});
