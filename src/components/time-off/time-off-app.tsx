"use client";

import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
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
import { ChatComposer } from "@/components/time-off/chat-composer";
import { ChatTranscript } from "@/components/time-off/chat-transcript";
import { MockAuthPanel } from "@/components/time-off/mock-auth-panel";
import { ThreadSidebar } from "@/components/time-off/thread-sidebar";
import {
  APP_TITLE,
  SUBMITTING_HINT,
  VERIFY_KEY_HINT,
  VERIFY_PROVIDER_URL_HINT,
  getAppSubtitle,
  getEmptyHeaderHint,
  getEmptyHeaderTitle,
  getQuickActions,
} from "@/constants/ui";
import { useChatAutoScroll } from "@/hooks/use-chat-auto-scroll";
import { useChatThreads } from "@/hooks/use-chat-threads";
import { useProviderSelection } from "@/hooks/use-provider-selection";
import type { AppRole, MockAuthSession } from "@/lib/auth/session";
import { Text } from "@/components/ui/text";
import { getDisplayErrorMessage } from "@/utils/error-message";

type TimeOffAppProps = {
  authRole?: AppRole;
  authSessions: Record<AppRole, MockAuthSession>;
};

export function TimeOffApp({ authRole = "user", authSessions }: TimeOffAppProps) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isHydrated) {
    return (
      <main className="min-h-screen min-h-dvh px-4 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] min-h-[calc(100dvh-2rem)] w-full max-w-[1600px] flex-col gap-4 sm:min-h-[calc(100vh-2.5rem)] sm:min-h-[calc(100dvh-2.5rem)] lg:flex-row">
          <div className="h-[70vh] w-full rounded-[2rem] border border-slate-800 bg-slate-950 lg:max-w-sm" />
          <div className="h-[70vh] flex-1 rounded-[2rem] border border-slate-200 bg-white/85" />
        </div>
      </main>
    );
  }

  return <TimeOffAppClient authRole={authRole} authSessions={authSessions} />;
}

function TimeOffAppClient({ authRole, authSessions }: TimeOffAppProps) {
  const [input, setInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>(authRole ?? "user");
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
  const {
    messages,
    setMessages,
    sendMessage,
    addToolApprovalResponse,
    status,
    error,
    clearError,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
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
    () => getQuickActions(auth.role),
    [auth.role],
  );
  const headerTitle = isEmptyConversation
    ? getEmptyHeaderTitle(auth.role)
    : (activeThread?.title ?? APP_TITLE);
  const headerSubtitle = isEmptyConversation
    ? getAppSubtitle(auth.role)
    : (activeThread?.preview ?? getAppSubtitle(auth.role));
  const headerHint = isEmptyConversation
    ? getEmptyHeaderHint(auth.role)
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const messageText = trimmedInput;
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
      setInput(messageText);
    }
  }

  function handlePromptSelect(prompt: string) {
    setInput(prompt);
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
    setSelectedRole(role);
  }

  function handleDeleteChat() {
    clearError();
    setInput("");
    clearThread();
  }

  const helperText = useMemo(() => {
    if (isSubmitting) return SUBMITTING_HINT;
    if (provider.isOpenAISelected && !provider.isOpenAIReady) {
      return VERIFY_KEY_HINT;
    }
    if (!provider.isOpenAISelected && !provider.isProviderReady) {
      return VERIFY_PROVIDER_URL_HINT;
    }
    return auth.role === "manager"
      ? "Review the pending queue first, then approve or reject with UI confirmation."
      : "Review your balance or requests first; leave changes now require a quick UI confirmation.";
  }, [
    auth.role,
    isSubmitting,
    provider.isOpenAIReady,
    provider.isOpenAISelected,
    provider.isProviderReady,
  ]);

  const accountPanel = (
    <MockAuthPanel
      role={auth.role}
      session={auth.session}
      disabled={isLoading}
      onRoleChange={handleRoleChange}
    />
  );

  const sidebarProviderPanel = (
    <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
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
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {provider.validationError}
        </p>
      ) : null}
    </div>
  );

  return (
    <main className="min-h-screen min-h-dvh px-4 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] min-h-[calc(100dvh-2rem)] w-full max-w-[1600px] flex-col gap-4 sm:min-h-[calc(100vh-2.5rem)] sm:min-h-[calc(100dvh-2.5rem)] lg:flex-row">
        <ThreadSidebar
          thread={activeThread}
          disabled={isLoading}
          accountPanel={accountPanel}
          providerPanel={sidebarProviderPanel}
          onDeleteThread={handleDeleteChat}
        />

        <section className="flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 shadow-2xl shadow-slate-900/5 backdrop-blur">
          <header className="border-b border-slate-200/80 bg-white/70 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Text as="p" className="text-xs font-medium uppercase tracking-[0.2em] text-sky-600">
                  {APP_TITLE}
                </Text>
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {auth.session.roleLabel}
                </span>
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  Review first
                </span>
              </div>

              <div className="space-y-2">
                <Text as="h2" className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.9rem]">
                  {headerTitle}
                </Text>
                <Text variant="subtitle" className="max-w-2xl text-[15px] leading-7 text-slate-600">
                  {headerSubtitle}
                </Text>
                {headerHint ? (
                  <Text variant="caption" className="block text-slate-500">
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
