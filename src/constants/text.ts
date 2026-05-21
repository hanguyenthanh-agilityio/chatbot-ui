export const TEXT_VARIANT_CLASSES = {
  display:
    "font-primary text-3xl font-bold tracking-tight text-white light:text-app-fg",
  title: "font-primary text-2xl font-bold text-white light:text-app-fg",
  eyebrow:
    "font-primary text-xs font-semibold uppercase tracking-[0.2em] text-white/55 light:text-app-muted-55",
  eyebrowMuted:
    "font-primary text-xs font-semibold uppercase tracking-[0.2em] text-white/50 light:text-app-muted-50",
  sectionTitle:
    "font-primary text-sm font-semibold text-white/80 light:text-app-fg-muted",
  subtitle:
    "font-secondary text-[15px] leading-7 text-white/70 light:text-app-muted-70",
  body: "font-secondary text-sm text-white/80 light:text-app-fg-muted",
  bodyStrong:
    "font-secondary text-sm font-medium text-white/80 light:text-app-fg-muted",
  muted: "font-secondary text-sm text-white/65 light:text-app-muted-65",
  caption: "font-secondary text-xs text-white/60 light:text-app-muted-60",
  captionStrong: "font-secondary text-xs text-white/65 light:text-app-muted-65",
  captionMuted: "font-secondary text-xs text-white/55 light:text-app-muted-55",
  helper:
    "font-secondary text-compact-11 text-white/50 light:text-app-muted-50",
  inherit: "text-sm text-inherit",
  error: "text-sm text-red-400 light:text-red-600",
  warning: "text-xs text-amber-400 light:text-amber-700",
} as const;

export const TEXT_VARIANT_OPTIONS = Object.keys(
  TEXT_VARIANT_CLASSES,
) as (keyof typeof TEXT_VARIANT_CLASSES)[];
