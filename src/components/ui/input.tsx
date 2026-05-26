import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import {
  FORM_FIELD_PANEL_CLASSES,
  FORM_FIELD_PANEL_FOCUS_CLASSES,
} from "@/constants/theme";
import { cn } from "@/utils/class-name";

const INPUT_VARIANT_CLASSES = {
  default:
    "border border-white/12 bg-white/6 text-white/80 shadow-sm placeholder:text-white/30 hover:border-white/20 light:border-app-border light:bg-app-field light:text-app-fg light:placeholder:text-app-fg-faint light:hover:border-app-border-emphasis",
  subtle:
    "border border-white/8 bg-white/4 text-white/72 placeholder:text-white/25 hover:border-white/14 light:border-app-border-subtle light:bg-app-surface-subtle light:text-app-fg-muted light:placeholder:text-app-fg-faint light:hover:border-app-border",
  ghost:
    "border border-transparent bg-transparent text-white/80 placeholder:text-white/30 hover:border-white/12 light:text-app-fg light:placeholder:text-app-fg-faint light:hover:border-app-border-subtle",
  error:
    "border border-red-500/30 bg-red-500/10 text-red-300 placeholder:text-red-300/50 shadow-sm hover:border-red-500/40 light:border-app-danger-border light:bg-app-danger-bg light:text-app-danger-fg light:placeholder:text-app-danger-fg/60 light:hover:border-app-danger-border",
  panel: FORM_FIELD_PANEL_CLASSES,
} as const;

const INPUT_FOCUS_CLASSES = FORM_FIELD_PANEL_FOCUS_CLASSES;

const INPUT_SIZE_CLASSES = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-3 text-sm",
  lg: "h-11 px-4 text-sm",
} as const;

type InputVariant = keyof typeof INPUT_VARIANT_CLASSES;
type InputSize = keyof typeof INPUT_SIZE_CLASSES;

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
  controlSize?: InputSize;
  fullWidth?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      controlSize = "md",
      fullWidth = false,
      className,
      ...props
    },
    ref,
  ) => (
    <input
      ref={ref}
      className={cn(
        "rounded-xl outline-none transition duration-200",
        INPUT_FOCUS_CLASSES,
        "disabled:cursor-not-allowed disabled:opacity-60",
        INPUT_VARIANT_CLASSES[variant],
        INPUT_SIZE_CLASSES[controlSize],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
