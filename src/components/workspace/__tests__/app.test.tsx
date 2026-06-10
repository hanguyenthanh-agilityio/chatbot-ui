import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ComponentProps, createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Constants
import {
  getAppEmptyHeaderHintByRole,
  getAppEmptyHeaderTitleByRole,
  getAppSubtitleByRole,
} from "@/constants/app";
import { CHAT_PANEL_RESET_COPY, QUICK_ACTIONS_BY_ROLE } from "@/constants/chat";
import {
  DEFAULT_PROVIDER_OPTIONS,
  PROVIDER_OPTION_LABEL,
  PROVIDER_PANEL_COPY,
} from "@/constants/provider";
import { DEFAULT_THEME } from "@/constants/theme";

// Mocks
import { mockAuthSession } from "@/mocks/auth-panel";
import { mockChatThread } from "@/mocks/workspace-sidebar";
import { mockProvider } from "@/mocks/provider-selector";

// Components
import { WorkspaceApp } from "@/components/workspace/app";
import { ThemeProvider } from "@/components/theme-provider";

const mockUseWorkspaceApp = vi.hoisted(() => vi.fn());
const mockIsProductionLike = vi.hoisted(() => vi.fn(() => false));

const hydrationSnapshotMock = vi.hoisted(() => ({
  enabled: false,
  isHydrated: true,
}));

vi.mock("@/lib/runtime-env", () => ({
  isProductionLike: () => mockIsProductionLike(),
}));

vi.mock("react", async (importOriginal) => {
  const React = await importOriginal<typeof import("react")>();
  return {
    ...React,
    useSyncExternalStore<T>(
      subscribe: Parameters<typeof React.useSyncExternalStore<T>>[0],
      getClientSnapshot: () => T,
      getServerSnapshot?: () => T,
    ) {
      const isWorkspaceHydrationGuard =
        getServerSnapshot?.() === false && getClientSnapshot() === true;

      return React.useSyncExternalStore(
        subscribe,
        () =>
          hydrationSnapshotMock.enabled && isWorkspaceHydrationGuard
            ? (hydrationSnapshotMock.isHydrated as T)
            : getClientSnapshot(),
        () =>
          hydrationSnapshotMock.enabled && isWorkspaceHydrationGuard
            ? (hydrationSnapshotMock.isHydrated as T)
            : (getServerSnapshot?.() as T),
      );
    },
  };
});

vi.mock("@/hooks/use-workspace-app", () => ({
  useWorkspaceApp: mockUseWorkspaceApp,
}));

const authSessions = {
  user: mockAuthSession("user"),
  manager: mockAuthSession("manager"),
} as const;

const DEFAULT_ROLE = "user" as const;
const DEFAULT_HEADER_TITLE = getAppEmptyHeaderTitleByRole(DEFAULT_ROLE);
const DEFAULT_HEADER_SUBTITLE = getAppSubtitleByRole(DEFAULT_ROLE);
const DEFAULT_HEADER_HINT = getAppEmptyHeaderHintByRole(DEFAULT_ROLE);

function mockWorkspaceState(overrides: Record<string, unknown> = {}) {
  const activeThread = mockChatThread();
  return {
    input: "",
    setInput: vi.fn(),
    auth: {
      role: DEFAULT_ROLE,
      session: authSessions.user,
      requestBody: { authRole: DEFAULT_ROLE },
    },
    provider: mockProvider({ isProviderReady: true }),
    messages: [],
    isLoading: false,
    canSend: false,
    requestError: null,
    isEmptyConversation: true,
    quickActions: [],
    headerTitle: DEFAULT_HEADER_TITLE,
    headerSubtitle: DEFAULT_HEADER_SUBTITLE,
    headerHint: DEFAULT_HEADER_HINT,
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
    handleResetChatPanel: vi.fn(),
    composerAttachment: {
      attachedFile: null,
      attachFile: vi.fn(),
      clearAttachment: vi.fn(),
    },
    ...overrides,
  };
}

function getProviderCombobox() {
  return screen.getByRole("combobox", { name: PROVIDER_PANEL_COPY.label });
}

type WorkspaceAppProps = ComponentProps<typeof WorkspaceApp>;

function renderApp(props: WorkspaceAppProps = { authSessions }) {
  return render(
    <ThemeProvider>
      <WorkspaceApp {...props} />
    </ThemeProvider>,
  );
}

async function renderFreshApp(props: WorkspaceAppProps = { authSessions }) {
  vi.resetModules();
  const [{ WorkspaceApp: FreshWorkspaceApp }, { ThemeProvider: FreshTheme }] =
    await Promise.all([
      import("@/components/workspace/app"),
      import("@/components/theme-provider"),
    ]);

  return render(
    <FreshTheme>
      <FreshWorkspaceApp {...props} />
    </FreshTheme>,
  );
}

function givenWorkspaceState(overrides: Record<string, unknown> = {}) {
  mockUseWorkspaceApp.mockReturnValue(mockWorkspaceState(overrides));
}

describe("WorkspaceApp", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = DEFAULT_THEME;
    mockUseWorkspaceApp.mockClear();
    givenWorkspaceState();
  });

  afterEach(() => {
    hydrationSnapshotMock.enabled = false;
    hydrationSnapshotMock.isHydrated = true;
    mockIsProductionLike.mockReturnValue(false);
    cleanup();
    localStorage.clear();
  });

  describe("hydration shell", () => {
    beforeEach(() => {
      hydrationSnapshotMock.enabled = true;
      hydrationSnapshotMock.isHydrated = false;
    });

    it("renders placeholder layout before hydration", () => {
      renderApp();
      expect(mockUseWorkspaceApp).not.toHaveBeenCalled();
      expect(
        screen.queryByRole("heading", {
          name: DEFAULT_HEADER_TITLE,
        }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByTestId("workspace-hydration-placeholder")).toHaveLength(
        2,
      );
    });
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
    givenWorkspaceState(overrides);
    const { container } = renderApp();
    expect(container.firstElementChild?.outerHTML ?? "").toMatchSnapshot();
  });

  it("shows empty-state header copy", () => {
    renderApp();
    expect(
      screen.getByRole("heading", {
        name: DEFAULT_HEADER_TITLE,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_HEADER_HINT)).toBeInTheDocument();
  });

  it("calls handleResetChatPanel when clear conversation is clicked", () => {
    const handleResetChatPanel = vi.fn();
    givenWorkspaceState({
      messages: [{ id: "m1", role: "user", parts: [{ type: "text", text: "Hi" }] }],
      isEmptyConversation: false,
      handleResetChatPanel,
    });
    renderApp();
    fireEvent.click(
      screen.getByRole("button", { name: CHAT_PANEL_RESET_COPY.ariaLabel }),
    );
    expect(handleResetChatPanel).toHaveBeenCalledTimes(1);
  });

  it("keeps suggestion chips above the composer when the conversation has messages", () => {
    givenWorkspaceState({
      messages: [{ id: "m1", role: "user", parts: [{ type: "text", text: "Hi" }] }],
      isEmptyConversation: false,
      quickActions: QUICK_ACTIONS_BY_ROLE.user,
    });
    renderApp();
    expect(
      screen.getByRole("button", { name: "Check balance" }),
    ).toBeInTheDocument();
  });

  it("shows success toast when provider reports success", () => {
    givenWorkspaceState({
      provider: mockProvider({
        isProviderReady: true,
        successMessage: "Provider verified",
      }),
    });
    renderApp();
    expect(screen.getByRole("status")).toHaveTextContent("Provider verified");
  });

  describe("allowed providers", () => {
    it("passes default provider options in local-like mode", () => {
      renderApp();
      for (const provider of DEFAULT_PROVIDER_OPTIONS) {
        expect(
          screen.getByRole("option", { name: PROVIDER_OPTION_LABEL[provider] }),
        ).toBeInTheDocument();
      }
      expect(getProviderCombobox()).toBeEnabled();
    });

    it("restricts the sidebar provider selector to OpenAI in production-like mode", async () => {
      mockIsProductionLike.mockReturnValue(true);
      givenWorkspaceState();
      await renderFreshApp();

      expect(
        screen.queryByRole("option", { name: PROVIDER_OPTION_LABEL.ollama }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: PROVIDER_OPTION_LABEL.openai }),
      ).toBeInTheDocument();
      expect(getProviderCombobox()).toBeDisabled();
    });
  });
});
