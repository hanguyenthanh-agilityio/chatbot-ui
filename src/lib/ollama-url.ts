export function normalizeOllamaBaseUrl(rawUrl?: string): string | null {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    const normalizedPath = url.pathname.replace(/\/+$/, "");

    if (!normalizedPath || normalizedPath === "/") {
      url.pathname = "/v1";
    } else if (!normalizedPath.endsWith("/v1")) {
      url.pathname = `${normalizedPath}/v1`;
    } else {
      url.pathname = normalizedPath;
    }

    return url.toString();
  } catch {
    return null;
  }
}
