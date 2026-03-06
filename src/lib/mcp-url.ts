export function normalizeMcpServerUrl(rawUrl?: string): string | null {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    const normalizedPath = url.pathname.replace(/\/+$/, "");

    if (!normalizedPath || normalizedPath === "/") {
      url.pathname = "/mcp";
    } else if (!normalizedPath.endsWith("/mcp")) {
      url.pathname = `${normalizedPath}/mcp`;
    } else {
      url.pathname = normalizedPath;
    }

    return url.toString();
  } catch {
    return null;
  }
}
