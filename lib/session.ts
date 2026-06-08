// Shared client-side session state for the admin dashboard. The bearer token is
// held in sessionStorage only — it never ships in the bundle and is cleared when
// the tab closes or on logout. A lightweight pub/sub lets the auth context react
// to changes (e.g. a password change that re-issues the token).

const TOKEN_KEY = "aflachat_token";

const listeners = new Set<() => void>();

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.sessionStorage.setItem(TOKEN_KEY, token);
  listeners.forEach((fn) => fn());
}

export function clearToken(): void {
  window.sessionStorage.removeItem(TOKEN_KEY);
  listeners.forEach((fn) => fn());
}

export function onSessionChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
