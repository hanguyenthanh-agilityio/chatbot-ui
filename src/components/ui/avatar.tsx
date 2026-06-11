import { cn } from "@/utils/class-name";
import { objectKeys } from "@/utils/object-keys";
import {
  APP_ASSISTANT_AVATAR_ALT,
  APP_ASSISTANT_AVATAR_SRC,
} from "@/constants/app";

const SIZE = {
  sm: { box: "size-avatar-sm", text: "text-compact-10 tracking-wide" },
  md: { box: "h-9 w-9", text: "text-compact-11 tracking-wide" },
  lg: { box: "h-14 w-14", text: "text-sm tracking-wider" },
} as const;

export type AvatarSize = keyof typeof SIZE;

export const AVATAR_SIZE_OPTIONS = objectKeys(SIZE);

const BASE =
  "relative shrink-0 select-none overflow-hidden rounded-full bg-cover bg-center";

type AvatarProps =
  | { variant: "assistant"; size?: AvatarSize; className?: string }
  | {
      variant: "user";
      src?: string;
      alt: string;
      initials: string;
      size?: AvatarSize;
      className?: string;
    };

export function Avatar(props: AvatarProps) {
  if (props.variant === "assistant") {
    const { size = "sm", className } = props;
    return (
      <div
        role="img"
        aria-label={APP_ASSISTANT_AVATAR_ALT}
        className={cn(
          BASE,
          SIZE[size].box,
          "border border-white/20 shadow-avatar-brand light:border-app-border",
          className,
        )}
        style={{
          backgroundImage: `url(${APP_ASSISTANT_AVATAR_SRC}), var(--avatar-assistant-fallback)`,
        }}
      />
    );
  }

  const { src, alt, initials, size = "sm", className } = props;
  const hasImage = Boolean(src?.trim());

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        BASE,
        SIZE[size].box,
        "bg-avatar-user-placeholder",
        "ring-[1.5px] ring-indigo-400/35 light:ring-stone-400/50",
        !hasImage && "shadow-avatar-placeholder",
        hasImage && "shadow-avatar-photo",
        className,
      )}
      style={hasImage ? { backgroundImage: `url(${src})` } : undefined}
    >
      {hasImage ? null : (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-semibold text-white/90 light:text-white",
            SIZE[size].text,
          )}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
