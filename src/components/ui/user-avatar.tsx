import { cn } from "@/utils/class-name";

const USER_AVATAR_SIZE_CLASSES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

type UserAvatarProps = {
  src?: string;
  alt: string;
  initials: string;
  size?: keyof typeof USER_AVATAR_SIZE_CLASSES;
  className?: string;
};

export function UserAvatar({
  src,
  alt,
  initials,
  size = "sm",
  className,
}: UserAvatarProps) {
  const hasSource = Boolean(src);

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "shrink-0 grid place-items-center overflow-hidden rounded-full bg-indigo-500/30 text-white font-semibold ring-2 ring-indigo-500/30 bg-cover bg-center",
        USER_AVATAR_SIZE_CLASSES[size],
        className,
      )}
      style={
        hasSource
          ? {
              backgroundImage: `url(${src})`,
            }
          : undefined
      }
    >
      {hasSource ? null : initials}
    </div>
  );
}
