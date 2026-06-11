import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import {
  FORM_FIELD_PANEL_CLASSES,
  FORM_FIELD_PANEL_FOCUS_CLASSES,
} from "@/constants/theme";
import { cn } from "@/utils/class-name";

const SELECT_DEFAULT_FOCUS_CLASSES =
  "focus:border-violet-400/55 focus:ring-2 focus:ring-violet-400/20 light:focus:border-app-border-emphasis light:focus:ring-amber-700/25";

const SELECT_VARIANT_CLASSES = {
  default:
    "border border-white/12 bg-white/6 text-white/80 shadow-sm hover:border-white/20 light:border-app-border light:bg-app-field light:text-app-fg light:hover:border-app-border-emphasis",
  subtle:
    "border border-white/8 bg-white/4 text-white/72 hover:border-white/14 light:border-app-border-subtle light:bg-app-surface-subtle light:text-app-fg-muted light:hover:border-app-border",
  ghost:
    "border-transparent bg-transparent text-white/80 hover:border-white/12 light:text-app-fg light:hover:border-app-border-subtle",
  panel: cn(
    FORM_FIELD_PANEL_CLASSES,
    "[&>option]:text-white/80 light:[&>option]:text-app-fg",
  ),
} as const;

const SELECT_SIZE_CLASSES = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-3 text-sm",
  lg: "h-11 px-4 text-sm",
} as const;

type SelectVariant = keyof typeof SELECT_VARIANT_CLASSES;
type SelectSize = keyof typeof SELECT_SIZE_CLASSES;

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: SelectVariant;
  controlSize?: SelectSize;
  fullWidth?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = "default",
      controlSize = "md",
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <div className={cn("relative", fullWidth && "w-full")}>
      <select
        ref={ref}
        className={cn(
          "peer w-full cursor-pointer appearance-none rounded-xl border pr-10 outline-none transition duration-200",
          variant === "panel"
            ? FORM_FIELD_PANEL_FOCUS_CLASSES
            : SELECT_DEFAULT_FOCUS_CLASSES,
          "disabled:cursor-not-allowed disabled:opacity-60",
          SELECT_VARIANT_CLASSES[variant],
          SELECT_SIZE_CLASSES[controlSize],
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 right-3 flex items-center transition",
          "text-white/50 peer-focus:text-violet-300/90 light:text-app-fg-faint light:peer-focus:text-app-accent",
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
        >
          <path
            d="M5.5 7.5L10 12l4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  ),
);

Select.displayName = "Select";
