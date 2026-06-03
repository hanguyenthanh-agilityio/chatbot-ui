"use client";

import { useState, useSyncExternalStore } from "react";

// Components
import { ChatPanelResetButton } from "@/components/ui/chat-panel-reset-button";
import { ProviderSelector } from "@/components/chat/provider-selector";
import { ChatComposer } from "@/components/chat/composer";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChatTranscript } from "@/components/transcript";
import { FilePreviewPanel } from "@/components/chat/file-preview-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Text } from "@/components/ui/text";
import { AuthPanel } from "@/components/workspace/auth-panel";
import { ThreadSidebar } from "@/components/workspace/sidebar";

// Constants
import { APP_NAME, APP_HEADER_REVIEW_BADGE_LABEL } from "@/constants/app";
import {
  SHELL_BACKDROP_BLUR_28,
  THEME_SHELL_CLASSES,
  THEME_SHELL_UTILITIES,
  WORKSPACE_GRID_COLS_LG,
  WORKSPACE_GRID_COLS_XL,
} from "@/constants/theme";
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
              "h-chat-viewport w-full rounded-shell border lg:max-w-sm",
              SHELL_BACKDROP_BLUR_28,
              "bg-glass-panel-alt",
              THEME_SHELL_UTILITIES.border,
            )}
          />
          <div
            className={cn(
              "h-chat-viewport flex-1 rounded-shell border",
              SHELL_BACKDROP_BLUR_28,
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
    handleResetChatPanel,
    composerAttachment,
  } = useWorkspaceApp(authRole ?? "user", authSessions);

  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);

  function handleAttachFile(file: File) {
    composerAttachment.attachFile(file);
    setIsFilePreviewOpen(true);
  }

  function handleRemoveAttachedFile() {
    setIsFilePreviewOpen(false);
    composerAttachment.clearAttachment();
  }

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
    <main className="min-h-dvh px-3 py-3 sm:px-5 sm:py-5 lg:h-dvh lg:overflow-hidden">
      {provider.successMessage ? (
        <Toast
          message={provider.successMessage}
          variant="success"
          onDismiss={provider.dismissSuccessMessage}
        />
      ) : null}
      <div className="mx-auto flex min-h-dvh w-full max-w-shell flex-col gap-3 sm:gap-4 lg:h-full lg:min-h-0">
        {/* Workspace body */}
        <div
          className={cn(
            "min-h-0 flex flex-1 flex-col gap-3 sm:gap-4",
            // 3-column workspace: tools | transcript | nav (threads)
            // Keep the nav readable by giving it a larger min width.
            "lg:grid lg:gap-4",
            WORKSPACE_GRID_COLS_LG,
            WORKSPACE_GRID_COLS_XL,
          )}
        >
          {/* Tools (compact) — left rail */}
          <aside
            className={cn(
              "flex min-h-0 flex-col overflow-hidden rounded-shell border backdrop-blur-shell shadow-shell px-2!",
              "bg-glass-panel",
              THEME_SHELL_UTILITIES.border,
              THEME_SHELL_UTILITIES.text,
            )}
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="p-3">{accountPanel}</div>
              <div
                className={cn("border-t", THEME_SHELL_UTILITIES.borderSubtle)}
              />
              <div className="p-3">{sidebarProviderPanel}</div>
            </div>
          </aside>

          {/* Transcript + composer */}
          <section
            className={cn(
              THEME_SHELL_CLASSES.chatPanel,
              "flex min-h-0 flex-1 flex-col overflow-hidden rounded-shell border shadow-shell-panel light:backdrop-blur-none",
              SHELL_BACKDROP_BLUR_28,
              "bg-glass-panel-chat",
              THEME_SHELL_UTILITIES.border,
            )}
          >
            {/* Header belongs to the middle column (Notion/workspace style). */}
            <header
              className={cn(
                THEME_SHELL_CLASSES.chatHeader,
                "shrink-0 border-b px-5 py-4 shadow-shell-header",
                "bg-glass-header",
                THEME_SHELL_UTILITIES.borderSubtle,
              )}
            >
              <div className="mx-auto w-full max-w-3xl">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
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
                  <div className="flex shrink-0 items-center gap-2">
                    <ChatPanelResetButton
                      disabled={messages.length === 0}
                      onClick={handleResetChatPanel}
                    />
                    <ThemeToggle />
                  </div>
                </div>

                <Text
                  as="h2"
                  variant="title"
                  className="tracking-tight leading-tight"
                >
                  {headerTitle}
                </Text>
                <Text
                  variant="subtitle"
                  className="mt-1 max-w-3xl line-clamp-1"
                >
                  {headerSubtitle}
                </Text>
                {headerHint ? (
                  <Text
                    variant="captionMuted"
                    className="mt-0.5 block line-clamp-1"
                  >
                    {headerHint}
                  </Text>
                ) : null}
              </div>
            </header>
            <ChatTranscript
              containerRef={messagesContainerRef}
              messages={messages}
              isLoading={isLoading}
              userAvatarUrl={auth.session.avatar}
              userAvatarLabel={`${auth.session.name} avatar`}
              userInitials={getInitialsFromName(auth.session.name)}
              onSelectPrompt={handlePromptSelect}
              onToolApproval={handleToolApproval}
            />
            <ChatComposer
              input={input}
              canSend={canSend}
              isLoading={isLoading}
              isProviderReady={provider.isProviderReady}
              quickActions={quickActions}
              onQuickActionSelect={handlePromptSelect}
              attachmentMenu={{
                onFileSelected: handleAttachFile,
              }}
              attachedFile={composerAttachment.attachedFile}
              onOpenAttachedFilePreview={() => setIsFilePreviewOpen(true)}
              onRemoveAttachedFile={handleRemoveAttachedFile}
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

          {/* Column 3 (right rail): threads OR file preview */}
          {isFilePreviewOpen && composerAttachment.attachedFile ? (
            <FilePreviewPanel
              file={composerAttachment.attachedFile}
              onClose={() => setIsFilePreviewOpen(false)}
            />
          ) : (
            <ThreadSidebar
              variant="nav"
              activeThread={activeThread}
              allThreads={allThreads}
              disabled={isLoading}
              accountPanel={null}
              providerPanel={null}
              headerActions={null}
              onSwitchThread={switchThread}
              onCreateThread={createNewThread}
              onDeleteThread={deleteThread}
            />
          )}
        </div>
      </div>
    </main>
  );
}
