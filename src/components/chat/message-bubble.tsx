import type { ReactNode } from "react";
import { AssistantAvatar } from "@/components/chat/assistant-avatar";
import { UserAvatar } from "@/components/ui/user-avatar";

type MessageBubbleProps = {
  isUser: boolean;
  text?: string;
  placeholder?: string;
};

export function MessageBubble({ isUser, text, placeholder }: MessageBubbleProps) {
  if (isUser) {
    return (
      <div className="ml-auto py-[10px] px-[15px] max-w-[75%] text-sm leading-relaxed break-words font-dm-sans text-white/[.87] rounded-[18px_4px_18px_18px] bg-[linear-gradient(135deg,rgba(124,58,237,.5),rgba(79,70,229,.5))] backdrop-blur-lg border border-violet-500/35 shadow-[0_4px_18px_rgba(99,60,220,0.18)]">
        <span className="whitespace-pre-wrap">{text ?? placeholder}</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-2.5 max-w-[72%] text-sm leading-relaxed font-dm-sans text-white/[.87] rounded-tl rounded-tr-2xl rounded-br-2xl rounded-bl-2xl bg-white/[.08] backdrop-blur-md border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
      <span className="whitespace-pre-wrap">{text ?? <span className="text-white/40">{placeholder}</span>}</span>
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
      <UserAvatar
        src={avatarUrl}
        alt={avatarLabel}
        initials={initials}
        size={size}
        className="mt-1"
      />
    );
  }

  return <AssistantAvatar size="sm" className="mt-1" />;
}
