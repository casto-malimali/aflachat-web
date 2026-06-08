"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { login as apiLogin, logout as apiLogout, me, type AdminUser } from "@/lib/authApi";
import { getToken } from "@/lib/session";

interface AuthValue {
  user: AdminUser | null;
  /** null = still resolving the stored token on first load. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetch the current account (after a profile edit). */
  refresh: () => Promise<void>;
  /** Optimistically patch the cached user (e.g. after a name change). */
  setUser: (user: AdminUser) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve the persisted token once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      if (!getToken()) {
        if (active) setLoading(false);
        return;
      }
      try {
        const u = await me();
        if (active) setUser(u);
      } catch {
        // Invalid/expired token — http.ts already cleared it.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setUser(await me());
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
