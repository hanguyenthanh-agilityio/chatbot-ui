import { AvatarBase, type AvatarSize } from "@/components/ui/avatar-base";

type UserAvatarProps = {
  src?: string;
  alt: string;
  initials: string;
  size?: AvatarSize;
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
    <AvatarBase
      alt={alt}
      variant="user"
      size={size}
      className={className}
      backgroundImage={hasSource ? `url(${src})` : undefined}
    >
      {hasSource ? null : initials}
    </AvatarBase>
  );
}
