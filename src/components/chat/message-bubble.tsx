import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/utils/class-name";

type MessageBubbleProps = {
  isUser: boolean;
  text?: string;
  placeholder?: string;
  fullWidth?: boolean;
  children?: ReactNode;
};

export function MessageBubble({
  isUser,
  text,
  placeholder,
  fullWidth = false,
  children,
}: MessageBubbleProps) {
  if (isUser) {
    return (
      <div
        className={cn(
          "ml-auto max-w-bubble-user rounded-bubble-user border border-violet-300/28 px-[0.9375rem] py-2.5 text-sm leading-relaxed break-words text-white/90 shadow-bubble-user backdrop-blur-lg",
          "bg-bubble-user",
        )}
      >
        <span className="whitespace-pre-wrap">{text ?? placeholder}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/11 px-4 py-2.5 text-sm leading-relaxed text-white/88 shadow-bubble-assistant backdrop-blur-md",
        "bg-bubble-assistant",
        fullWidth ? "max-w-full" : "max-w-bubble-assistant",
      )}
    >
      {text ? <span className="whitespace-pre-wrap">{text}</span> : null}
      {!text && placeholder ? (
        <span className="text-white/40">{placeholder}</span>
      ) : null}
      {children ? (
        <div className={cn(text || placeholder ? "mt-3" : undefined)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

type MessageAvatarProps = {
  initials: string;
  isUser: boolean;
  avatarUrl?: string;
  avatarLabel?: string;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
};

export function MessageAvatar({
  initials,
  isUser,
  avatarUrl,
  avatarLabel = "User avatar",
  size = "sm",
}: MessageAvatarProps) {
  if (isUser) {
    return (
      <Avatar
        variant="user"
        src={avatarUrl}
        alt={avatarLabel}
        initials={initials}
        size={size}
        className="mt-1"
      />
    );
  }

  return <Avatar variant="assistant" size="sm" className="mt-1" />;
}
