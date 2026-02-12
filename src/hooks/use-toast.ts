"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastVariant = "info" | "success" | "error";

export type ToastNotification = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ShowErrorInput = {
  title?: string;
  description: string;
  durationMs?: number;
};

const DEFAULT_TOAST_DURATION_MS = 4500;

function createToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const timeoutMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismissToast = useCallback((id: string) => {
    const timeout = timeoutMapRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutMapRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "info",
      durationMs = DEFAULT_TOAST_DURATION_MS,
    }: ToastInput) => {
      const id = createToastId();

      setToasts((prev) => [
        ...prev,
        {
          id,
          title,
          description,
          variant,
        },
      ]);

      const timeout = setTimeout(() => {
        dismissToast(id);
      }, durationMs);

      timeoutMapRef.current.set(id, timeout);
      return id;
    },
    [dismissToast],
  );

  const showError = useCallback(
    ({ title = "Request failed", description, durationMs }: ShowErrorInput) => {
      return showToast({
        title,
        description,
        durationMs,
        variant: "error",
      });
    },
    [showToast],
  );

  useEffect(() => {
    const timeoutMap = timeoutMapRef.current;

    return () => {
      timeoutMap.forEach((timeout) => clearTimeout(timeout));
      timeoutMap.clear();
    };
  }, []);

  return {
    toasts,
    showToast,
    showError,
    dismissToast,
  };
}
