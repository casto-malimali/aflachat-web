"use client";

import { useState } from "react";
import { Mail, Calendar, Clock, Save, ShieldCheck } from "lucide-react";
import { updateProfile, changePassword } from "@/lib/authApi";
import { useAuth } from "@/components/admin/AuthContext";
import {
  Avatar,
  Badge,
  Button,
  Field,
  Input,
  Panel,
  fmtDateTime,
  fmtRelative,
  useToast,
} from "@/components/admin/ui";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { notify } = useToast();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Your profile</h2>
        <p className="text-sm text-slate-500">Manage your account details and password.</p>
      </header>

      {/* Identity card */}
      <Panel className="overflow-hidden">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar name={user.name} size={72} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
              <Badge tone={user.role === "admin" ? "emerald" : "slate"}>
                <ShieldCheck className="h-3 w-3" />
                {user.role}
              </Badge>
            </div>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:justify-start">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-400 sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined {fmtDateTime(user.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Last seen {user.lastLoginAt ? fmtRelative(user.lastLoginAt) : "now"}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm
          initialName={user.name}
          email={user.email}
          onSaved={(u) => {
            setUser(u);
            notify("Profile updated");
          }}
        />
        <PasswordForm onSaved={() => notify("Password changed")} />
      </div>
    </div>
  );
}

function ProfileForm({
  initialName,
  email,
  onSaved,
}: {
  initialName: string;
  email: string;
  onSaved: (u: Awaited<ReturnType<typeof updateProfile>>) => void;
}) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await updateProfile(name.trim());
      onSaved(u);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Account details">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Display name" htmlFor="p-name">
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Email" htmlFor="p-email" hint="Contact an administrator to change your email.">
          <Input id="p-email" value={email} disabled />
        </Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" icon={Save} loading={busy} disabled={!name.trim() || name === initialName}>
            Save changes
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function PasswordForm({ onSaved }: { onSaved: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Change password">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Current password" htmlFor="c-pass">
          <Input
            id="c-pass"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <Field label="New password" htmlFor="n-pass" hint="At least 8 characters.">
          <Input
            id="n-pass"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <Field label="Confirm new password" htmlFor="cf-pass">
          <Input
            id="cf-pass"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end">
          <Button
            type="submit"
            icon={ShieldCheck}
            loading={busy}
            disabled={!current || !next || !confirm}
          >
            Update password
          </Button>
        </div>
      </form>
    </Panel>
  );
}
