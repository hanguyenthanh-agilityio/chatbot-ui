import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";

type MessageBubbleProps = {
  isUser: boolean;
  text?: string;
  placeholder?: string;
};

export function MessageBubble({ isUser, text, placeholder }: MessageBubbleProps) {
  return (
    <div
      className={`rounded-3xl px-4 py-3 shadow-sm ${
        isUser
          ? "ml-auto bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-900"
      }`}
    >
      {text ? (
        <Text variant="inherit" className="whitespace-pre-wrap text-[15px] leading-7">
          {text}
        </Text>
      ) : (
        <Text variant="muted" className="whitespace-pre-wrap leading-relaxed">
          {placeholder}
        </Text>
      )}
    </div>
  );
}

type MessageAvatarProps = {
  initials: string;
  isUser: boolean;
  children?: ReactNode;
};

export function MessageAvatar({ initials, isUser }: MessageAvatarProps) {
  return (
    <div
      className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        isUser ? "bg-slate-200 text-slate-700" : "bg-slate-900 text-white"
      }`}
    >
      {initials}
    </div>
  );
}
