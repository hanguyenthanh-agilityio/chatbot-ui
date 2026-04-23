import type { ReactNode } from "react";

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
  children?: ReactNode;
};

export function MessageAvatar({ initials, isUser }: MessageAvatarProps) {
  if (isUser) {
    return (
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] font-semibold text-white ring-2 ring-indigo-500/30">
        {initials}
      </div>
    );
  }

  return (
    <div className="mt-1 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#06b6d4)] border border-white/[.18] text-[10px] font-bold text-white">
      {initials}
    </div>
  );
}
