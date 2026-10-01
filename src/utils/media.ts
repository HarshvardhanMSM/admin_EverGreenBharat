/**
 * Resolves an image URL so it can be rendered reliably in the browser.
 * Handles:
 * - Absolute URLs (http://, https://, data:, blob:)
 * - Relative upload URLs (/api/v1/uploads/..., /uploads/...)
 * - Prepending backend base URL if needed so it works across different host/ports
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Full external or inline URLs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const backendBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:3000";

  // If path starts with /uploads/ (legacy seed format), map to /api/v1/uploads/
  if (trimmed.startsWith("/uploads/")) {
    return `${backendBase}/api/v1${trimmed}`;
  }

  // If path starts with /api/, prepend backend base
  if (trimmed.startsWith("/api/")) {
    return `${backendBase}${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${backendBase}${trimmed}`;
  }

  return `${backendBase}/${trimmed}`;
}
