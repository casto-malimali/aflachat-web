"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserPlus,
  Pencil,
  KeyRound,
  Trash2,
  Users as UsersIcon,
  ShieldCheck,
  CircleCheck,
} from "lucide-react";
import { usersApi, type AdminUser, type UserRole, type UserStatus } from "@/lib/usersApi";
import { AdminAuthError } from "@/lib/adminApi";
import { useAuth } from "@/components/admin/AuthContext";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  Panel,
  Select,
  Spinner,
  StatCard,
  fmtRelative,
  useToast,
} from "@/components/admin/ui";

export default function UsersPage() {
  const { user: me } = useAuth();
  const { notify } = useToast();

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    usersApi
      .list()
      .then((u) => setUsers(u))
      .catch((e) => {
        if (e instanceof AdminAuthError) window.location.reload();
        else setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Initial fetch; load() sets loading state synchronously by design.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (me?.role !== "admin") {
    return (
      <EmptyState
        icon={ShieldCheck}
        label="Administrators only"
        hint="You need an administrator account to manage users."
      />
    );
  }

  const total = users?.length ?? 0;
  const admins = users?.filter((u) => u.role === "admin").length ?? 0;
  const active = users?.filter((u) => u.status === "active").length ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Team & users</h2>
          <p className="text-sm text-slate-500">Manage who can access the AflaChat dashboard.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setCreating(true)}>
          Add user
        </Button>
      </header>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Total users" value={total} icon={UsersIcon} />
        <StatCard label="Administrators" value={admins} accent="#0ea5e9" icon={ShieldCheck} />
        <StatCard label="Active" value={active} accent="#0d9488" icon={CircleCheck} />
      </div>

      <Panel className="overflow-hidden" title="All accounts">
        {loading ? (
          <Spinner label="Loading users…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !users || users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            label="No users yet"
            hint="Add your first teammate to give them dashboard access."
            action={
              <Button icon={UserPlus} onClick={() => setCreating(true)}>
                Add user
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="-mx-4 hidden overflow-x-auto sm:-mx-5 md:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-2.5 font-medium">User</th>
                    <th className="px-5 py-2.5 font-medium">Role</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 font-medium">Last active</th>
                    <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size={38} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {u.name}
                              {u.id === me?.id && (
                                <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={u.role === "admin" ? "forest" : "slate"}>{u.role}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={u.status === "active" ? "sky" : "amber"}>{u.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {u.lastLoginAt ? fmtRelative(u.lastLoginAt) : "Never"}
                      </td>
                      <td className="px-5 py-3">
                        <RowActions
                          isSelf={u.id === me?.id}
                          onEdit={() => setEditing(u)}
                          onReset={() => setResetting(u)}
                          onDelete={() => setDeleting(u)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {users.map((u) => (
                <li key={u.id} className="rounded-xl border border-slate-100 p-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {u.name}
                        {u.id === me?.id && (
                          <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge tone={u.role === "admin" ? "forest" : "slate"}>{u.role}</Badge>
                    <Badge tone={u.status === "active" ? "sky" : "amber"}>{u.status}</Badge>
                    <span className="ml-auto text-xs text-slate-400">
                      {u.lastLoginAt ? fmtRelative(u.lastLoginAt) : "Never"}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end gap-1 border-t border-slate-50 pt-2">
                    <RowActions
                      isSelf={u.id === me?.id}
                      onEdit={() => setEditing(u)}
                      onReset={() => setResetting(u)}
                      onDelete={() => setDeleting(u)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      {creating && (
        <UserFormModal
          onClose={() => setCreating(false)}
          onSaved={(msg) => {
            setCreating(false);
            notify(msg);
            load();
          }}
        />
      )}
      {editing && (
        <UserFormModal
          existing={editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            notify(msg);
            load();
          }}
        />
      )}
      {resetting && (
        <ResetPasswordModal
          user={resetting}
          onClose={() => setResetting(null)}
          onSaved={() => {
            setResetting(null);
            notify("Password reset");
          }}
        />
      )}
      {deleting && (
        <DeleteUserModal
          user={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            notify("User removed");
            load();
          }}
        />
      )}
    </div>
  );
}

function RowActions({
  isSelf,
  onEdit,
  onReset,
  onDelete,
}: {
  isSelf: boolean;
  onEdit: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const btn = "rounded-lg p-2 text-slate-400 transition-colors";
  return (
    <div className="flex justify-end gap-0.5">
      <button onClick={onEdit} className={`${btn} hover:bg-slate-100 hover:text-slate-700`} aria-label="Edit user">
        <Pencil className="h-4 w-4" />
      </button>
      <button onClick={onReset} className={`${btn} hover:bg-slate-100 hover:text-slate-700`} aria-label="Reset password">
        <KeyRound className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        disabled={isSelf}
        className={`${btn} hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30`}
        aria-label="Delete user"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function UserFormModal({
  existing,
  onClose,
  onSaved,
}: {
  existing?: AdminUser;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const isEdit = Boolean(existing);
  const [name, setName] = useState(existing?.name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(existing?.role ?? "viewer");
  const [status, setStatus] = useState<UserStatus>(existing?.status ?? "active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (existing) {
        await usersApi.update(existing.id, { name, role, status });
        onSaved("User updated");
      } else {
        await usersApi.create({ name, email, password, role });
        onSaved("User created");
      }
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit user" : "Add user"}
      description={isEdit ? existing!.email : "They'll sign in with this email and password."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={busy}>
            {isEdit ? "Save changes" : "Create user"}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="space-y-4">
        <Field label="Full name" htmlFor="u-name">
          <Input
            id="u-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Mwangi"
            required
            autoFocus
          />
        </Field>

        {!isEdit && (
          <>
            <Field label="Email" htmlFor="u-email">
              <Input
                id="u-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@aflachat.app"
                required
              />
            </Field>
            <Field label="Temporary password" htmlFor="u-pass" hint="At least 8 characters.">
              <Input
                id="u-pass"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set an initial password"
                minLength={8}
                required
              />
            </Field>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Role" htmlFor="u-role">
            <Select id="u-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="viewer">Viewer</option>
              <option value="admin">Administrator</option>
            </Select>
          </Field>
          {isEdit && (
            <Field label="Status" htmlFor="u-status">
              <Select
                id="u-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </Select>
            </Field>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
      </form>
    </Modal>
  );
}

function ResetPasswordModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await usersApi.resetPassword(user.id, password);
      onSaved();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Reset password"
      description={`Set a new password for ${user.name}.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="reset-form" loading={busy}>
            Reset password
          </Button>
        </>
      }
    >
      <form id="reset-form" onSubmit={submit} className="space-y-4">
        <Field label="New password" htmlFor="r-pass" hint="At least 8 characters. The user is signed out of other sessions.">
          <Input
            id="r-pass"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoFocus
          />
        </Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </form>
    </Modal>
  );
}

function DeleteUserModal({
  user,
  onClose,
  onDeleted,
}: {
  user: AdminUser;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await usersApi.remove(user.id);
      onDeleted();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Remove user"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} loading={busy} icon={Trash2}>
            Remove
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        Remove <span className="font-semibold text-slate-900">{user.name}</span> ({user.email})? They
        will lose access immediately. This cannot be undone.
      </p>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </Modal>
  );
}
