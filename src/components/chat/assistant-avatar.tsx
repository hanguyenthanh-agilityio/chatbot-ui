import {
  APP_ASSISTANT_AVATAR_ALT,
  APP_ASSISTANT_AVATAR_SRC,
} from "@/constants/app";
import { cn } from "@/utils/class-name";

const AVATAR_SIZE_CLASSES = {
  sm: "h-[30px] w-[30px] rounded-full",
  md: "h-9 w-9 rounded-full",
  lg: "h-14 w-14 rounded-full",
} as const;

type AssistantAvatarProps = {
  size?: keyof typeof AVATAR_SIZE_CLASSES;
  className?: string;
};

export function AssistantAvatar({
  size = "sm",
  className,
}: AssistantAvatarProps) {
  return (
    <div
      role="img"
      aria-label={APP_ASSISTANT_AVATAR_ALT}
      className={cn(
        "shrink-0 overflow-hidden border border-white/[.18] bg-cover bg-center shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
        AVATAR_SIZE_CLASSES[size],
        className,
      )}
      style={{
        backgroundImage: `url(${APP_ASSISTANT_AVATAR_SRC}), linear-gradient(135deg,#7c3aed,#06b6d4)`,
      }}
    />
  );
}
