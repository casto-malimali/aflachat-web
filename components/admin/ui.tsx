"use client";

import { type ReactNode } from "react";

// ── Formatting helpers ────────────────────────────────────────────────────────
export function fmtNum(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function fmtDuration(ms: number | null): string {
  if (ms == null) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Layout primitives ─────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  accent = "#10b981",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          {title && <h2 className="text-sm font-semibold text-gray-800">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

const SOURCE_STYLES: Record<string, string> = {
  web: "bg-sky-50 text-sky-700 ring-sky-200",
  android: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ios: "bg-violet-50 text-violet-700 ring-violet-200",
  other: "bg-gray-100 text-gray-600 ring-gray-200",
  en: "bg-amber-50 text-amber-700 ring-amber-200",
  sw: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function Tag({ value }: { value: string }) {
  const cls = SOURCE_STYLES[value] ?? "bg-gray-100 text-gray-600 ring-gray-200";
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {value}
    </span>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-500" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Retry
        </button>
      )}
    </div>
  );
}
