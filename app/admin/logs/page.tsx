"use client";

import { useState } from "react";
import { RefreshCw, X, Smartphone, Globe } from "lucide-react";
import {
  api,
  type SessionDetail,
  type SessionRow,
} from "@/lib/adminApi";
import { useAdminData } from "@/components/admin/useAdmin";
import { useLiveEvent } from "@/components/admin/LiveContext";
import {
  EmptyState,
  ErrorState,
  Panel,
  Spinner,
  Tag,
  fmtDateTime,
  fmtDuration,
  fmtRelative,
} from "@/components/admin/ui";

const TABS = [
  { key: "sessions", label: "Sessions" },
  { key: "events", label: "Offline events" },
  { key: "unanswered", label: "Unanswered" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const onAuthError = () => {
  if (typeof window !== "undefined") window.location.reload();
};

export default function LogsPage() {
  const [tab, setTab] = useState<TabKey>("sessions");
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Activity logs</h2>
        <p className="text-sm text-slate-500">Raw activity from the website and mobile app.</p>
      </header>

      {/* Segmented tab control — horizontally scrollable on mobile */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="inline-flex min-w-full gap-1 rounded-xl bg-slate-100 p-1 sm:min-w-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-white text-forest-moss-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "sessions" && <SessionsTab onOpen={setOpenId} />}
      {tab === "events" && <EventsTab />}
      {tab === "unanswered" && <UnansweredTab />}

      {openId && <TranscriptDrawer id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Refresh
    </button>
  );
}

// ── Sessions ──────────────────────────────────────────────────────────────────
function SessionsTab({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, loading, error, refetch } = useAdminData(() => api.sessions(200), [], onAuthError);
  useLiveEvent(["session.created", "session.ended", "message.created"], refetch);

  return (
    <Panel title="Recent sessions" action={<RefreshButton onClick={refetch} />} className="overflow-hidden">
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState label="No sessions yet" hint="Sessions will appear here as people use the app and website." />
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <div className="-mx-4 hidden overflow-x-auto sm:-mx-5 sm:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5 font-medium">Started</th>
                  <th className="px-5 py-2.5 font-medium">Source</th>
                  <th className="px-5 py-2.5 font-medium">Lang</th>
                  <th className="px-5 py-2.5 font-medium text-right">Msgs</th>
                  <th className="px-5 py-2.5 font-medium text-right">Duration</th>
                  <th className="px-5 py-2.5 font-medium">Device</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s: SessionRow) => (
                  <tr
                    key={s.id}
                    onClick={() => onOpen(s.id)}
                    className="cursor-pointer border-b border-slate-50 transition-colors last:border-0 hover:bg-forest-moss-50/50"
                  >
                    <td className="px-5 py-3 text-slate-700" title={fmtDateTime(s.startedAt)}>
                      {fmtRelative(s.startedAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Tag value={s.source === "web" ? "web" : s.source} />
                    </td>
                    <td className="px-5 py-3">
                      <Tag value={s.language} />
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {s.messages}
                      <span className="text-slate-400"> / {s.userMessages}</span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                      {fmtDuration(s.durationMs)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">
                      {s.deviceHash ? s.deviceHash.slice(0, 10) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: tappable cards */}
          <ul className="space-y-2.5 sm:hidden">
            {data.map((s: SessionRow) => (
              <li key={s.id}>
                <button
                  onClick={() => onOpen(s.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors active:bg-forest-moss-50/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-moss-50 text-forest-moss-600">
                    {s.source === "web" ? <Globe className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Tag value={s.source === "web" ? "web" : s.source} />
                      <Tag value={s.language} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400" title={fmtDateTime(s.startedAt)}>
                      {fmtRelative(s.startedAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-slate-700">
                      {s.messages} <span className="font-normal text-slate-400">msgs</span>
                    </p>
                    <p className="text-xs tabular-nums text-slate-400">{fmtDuration(s.durationMs)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

function TranscriptDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading, error } = useAdminData<SessionDetail>(
    () => api.sessionDetail(id),
    [id],
    onAuthError,
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative flex h-full w-full flex-col bg-white shadow-2xl animate-[slide-in_0.3s_ease-out] sm:max-w-md">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Session transcript</h2>
            <p className="font-mono text-xs text-slate-400">{id.slice(0, 18)}…</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close transcript"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
          {loading ? (
            <Spinner />
          ) : error ? (
            <ErrorState message={error} />
          ) : data ? (
            <>
              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                <Tag value={data.session.source} />
                <Tag value={data.session.language} />
                {data.session.appVersion && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-500">
                    v{data.session.appVersion}
                  </span>
                )}
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-500">
                  {fmtDateTime(data.session.startedAt)}
                </span>
              </div>

              {!data.messages.length ? (
                <EmptyState label="No messages in this session." />
              ) : (
                <ul className="space-y-3">
                  {data.messages.map((m) => (
                    <li
                      key={m.id}
                      className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                          m.role === "user"
                            ? "rounded-br-sm bg-forest-moss-600 text-white"
                            : "rounded-bl-sm border border-slate-100 bg-white text-slate-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            m.role === "user" ? "text-forest-moss-100" : "text-slate-400"
                          }`}
                        >
                          {fmtRelative(m.createdAt)}
                          {m.role === "assistant" && m.usedContext && " · KB"}
                          {m.latencyMs ? ` · ${m.latencyMs}ms` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

// ── Offline events ────────────────────────────────────────────────────────────
function EventsTab() {
  const { data, loading, error, refetch } = useAdminData(() => api.events(200), [], onAuthError);
  useLiveEvent("offline.created", refetch);
  return (
    <Panel title="Offline attempts" action={<RefreshButton onClick={refetch} />}>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <Empty />
      ) : (
        <ul className="divide-y divide-gray-50">
          {data.map((e, i) => (
            <li key={i} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-gray-700">{e.region || "Unknown region"}</span>
              <span className="flex items-center gap-3 text-xs text-gray-400">
                {e.deviceHash && <span className="font-mono">{e.deviceHash.slice(0, 10)}</span>}
                <span title={fmtDateTime(e.createdAt)}>{fmtRelative(e.createdAt)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// ── Unanswered ────────────────────────────────────────────────────────────────
function UnansweredTab() {
  const { data, loading, error, refetch } = useAdminData(() => api.unanswered(), [], onAuthError);
  useLiveEvent("unanswered.created", refetch);
  return (
    <Panel title="Unanswered queries" action={<RefreshButton onClick={refetch} />}>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <Empty />
      ) : (
        <ul className="space-y-2">
          {data.map((u, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 text-sm">
              <Tag value={u.language} />
              <span className="flex-1 text-gray-800">{u.text}</span>
              <span className="shrink-0 text-xs text-gray-400" title={fmtDateTime(u.createdAt)}>
                {fmtRelative(u.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Empty({ label = "Nothing here yet." }: { label?: string }) {
  return <p className="py-10 text-center text-sm text-gray-400">{label}</p>;
}
