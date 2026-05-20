import { cn } from "@/utils/class-name";
import {
  APP_ASSISTANT_AVATAR_ALT,
  APP_ASSISTANT_AVATAR_SRC,
} from "@/constants/app";

const SIZE = {
  sm: { box: "size-avatar-sm", text: "text-[10px] tracking-wide" },
  md: { box: "h-9 w-9",           text: "text-[11px] tracking-wide" },
  lg: { box: "h-14 w-14",         text: "text-sm tracking-wider"    },
} as const;

export type AvatarSize = keyof typeof SIZE;

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
          "border border-white/20 shadow-avatar-brand",
          className,
        )}
        style={{
          backgroundImage: `url(${APP_ASSISTANT_AVATAR_SRC}), linear-gradient(135deg,#7c3aed 0%,#06b6d4 100%)`,
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
        "bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.45),rgba(109,40,217,0.35))]",
        "ring-[1.5px] ring-indigo-400/35",
        !hasImage && "shadow-avatar-placeholder",
        hasImage && "shadow-avatar-photo",
        className,
      )}
      style={hasImage ? { backgroundImage: `url(${src})` } : undefined}
    >
      {hasImage ? null : (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-semibold text-white/90",
            SIZE[size].text,
          )}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
