import type { ComponentPropsWithoutRef, ElementType } from "react";

import type { TEXT_VARIANT_CLASSES } from "@/constants/text";

export type TextVariant = keyof typeof TEXT_VARIANT_CLASSES;

export type TextProps<T extends ElementType = "p"> = {
  as?: T;
  variant?: TextVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;
