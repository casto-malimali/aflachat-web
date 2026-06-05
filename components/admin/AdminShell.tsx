"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { clearAdminKey, getAdminKey, loginWithCredentials } from "@/lib/adminApi";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

/**
 * Wraps the admin dashboard: shows the email/password sign-in gate until a
 * valid admin session token is present, then renders the sidebar shell.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking

  // Read the token from sessionStorage on mount. This is a genuine external-system
  // sync (sessionStorage is unavailable during SSR), so the initial setState here
  // is intentional rather than a cascading-render smell.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthed(Boolean(getAdminKey()));
  }, []);

  if (authed === null) return <div className="min-h-screen bg-gray-50" />;
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar onLogout={() => setAuthed(false)} />
      <div className="md:pl-60">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-gray-800 bg-[#0a2e22] text-gray-200 md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="text-sm font-semibold text-white">AflaChat</p>
          <p className="text-[11px] uppercase tracking-wider text-emerald-300/70">Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-emerald-500/15 text-white"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>
        <button
          onClick={() => {
            clearAdminKey();
            onLogout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await loginWithCredentials(email.trim(), password);
    setBusy(false);
    if (result.ok) {
      onSuccess();
    } else if (result.reason === "invalid") {
      setError("Incorrect email or password.");
    } else {
      setError("Could not reach the backend. Check your connection and try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a2e22] px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h1 className="text-lg font-bold text-gray-900">Admin sign in</h1>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Sign in with your admin email and password to view AflaChat analytics and logs.
        </p>

        <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@aflachat.co.tz"
          autoComplete="username"
          autoFocus
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <label className="mb-1 block text-xs font-medium text-gray-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || !email.trim() || !password}
          className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-center text-xs text-gray-400">
          Your session is kept only for this browser tab.
        </p>
      </form>
    </div>
  );
}
