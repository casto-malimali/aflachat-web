// Admin-only client for managing dashboard accounts (/api/users/*).

import { apiRequest } from "./http";
import type { AdminUser, UserRole, UserStatus } from "./authApi";

export type { AdminUser, UserRole, UserStatus };

export const usersApi = {
  list: () => apiRequest<{ users: AdminUser[] }>("/api/users").then((r) => r.users),

  create: (input: { name: string; email: string; password: string; role: UserRole }) =>
    apiRequest<{ user: AdminUser }>("/api/users", { body: input }).then((r) => r.user),

  update: (
    id: string,
    patch: { name?: string; role?: UserRole; status?: UserStatus },
  ) =>
    apiRequest<{ user: AdminUser }>(`/api/users/${id}`, {
      method: "PATCH",
      body: patch,
    }).then((r) => r.user),

  resetPassword: (id: string, newPassword: string) =>
    apiRequest<{ ok: true }>(`/api/users/${id}/password`, { body: { newPassword } }),

  remove: (id: string) => apiRequest<{ ok: true }>(`/api/users/${id}`, { method: "DELETE" }),
};
