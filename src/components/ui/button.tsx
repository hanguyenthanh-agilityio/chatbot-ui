import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { THEME_TOGGLE_CLASS } from "@/constants/theme";
import { cn } from "@/utils/class-name";

const BUTTON_VARIANT_CLASSES = {
  primary:
    "app-button-primary bg-btn-active text-white hover:brightness-105 disabled:bg-btn-disabled disabled:text-white/75 light:disabled:bg-app-btn-brand-disabled light:disabled:text-white/85",
  secondary:
    "bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400",
  ghost:
    "border-transparent bg-transparent text-white/70 hover:bg-white/8 disabled:text-white/40 light:text-app-fg-muted light:hover:bg-app-hover light:disabled:text-app-fg-faint",
  danger:
    "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300 disabled:text-red-50",
  themeToggle: THEME_TOGGLE_CLASS,
} as const;

const BUTTON_SIZE_CLASSES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;
type ButtonVariant = keyof typeof BUTTON_VARIANT_CLASSES;
type ButtonSize = keyof typeof BUTTON_SIZE_CLASSES;

const CUSTOM_SHELL_VARIANTS = new Set<ButtonVariant>(["themeToggle"]);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        !CUSTOM_SHELL_VARIANTS.has(variant) &&
          "inline-flex items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed",
        BUTTON_VARIANT_CLASSES[variant],
        !CUSTOM_SHELL_VARIANTS.has(variant) && BUTTON_SIZE_CLASSES[size],
        !CUSTOM_SHELL_VARIANTS.has(variant) && fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
