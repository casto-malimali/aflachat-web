"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  Users,
  UserCircle,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  ChevronDown,
  Mail,
  Lock,
  ArrowRight,
  Leaf,
  MessagesSquare,
  MailPlus,
} from "lucide-react";
import { api, type Overview } from "@/lib/adminApi";
import { useAuth } from "@/components/admin/AuthContext";
import { useLiveStatus } from "@/components/admin/LiveContext";
import type { AdminUser } from "@/lib/authApi";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  adminOnly?: boolean;
};

const MAIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, description: "Analytics & KPIs" },
  { href: "/admin/logs", label: "Logs", icon: ScrollText, description: "Sessions & activity" },
  { href: "/admin/feedback", label: "Feedback", icon: MessagesSquare, description: "Community feedback" },
  { href: "/admin/contact", label: "Contact", icon: MailPlus, description: "Form submissions" },
  { href: "/admin/users", label: "Users", icon: Users, description: "Manage accounts", adminOnly: true },
];

const ACCOUNT_NAV: NavItem[] = [
  { href: "/admin/profile", label: "Profile", icon: UserCircle, description: "Your account" },
  { href: "/admin/settings", label: "Settings", icon: Settings, description: "Preferences" },
];

const ALL_NAV = [...MAIN_NAV, ...ACCOUNT_NAV];

function pageTitle(pathname: string): string {
  // Longest-prefix match so nested routes (e.g. /admin/logs/123) still resolve.
  const match = ALL_NAV.filter((n) => pathname === n.href || pathname.startsWith(`${n.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  return match?.label ?? "Admin";
}

function visibleMainNav(role: AdminUser["role"] | undefined): NavItem[] {
  return MAIN_NAV.filter((n) => !n.adminOnly || role === "admin");
}

/** Close a popover when clicking outside the referenced element or pressing Escape. */
function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return ref;
}

/**
 * Wraps the admin dashboard: shows the split-screen sign-in screen until a valid
 * session exists, then renders the responsive shell (sidebar on desktop, drawer
 * + top bar + bottom tab bar on mobile) around the page.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes. Syncing UI state to the
  // router's pathname is a legitimate external-system sync, not a render cascade.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
      </div>
    );
  }
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DesktopSidebar user={user} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />

      <div className="md:pl-64">
        <Topbar user={user} onMenu={() => setDrawerOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-5 sm:px-6 md:pb-10 lg:px-8">
          {children}
        </main>
      </div>

      <BottomNav user={user} />
    </div>
  );
}

// ── Branding ────────────────────────────────────────────────────────────────────
function Brand({ subtitle = "Admin" }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
        <Leaf className="h-5 w-5 text-emerald-300" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold text-white">AflaChat</p>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300/70">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function NavSection({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="space-y-1">
      {items.map(({ href, label, icon: Icon, description }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active
              ? "bg-emerald-500/15 text-white shadow-sm"
              : "text-emerald-50/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            {active && (
              <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-emerald-400" aria-hidden />
            )}
            <Icon
              className={`h-5 w-5 shrink-0 ${active ? "text-emerald-300" : "text-emerald-200/60 group-hover:text-emerald-200"}`}
            />
            <span className="flex flex-col">
              {label}
              <span className="text-[11px] font-normal text-emerald-100/40">{description}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function NavLinks({ user, onNavigate }: { user: AdminUser; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      <NavSection items={visibleMainNav(user.role)} onNavigate={onNavigate} />
      <div>
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200/40">
          Account
        </p>
        <NavSection items={ACCOUNT_NAV} onNavigate={onNavigate} />
      </div>
    </nav>
  );
}

function SidebarFooter({ onLogout, onNavigate }: { onLogout: () => void; onNavigate?: () => void }) {
  return (
    <div className="space-y-1 border-t border-white/10 px-3 py-3">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-50/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ExternalLink className="h-[18px] w-[18px]" />
        View site
      </Link>
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-50/70 transition-colors hover:bg-red-500/10 hover:text-red-200"
      >
        <LogOut className="h-[18px] w-[18px]" />
        Sign out
      </button>
    </div>
  );
}

const SIDEBAR_BG = "bg-gradient-to-b from-[#0c3a2a] via-[#0a3225] to-[#062c20]";

function useLogout() {
  const { logout } = useAuth();
  return () => {
    void logout();
  };
}

function DesktopSidebar({ user }: { user: AdminUser }) {
  const logout = useLogout();
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden border-r border-white/5 ${SIDEBAR_BG} md:flex`}
    >
      <span
        className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"
        aria-hidden
      />
      <div className="relative px-5 py-5">
        <Brand />
      </div>
      <NavLinks user={user} />
      <SidebarFooter onLogout={logout} />
    </aside>
  );
}

function MobileDrawer({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: AdminUser;
}) {
  const logout = useLogout();
  return (
    <div className={`md:hidden ${open ? "" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
          }`}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col ${SIDEBAR_BG} shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Brand />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-100/70 hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavLinks user={user} onNavigate={onClose} />
        <SidebarFooter onLogout={logout} onNavigate={onClose} />
      </aside>
    </div>
  );
}

// ── Top navigation bar ──────────────────────────────────────────────────────────
function Topbar({ user, onMenu }: { user: AdminUser; onMenu: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
          {pageTitle(pathname)}
        </h1>
        <p className="hidden text-xs text-slate-400 sm:block">AflaChat administration</p>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <LiveIndicator />
        <Notifications />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}

/** Small status pill for the GET /api/analytics/stream connection (see LiveContext). */
function LiveIndicator() {
  const status = useLiveStatus();
  const dot = status === "open" ? "bg-emerald-500" : status === "connecting" ? "bg-amber-400" : "bg-slate-300";
  const label = status === "open" ? "Live" : status === "connecting" ? "Connecting…" : "Offline";
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 sm:flex"
      title={status === "open" ? "Live updates connected" : status === "connecting" ? "Connecting to live updates…" : "Live updates unavailable — falling back to manual refresh"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${status === "open" ? "animate-pulse" : ""}`} aria-hidden />
      {label}
    </span>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Overview | null>(null);
  const ref = useDismiss(open, () => setOpen(false));

  useEffect(() => {
    let active = true;
    api
      .overview()
      .then((o) => active && setData(o))
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  const items = data
    ? [
      { label: "Unanswered queries", value: data.unanswered, href: "/admin/logs", tone: "amber" as const },
      { label: "Community feedback", value: data.communityFeedback, href: "/admin/logs", tone: "emerald" as const },
      { label: "Offline attempts", value: data.offlineAttempts, href: "/admin/logs", tone: "slate" as const },
    ]
    : [];
  const count = data?.unanswered ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 origin-top-right animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
          </div>
          <ul className="divide-y divide-slate-50">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-400">Nothing new.</li>
            ) : (
              items.map((it) => (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${it.tone === "amber"
                        ? "bg-amber-50 text-amber-700"
                        : it.tone === "emerald"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {it.value}
                    </span>
                    <span className="text-sm text-slate-700">{it.label}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${role === "admin"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : "bg-slate-100 text-slate-600 ring-slate-200"
        }`}
    >
      {role}
    </span>
  );
}

function ProfileMenu({ user }: { user: AdminUser }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const logout = useLogout();

  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-slate-100"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white shadow-sm">
          {initials}
        </span>
        <span className="hidden max-w-[10rem] text-left sm:block">
          <span className="block truncate text-sm font-semibold leading-tight text-slate-800">
            {user.name}
          </span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 origin-top-right animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
              <span className="mt-1 inline-block">
                <RoleBadge role={user.role} />
              </span>
            </div>
          </div>
          <div className="p-1.5">
            <Link
              href="/admin/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <UserCircle className="h-4 w-4 text-slate-400" />
              Your profile
            </Link>
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </Link>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              View site
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────────────
function BottomNav({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  // Cap at 4 primary tabs + Profile so the bar stays comfortable on small phones;
  // anything beyond that (e.g. Users) is still reachable via the drawer menu.
  const items = [...visibleMainNav(user.role).slice(0, 4), ACCOUNT_NAV[0]];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${active ? "text-emerald-700" : "text-slate-400"
              }`}
          >
            <span
              className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-emerald-50" : ""
                }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// ── Split-screen sign-in ──────────────────────────────────────────────────────────
function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError((err as Error).message || "Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — branding + form */}
      <div className="relative flex flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          <Link href="/" className="mb-10 inline-flex">
            <Image
              src="/images/aflachat-logo-trimmed.png"
              alt="AflaChat"
              width={138}
              height={50}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to view AflaChat analytics, sessions and manage your team.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@aflachat.app"
                  autoFocus
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !email.trim() || !password}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Your session is kept only for this browser tab.
          </p>
        </div>
      </div>

      {/* Right — hero image */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/2148761810.jpg"
          alt="Maize field representing agricultural food safety"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#062c20]/90 via-[#0a3225]/60 to-emerald-900/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="max-w-md animate-fade-up">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-sm">
              <Leaf className="h-3.5 w-3.5" />
              AflaChat Platform
            </span>
            <h2 className="font-heading text-3xl font-bold leading-tight text-white xl:text-4xl">
              Protecting crops and communities from aflatoxin.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-emerald-50/80">
              Monitor conversations, track engagement, and understand how farmers
              across Tanzania are staying safe — all from one dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
