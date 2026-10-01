const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isValidToken(token: any): token is string {
  return (
    typeof token === "string" &&
    token.trim().length > 0 &&
    token !== "undefined" &&
    token !== "null"
  );
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return isValidToken(token) ? token : null;
}

export function setAccessToken(token: string): void {
  if (!isBrowser()) return;
  if (isValidToken(token)) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function removeAccessToken(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  const token = localStorage.getItem(REFRESH_TOKEN_KEY);
  return isValidToken(token) ? token : null;
}

export function setRefreshToken(token: string): void {
  if (!isBrowser()) return;
  if (isValidToken(token)) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearTokens(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
