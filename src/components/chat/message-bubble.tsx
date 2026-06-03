import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/utils/class-name";

export type MessageBubbleProps = {
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
          "ml-auto w-fit max-w-full shrink-0 rounded-bubble-user border px-3.75 py-2.5 text-sm leading-relaxed break-words shadow-bubble-user backdrop-blur-lg",
          "border-violet-300/28 bg-bubble-user text-white/90",
          "light:border-stone-600/20 light:text-white/95 light:backdrop-blur-none",
        )}
      >
        <span className="whitespace-pre-wrap">{text ?? placeholder}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-2.5 text-sm leading-relaxed shadow-bubble-assistant backdrop-blur-md",
        "border-white/11 bg-bubble-assistant text-white/88",
        "light:border-app-border light:text-app-fg light:backdrop-blur-none",
        fullWidth ? "w-full max-w-full" : "w-fit max-w-full",
      )}
    >
      {text ? <span className="whitespace-pre-wrap">{text}</span> : null}
      {!text && placeholder ? (
        <span className="text-white/40 light:text-app-fg-faint">
          {placeholder}
        </span>
      ) : null}
      {children ? (
        <div className={cn(text || placeholder ? "mt-3" : undefined)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export type MessageAvatarProps = {
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
