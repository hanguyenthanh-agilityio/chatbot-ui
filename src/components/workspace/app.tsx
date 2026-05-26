"use client";

import { useSyncExternalStore } from "react";

// Components
import { ChatPanelResetButton } from "@/components/ui/chat-panel-reset-button";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { ChatComposer } from "@/components/chat/composer";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChatTranscript } from "@/components/transcript";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Text } from "@/components/ui/text";
import { AuthPanel } from "@/components/workspace/auth-panel";
import { ThreadSidebar } from "@/components/workspace/sidebar";

// Constants
import { APP_NAME, APP_HEADER_REVIEW_BADGE_LABEL } from "@/constants/app";
import { THEME_SHELL_CLASSES, THEME_SHELL_UTILITIES } from "@/constants/theme";
import { CHAT_COMPOSER_COPY } from "@/constants/chat";
import { DEFAULT_PROVIDER_OPTIONS } from "@/constants/provider";

// Libs
import type { AppRole, MockAuthSession } from "@/lib/auth/session";
import { isProductionLike } from "@/lib/runtime-env";
import type { AIProviderName } from "@/lib/ai-provider";

// Utils
import { getInitialsFromName } from "@/utils/avatar";
import { cn } from "@/utils/class-name";

// Hooks
import { useWorkspaceApp } from "@/hooks/use-workspace-app";

const ALLOWED_PROVIDERS: AIProviderName[] = isProductionLike()
  ? ["openai"]
  : DEFAULT_PROVIDER_OPTIONS;

type WorkspaceAppProps = {
  authRole?: AppRole;
  authSessions: Record<AppRole, MockAuthSession>;
};
export function WorkspaceApp({
  authRole = "user",
  authSessions,
}: WorkspaceAppProps) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isHydrated) {
    return (
      <main className="min-h-dvh px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto flex min-h-page-sm w-full max-w-shell flex-col gap-3 sm:min-h-page-md sm:gap-4 lg:flex-row">
          <div
            className={cn(
              "h-chat-viewport w-full rounded-shell border backdrop-blur-[28px] lg:max-w-sm",
              "bg-glass-panel-alt",
              THEME_SHELL_UTILITIES.border,
            )}
          />
          <div
            className={cn(
              "h-chat-viewport flex-1 rounded-shell border backdrop-blur-[28px]",
              "bg-glass-panel-alt",
              THEME_SHELL_UTILITIES.border,
            )}
          />
        </div>
      </main>
    );
  }

  return <WorkspaceAppClient authRole={authRole} authSessions={authSessions} />;
}

function WorkspaceAppClient({ authRole, authSessions }: WorkspaceAppProps) {
  const {
    input,
    setInput,
    auth,
    provider,
    messages,
    isLoading,
    canSend,
    requestError,
    quickActions,
    headerTitle,
    headerSubtitle,
    headerHint,
    helperText,
    messagesContainerRef,
    activeThread,
    allThreads,
    switchThread,
    createNewThread,
    deleteThread,
    handleSubmit,
    handlePromptSelect,
    handleToolApproval,
    handleRoleChange,
    handleStop,
  } = useWorkspaceApp(authRole ?? "user", authSessions);

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
      className="p-4 shadow-panel text-white light:text-app-fg"
    >
      <ProviderSelector
        provider={provider}
        allowedProviders={ALLOWED_PROVIDERS}
        withContainer={false}
      />
      {provider.validationError ? (
        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 light:border-app-danger-border light:bg-app-danger-bg light:text-app-danger-fg">
          {provider.validationError}
        </p>
      ) : null}
    </Card>
  );

  return (
    <main className="min-h-screen px-3 py-3 sm:px-5 sm:py-5">
      {provider.successMessage ? (
        <Toast
          message={provider.successMessage}
          variant="success"
          onDismiss={provider.dismissSuccessMessage}
        />
      ) : null}
      <div className="mx-auto flex min-h-page-sm w-full max-w-shell flex-col gap-3 sm:min-h-page-dvh sm:gap-4 lg:flex-row">
        <ThreadSidebar
          activeThread={activeThread}
          allThreads={allThreads}
          disabled={isLoading}
          accountPanel={accountPanel}
          providerPanel={sidebarProviderPanel}
          headerActions={
            <>
              <ChatPanelResetButton
                disabled={isLoading || messages.length === 0}
              />
              <ThemeToggle />
            </>
          }
          onSwitchThread={switchThread}
          onCreateThread={createNewThread}
          onDeleteThread={deleteThread}
        />

        <section
          className={cn(
            THEME_SHELL_CLASSES.chatPanel,
            "flex min-h-chat-viewport flex-1 flex-col overflow-hidden rounded-shell border backdrop-blur-[28px] shadow-shell-panel light:backdrop-blur-none",
            "bg-glass-panel-chat",
            THEME_SHELL_UTILITIES.border,
          )}
        >
          <header
            className={cn(
              THEME_SHELL_CLASSES.chatHeader,
              "border-b px-4 py-5 sm:px-6 lg:px-8 shadow-shell-header",
              "bg-glass-header",
              THEME_SHELL_UTILITIES.borderSubtle,
            )}
          >
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
                <Text
                  as="h2"
                  variant="title"
                  className="tracking-tight sm:text-[1.9rem]"
                >
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
            inputTooltip={
              !provider.isProviderReady
                ? CHAT_COMPOSER_COPY.verifyProviderTooltip
                : undefined
            }
            helperText={helperText}
            errorMessage={requestError}
            onInputChange={setInput}
            onSubmitAction={handleSubmit}
            onStopAction={handleStop}
          />
        </section>
      </div>
    </main>
  );
}
