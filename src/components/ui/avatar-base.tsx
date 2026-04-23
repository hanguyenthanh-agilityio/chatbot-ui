import type { ReactNode } from "react";
import { cn } from "@/utils/class-name";

export const AVATAR_SIZE_CLASSES = {
  assistant: {
    sm: "h-[30px] w-[30px]",
    md: "h-9 w-9",
    lg: "h-14 w-14",
  },
  user: {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  },
} as const;

const AVATAR_BASE_CLASS =
  "shrink-0 overflow-hidden rounded-full bg-cover bg-center";

const AVATAR_VARIANT_CLASS = {
  assistant:
    "border border-white/[.18] shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
  user: "grid place-items-center bg-indigo-500/30 font-semibold text-white ring-2 ring-indigo-500/30",
} as const;

export type AvatarVariant = keyof typeof AVATAR_SIZE_CLASSES;
export type AvatarSize = keyof (typeof AVATAR_SIZE_CLASSES)["assistant"];

type AvatarBaseProps = {
  alt: string;
  variant: AvatarVariant;
  size?: AvatarSize;
  className?: string;
  backgroundImage?: string;
  children?: ReactNode;
};

export function AvatarBase({
  alt,
  variant,
  size = "sm",
  className,
  backgroundImage,
  children,
}: AvatarBaseProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        AVATAR_BASE_CLASS,
        AVATAR_VARIANT_CLASS[variant],
        AVATAR_SIZE_CLASSES[variant][size],
        className,
      )}
      style={backgroundImage ? { backgroundImage } : undefined}
    >
      {children}
    </div>
  );
}

