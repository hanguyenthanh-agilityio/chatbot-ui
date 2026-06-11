import { objectKeys } from "@/utils/object-keys";

export const TEXT_VARIANT_CLASSES = {
  display:
    "font-primary text-3xl font-bold tracking-tight text-white light:text-app-fg",
  title: "font-primary text-2xl font-bold text-white light:text-app-fg",
  eyebrow:
    "font-primary text-xs font-semibold uppercase tracking-[0.2em] text-white/55 light:text-app-fg-tertiary",
  eyebrowMuted:
    "font-primary text-xs font-semibold uppercase tracking-[0.2em] text-white/50 light:text-app-fg-faint",
  sectionTitle:
    "font-primary text-sm font-semibold text-white/80 light:text-app-fg-muted",
  subtitle:
    "font-secondary text-[15px] leading-7 text-white/70 light:text-app-fg-muted",
  body: "font-secondary text-sm text-white/80 light:text-app-fg-muted",
  bodyStrong:
    "font-secondary text-sm font-medium text-white/80 light:text-app-fg-muted",
  muted: "font-secondary text-sm text-white/65 light:text-app-fg-quaternary",
  caption: "font-secondary text-xs text-white/60 light:text-app-fg-subtle",
  captionStrong:
    "font-secondary text-xs text-white/65 light:text-app-fg-quaternary",
  captionMuted:
    "font-secondary text-xs text-white/55 light:text-app-fg-tertiary",
  helper: "font-secondary text-compact-11 text-white/50 light:text-app-fg-faint",
  inherit: "text-sm text-inherit",
  error: "text-sm text-red-400 light:text-app-danger-fg",
  warning: "text-xs text-amber-400 light:text-app-warning-fg",
} as const;

export const TEXT_VARIANT_OPTIONS = objectKeys(TEXT_VARIANT_CLASSES);
