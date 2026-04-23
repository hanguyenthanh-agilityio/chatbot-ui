import {
  APP_ASSISTANT_AVATAR_ALT,
  APP_ASSISTANT_AVATAR_SRC,
} from "@/constants/app";
import { AvatarBase, type AvatarSize } from "@/components/ui/avatar-base";

type AssistantAvatarProps = {
  size?: AvatarSize;
  className?: string;
};

export function AssistantAvatar({
  size = "sm",
  className,
}: AssistantAvatarProps) {
  return (
    <AvatarBase
      alt={APP_ASSISTANT_AVATAR_ALT}
      variant="assistant"
      size={size}
      className={className}
      backgroundImage={`url(${APP_ASSISTANT_AVATAR_SRC}), linear-gradient(135deg,#7c3aed,#06b6d4)`}
    />
  );
}
