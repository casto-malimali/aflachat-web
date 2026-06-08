// Shared fetch wrapper for the admin API. Attaches the bearer token, unwraps the
// backend's `{ error: { code, message } }` envelope, and surfaces auth failures
// as a typed error so the shell can drop back to the login screen.

import { clearToken, getToken } from "./session";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

/** Thrown when the session is missing or rejected — the shell signs the user out. */
export class AuthError extends Error {}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Skip attaching the bearer token (used by the login request). */
  anonymous?: boolean;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = opts.anonymous ? null : getToken();
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 401 && token) {
    // A previously valid session was rejected — clear it and bounce to login.
    clearToken();
    throw new AuthError("Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
