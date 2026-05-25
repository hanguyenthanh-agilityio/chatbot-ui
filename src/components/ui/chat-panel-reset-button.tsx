"use client";

import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/components/ui/icons";
import { CHAT_PANEL_RESET_COPY } from "@/constants/chat";

export function ChatPanelResetButton({
  disabled = false,
  onClick,
  className,
}: {
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="chatPanelReset"
      disabled={disabled}
      aria-label={CHAT_PANEL_RESET_COPY.ariaLabel}
      title={CHAT_PANEL_RESET_COPY.tooltip}
      onClick={onClick}
      className={className}
    >
      <RefreshIcon className="chat-panel-reset-icon" />
    </Button>
  );
}
