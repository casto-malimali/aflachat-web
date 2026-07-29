"use client";

import { useEffect, useState } from "react";
import { Sliders, Bell, ShieldCheck, Info, LogOut, KeyRound } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/admin/AuthContext";
import { BASE_URL } from "@/lib/http";
import { Badge, Button, Field, Panel, Select, useToast } from "@/components/admin/ui";

const PREFS_KEY = "aflachat_admin_prefs";

interface Prefs {
  defaultRange: "7" | "30" | "90";
  density: "comfortable" | "compact";
  desktopNotifications: boolean;
}

const DEFAULT_PREFS: Prefs = {
  defaultRange: "30",
  density: "comfortable",
  desktopNotifications: true,
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(loadPrefs());
  }, []);

  const update = (patch: Partial<Prefs>) => {
    const merged = { ...prefs, ...patch };
    setPrefs(merged);
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    notify("Preferences saved");
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Settings</h2>
        <p className="text-sm text-slate-500">Personalize your dashboard and manage security.</p>
      </header>

      <Panel
        title="Preferences"
        action={<Sliders className="h-4 w-4 text-slate-400" />}
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default analytics range" htmlFor="s-range">
              <Select
                id="s-range"
                value={prefs.defaultRange}
                onChange={(e) => update({ defaultRange: e.target.value as Prefs["defaultRange"] })}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </Select>
            </Field>
            <Field label="Table density" htmlFor="s-density">
              <Select
                id="s-density"
                value={prefs.density}
                onChange={(e) => update({ density: e.target.value as Prefs["density"] })}
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </Select>
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Notifications" action={<Bell className="h-4 w-4 text-slate-400" />}>
        <Toggle
          label="Show unanswered-query alerts"
          description="Surface a badge in the top bar when farmers ask questions the bot can't answer."
          checked={prefs.desktopNotifications}
          onChange={(v) => update({ desktopNotifications: v })}
        />
      </Panel>

      <Panel title="Security" action={<ShieldCheck className="h-4 w-4 text-slate-400" />}>
        <div className="space-y-3">
          <Row
            title="Password"
            description="Change the password used to sign in to the dashboard."
          >
            <Link href="/admin/profile">
              <Button variant="secondary" icon={KeyRound}>
                Change password
              </Button>
            </Link>
          </Row>
          <Row
            title="Sign out"
            description="End this session on this device."
          >
            <Button variant="secondary" icon={LogOut} onClick={() => void logout()}>
              Sign out
            </Button>
          </Row>
        </div>
      </Panel>

      <Panel title="About" action={<Info className="h-4 w-4 text-slate-400" />}>
        <dl className="divide-y divide-slate-50 text-sm">
          <InfoRow label="Signed in as">
            <span className="flex items-center gap-2">
              {user?.email}
              {user && <Badge tone={user.role === "admin" ? "forest" : "slate"}>{user.role}</Badge>}
            </span>
          </InfoRow>
          <InfoRow label="API endpoint">
            <span className="break-all font-mono text-xs text-slate-500">{BASE_URL}</span>
          </InfoRow>
          <InfoRow label="Application">AflaChat Admin Console</InfoRow>
        </dl>
      </Panel>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-forest-moss-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{children}</dd>
    </div>
  );
}
