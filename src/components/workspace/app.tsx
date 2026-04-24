"use client";

import {
  DefaultChatTransport,
  isToolUIPart,
} from "ai";
import { useChat } from "@ai-sdk/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { ChatComposer } from "@/components/chat/composer";
import { ChatTranscript } from "@/components/chat/transcript";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AuthPanel } from "@/components/workspace/auth-panel";
import { ThreadSidebar } from "@/components/workspace/sidebar";
import { API_ROUTE_PATH } from "@/constants/api";
import {
  APP_NAME,
  APP_HEADER_REVIEW_BADGE_LABEL,
  getAppEmptyHeaderHintByRole,
  getAppEmptyHeaderTitleByRole,
  getAppSubtitleByRole,
} from "@/constants/app";
import {
  CHAT_COMPOSER_COPY,
  CHAT_HELPER_COPY_BY_ROLE,
  getQuickActionsByRole,
} from "@/constants/chat";
import { PROVIDER_HELPER_HINT_COPY } from "@/constants/provider";
import { useChatAutoScroll } from "@/hooks/use-auto-scroll";
import { useChatThreads } from "@/hooks/use-threads";
import { useProviderSelection } from "@/hooks/use-provider";
import type { AppRole, MockAuthSession } from "@/lib/auth/session";
import { Text } from "@/components/ui/text";
import { getInitialsFromName } from "@/utils/avatar";
import { getDisplayErrorMessage } from "@/utils/error";

type WorkspaceAppProps = {
  authRole?: AppRole;
  authSessions: Record<AppRole, MockAuthSession>;
};

export function WorkspaceApp({ authRole = "user", authSessions }: WorkspaceAppProps) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isHydrated) {
    return (
      <main className="min-h-screen min-h-dvh px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] min-h-[calc(100dvh-1.5rem)] w-full max-w-[1600px] flex-col gap-3 sm:min-h-[calc(100vh-2.5rem)] sm:min-h-[calc(100dvh-2.5rem)] sm:gap-4 lg:flex-row">
          <div className="h-[70vh] w-full rounded-[1.75rem] border border-white/[.09] bg-[linear-gradient(170deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] backdrop-blur-[28px] lg:max-w-sm" />
          <div className="h-[70vh] flex-1 rounded-[1.75rem] border border-white/[.09] bg-[linear-gradient(170deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] backdrop-blur-[28px]" />
        </div>
      </main>
    );
  }

  return <WorkspaceAppClient authRole={authRole} authSessions={authSessions} />;
}

function WorkspaceAppClient({ authRole, authSessions }: WorkspaceAppProps) {
  const [input, setInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>(authRole ?? "user");
  const autoSubmittedApprovalIdsRef = useRef<Set<string>>(new Set());
  const provider = useProviderSelection({
    requireOpenAIApiKeyVerification: true,
  });
  const authSession = authSessions[selectedRole] ?? authSessions.user;
  const auth = useMemo(
    () => ({
      role: selectedRole,
      session: authSession,
      requestBody: {
        authRole: selectedRole,
      },
    }),
    [authSession, selectedRole],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: API_ROUTE_PATH.chat,
        body: () => ({
          ...provider.requestBody,
          authRole: selectedRole,
        }),
      }),
    [provider.requestBody, selectedRole],
  );

  const {
    messages,
    setMessages,
    sendMessage,
    addToolApprovalResponse,
    status,
    error,
    clearError,
  } = useChat({
    transport,
    sendAutomaticallyWhen: ({ messages }) => {
      const lastMessage = messages.at(-1);

      if (!lastMessage || lastMessage.role !== "assistant") {
        return false;
      }

      const approvalResponses = lastMessage.parts
        .filter((part) => isToolUIPart(part) && part.state === "approval-responded")
        .map((part) => part.approval.id);

      if (approvalResponses.length === 0) {
        return false;
      }

      const hasNewApprovalResponse = approvalResponses.some(
        (id) => !autoSubmittedApprovalIdsRef.current.has(id),
      );

      if (!hasNewApprovalResponse) {
        return false;
      }

      approvalResponses.forEach((id) => {
        autoSubmittedApprovalIdsRef.current.add(id);
      });

      return true;
    },
  });
  const { activeThread, clearThread } = useChatThreads({
    messages,
    setMessages,
    provider: provider.selectedProvider,
    role: auth.role,
  });
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isSubmitting = status === "submitted";
  const isStreaming = status === "streaming";
  const isLoading = isSubmitting || isStreaming;
  const trimmedInput = input.trim();
  const canSend =
    trimmedInput.length > 0 && !isLoading && provider.isProviderReady;
  const requestError = error ? getDisplayErrorMessage(error) : null;
  const isEmptyConversation = messages.length === 0;
  const quickActions = useMemo(
    () => getQuickActionsByRole(auth.role),
    [auth.role],
  );
  const headerTitle = isEmptyConversation
    ? getAppEmptyHeaderTitleByRole(auth.role)
    : (activeThread?.title ?? APP_NAME);
  const headerSubtitle = isEmptyConversation
    ? getAppSubtitleByRole(auth.role)
    : (activeThread?.preview ?? getAppSubtitleByRole(auth.role));
  const headerHint = isEmptyConversation
    ? getAppEmptyHeaderHintByRole(auth.role)
    : null;

  useChatAutoScroll(messagesContainerRef, messages, isStreaming);

  useEffect(() => {
    if (!provider.validationError || requestError) {
      return;
    }

    clearError();
  }, [clearError, provider.validationError, requestError]);

  const previousRoleRef = useRef(auth.role);

  useEffect(() => {
    if (previousRoleRef.current === auth.role) {
      return;
    }

    previousRoleRef.current = auth.role;
    clearError();
  }, [auth.role, clearError]);

  async function submitTextMessage(
    text: string,
    options?: { restoreInputOnError?: boolean },
  ) {
    const messageText = text.trim();
    if (!messageText) return;

    if (isLoading || !provider.isProviderReady) {
      setInput(messageText);
      return;
    }

    setInput("");
    clearError();

    try {
      await sendMessage(
        { text: messageText },
        {
          body: {
            ...provider.requestBody,
            ...auth.requestBody,
          },
        },
      );
    } catch {
      if (options?.restoreInputOnError ?? false) {
        setInput(messageText);
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitTextMessage(trimmedInput, { restoreInputOnError: true });
  }

  async function handlePromptSelect(prompt: string) {
    await submitTextMessage(prompt, { restoreInputOnError: true });
  }

  function handleToolApproval(id: string, approved: boolean) {
    clearError();
    void addToolApprovalResponse({ id, approved });
  }

  function handleRoleChange(role: AppRole) {
    if (role === selectedRole) {
      return;
    }

    clearError();
    setInput("");
    setMessages([]);
    autoSubmittedApprovalIdsRef.current.clear();
    setSelectedRole(role);
  }

  function handleDeleteChat() {
    clearError();
    setInput("");
    clearThread();
    autoSubmittedApprovalIdsRef.current.clear();
  }

  const helperText = useMemo(() => {
    if (isSubmitting) return CHAT_COMPOSER_COPY.submitHint;
    if (provider.isOpenAISelected && !provider.isOpenAIReady) {
      return PROVIDER_HELPER_HINT_COPY.verifyOpenAIFirst;
    }
    if (!provider.isOpenAISelected && !provider.isProviderReady) {
      return PROVIDER_HELPER_HINT_COPY.verifyOllamaFirst;
    }
    return CHAT_HELPER_COPY_BY_ROLE[auth.role];
  }, [
    auth.role,
    isSubmitting,
    provider.isOpenAIReady,
    provider.isOpenAISelected,
    provider.isProviderReady,
  ]);

  const accountPanel = (
    <AuthPanel
      role={auth.role}
      session={auth.session}
      disabled={isLoading}
      onRoleChange={handleRoleChange}
    />
  );

  const sidebarProviderPanel = (
    <Card
      variant="panel"
      className="p-4 text-white shadow-[0_8px_30px_rgba(5,10,30,0.25)]"
    >
      <ProviderSelector
        selectedProvider={provider.selectedProvider}
        openaiApiKeyInput={provider.openaiApiKeyInput}
        ollamaBaseUrlInput={provider.ollamaBaseUrlInput}
        isOpenAISelected={provider.isOpenAISelected}
        isValidatingKey={provider.isValidatingKey}
        isValidatingOllamaBaseUrl={provider.isValidatingOllamaBaseUrl}
        providerStatus={provider.providerStatus}
        withContainer={false}
        onProviderChange={provider.selectProvider}
        onOpenAIApiKeyChange={provider.updateOpenAIApiKeyInput}
        onOllamaBaseUrlChange={provider.updateOllamaBaseUrlInput}
        onVerifyOpenAIKey={provider.verifyOpenAIKey}
        onVerifyOllamaBaseUrl={provider.verifyOllamaBaseUrl}
      />
      {provider.validationError ? (
        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {provider.validationError}
        </p>
      ) : null}
    </Card>
  );

  return (
    <main className="min-h-screen min-h-dvh px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] min-h-[calc(100dvh-1.5rem)] w-full max-w-[1600px] flex-col gap-3 sm:min-h-[calc(100vh-2.5rem)] sm:min-h-[calc(100dvh-2.5rem)] sm:gap-4 lg:flex-row">
        <ThreadSidebar
          thread={activeThread}
          disabled={isLoading}
          accountPanel={accountPanel}
          providerPanel={sidebarProviderPanel}
          onDeleteThread={handleDeleteChat}
        />

        <section className="flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/[.09] bg-[linear-gradient(170deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] backdrop-blur-[28px] shadow-[0_16px_60px_rgba(7,12,32,0.36)]">
          <header className="border-b border-white/[.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-5 sm:px-6 lg:px-8 shadow-[0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Text as="p" variant="eyebrow">
                  {APP_NAME}
                </Text>
                <Badge size="md" variant="neutral">
                  {auth.session.roleLabel}
                </Badge>
                <Badge size="md" variant="brand">
                  {APP_HEADER_REVIEW_BADGE_LABEL}
                </Badge>
              </div>

              <div className="space-y-2">
                <Text as="h2" variant="title" className="tracking-tight sm:text-[1.9rem]">
                  {headerTitle}
                </Text>
                <Text variant="subtitle" className="max-w-2xl">
                  {headerSubtitle}
                </Text>
                {headerHint ? (
                  <Text variant="captionMuted" className="block">
                    {headerHint}
                  </Text>
                ) : null}
              </div>
            </div>
          </header>

          <ChatTranscript
            containerRef={messagesContainerRef}
            messages={messages}
            isLoading={isLoading}
            userAvatarUrl={auth.session.avatar}
            userAvatarLabel={`${auth.session.name} avatar`}
            userInitials={getInitialsFromName(auth.session.name)}
            quickActions={quickActions}
            onSelectPrompt={handlePromptSelect}
            onToolApproval={handleToolApproval}
          />

          <ChatComposer
            input={input}
            canSend={canSend}
            isLoading={isLoading}
            isProviderReady={provider.isProviderReady}
            helperText={helperText}
            errorMessage={requestError}
            onInputChange={setInput}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </main>
  );
}
