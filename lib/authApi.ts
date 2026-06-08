// Authentication client for the admin dashboard: login, logout, current account,
// profile edit, and password change. The bearer token is persisted via
// lib/session.ts and attached automatically by lib/http.ts.

import { apiRequest } from "./http";
import { clearToken, setToken } from "./session";

export type UserRole = "admin" | "viewer";
export type UserStatus = "active" | "disabled";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

/** Sign in with email + password; stores the token and returns the account. */
export async function login(email: string, password: string): Promise<AdminUser> {
  const res = await apiRequest<{ token: string; user: AdminUser }>("/api/auth/login", {
    body: { email, password },
    anonymous: true,
  });
  setToken(res.token);
  return res.user;
}

/** Revoke the current token server-side, then clear it locally. */
export async function logout(): Promise<void> {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch {
    // Even if the network call fails, drop the local token.
  } finally {
    clearToken();
  }
}

export async function me(): Promise<AdminUser> {
  const res = await apiRequest<{ user: AdminUser }>("/api/auth/me");
  return res.user;
}

export async function updateProfile(name: string): Promise<AdminUser> {
  const res = await apiRequest<{ user: AdminUser }>("/api/auth/me", {
    method: "PATCH",
    body: { name },
  });
  return res.user;
}

/** Change own password; the backend re-issues a token, which we store. */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await apiRequest<{ token?: string }>("/api/auth/me/password", {
    body: { currentPassword, newPassword },
  });
  if (res.token) setToken(res.token);
}
