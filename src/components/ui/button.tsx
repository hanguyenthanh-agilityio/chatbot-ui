import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import {
  COMPOSER_ATTACH_CHIP_REMOVE_CLASS,
  COMPOSER_ATTACH_MENU_ITEM_CLASS,
  COMPOSER_ATTACH_TOGGLE_BUTTON_CLASS,
} from "@/constants/file-attachment";
import { CHAT_PANEL_RESET_CLASS, THEME_TOGGLE_CLASS } from "@/constants/theme";
import { cn } from "@/utils/class-name";

const BUTTON_VARIANT_CLASSES = {
  primary:
    "app-button-primary bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:text-white light:bg-btn-active light:text-white light:hover:brightness-105 light:disabled:bg-app-btn-brand-disabled light:disabled:text-white/85",
  secondary:
    "bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 disabled:text-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300 disabled:text-red-50",
  themeToggle: THEME_TOGGLE_CLASS,
  chatPanelReset: CHAT_PANEL_RESET_CLASS,
  composerAttachToggle: COMPOSER_ATTACH_TOGGLE_BUTTON_CLASS,
  composerAttachMenuItem: COMPOSER_ATTACH_MENU_ITEM_CLASS,
  composerAttachChipRemove: COMPOSER_ATTACH_CHIP_REMOVE_CLASS,
} as const;

const BUTTON_SIZE_CLASSES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;
type ButtonVariant = keyof typeof BUTTON_VARIANT_CLASSES;
type ButtonSize = keyof typeof BUTTON_SIZE_CLASSES;

const CUSTOM_SHELL_VARIANTS = new Set<ButtonVariant>([
  "themeToggle",
  "chatPanelReset",
  "composerAttachToggle",
  "composerAttachMenuItem",
  "composerAttachChipRemove",
]);

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
          "inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed",
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
