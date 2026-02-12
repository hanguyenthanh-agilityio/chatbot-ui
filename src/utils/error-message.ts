const DEFAULT_ERROR_MESSAGE = "An unknown error occurred.";

export function getErrorMessage(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): string {
  switch (true) {
    case error instanceof Error:
      return error.message;
    case typeof error === "string":
      return error;
    case Boolean(error && typeof error === "object" && "message" in error): {
      const message = (error as { message?: unknown }).message;
      return typeof message === "string" ? message : fallbackMessage;
    }
    default:
      return fallbackMessage;
  }
}

type ApiErrorPayload = {
  error?: unknown;
  message?: unknown;
  details?: unknown;
};

function getNestedErrorMessage(value: unknown): string | undefined {
  switch (true) {
    case typeof value === "string":
      return value;
    case Boolean(value && typeof value === "object" && "message" in value): {
      const message = (value as { message?: unknown }).message;
      return typeof message === "string" ? message : undefined;
    }
    default:
      return undefined;
  }
}

export function normalizeErrorMessage(
  rawMessage: string,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): string {
  const trimmedMessage = rawMessage.trim();
  if (!trimmedMessage) return fallbackMessage;

  try {
    const parsed = JSON.parse(trimmedMessage) as ApiErrorPayload;

    const fromError = getNestedErrorMessage(parsed.error);
    const fromMessage = getNestedErrorMessage(parsed.message);
    const fromDetails = getNestedErrorMessage(parsed.details);

    switch (true) {
      case typeof fromError === "string":
        return fromError;
      case typeof fromMessage === "string":
        return fromMessage;
      case typeof fromDetails === "string":
        return fromDetails;
      default:
        return trimmedMessage;
    }
  } catch {
    return trimmedMessage;
  }
}

export function getDisplayErrorMessage(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): string {
  return normalizeErrorMessage(getErrorMessage(error, fallbackMessage));
}
