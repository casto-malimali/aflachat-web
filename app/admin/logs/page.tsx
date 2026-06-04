"use client";

import { useState } from "react";
import { RefreshCw, X } from "lucide-react";
import {
  api,
  type SessionDetail,
  type SessionRow,
} from "@/lib/adminApi";
import { useAdminData } from "@/components/admin/useAdmin";
import {
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
  { key: "feedback", label: "Community feedback" },
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
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">Logs</h1>
        <p className="text-sm text-gray-500">Raw activity from the website and mobile app.</p>
      </header>

      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sessions" && <SessionsTab onOpen={setOpenId} />}
      {tab === "feedback" && <FeedbackTab />}
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
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Refresh
    </button>
  );
}

// ── Sessions ──────────────────────────────────────────────────────────────────
function SessionsTab({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, loading, error, refetch } = useAdminData(() => api.sessions(200), [], onAuthError);

  return (
    <Panel title="Recent sessions" action={<RefreshButton onClick={refetch} />} className="overflow-hidden">
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <Empty />
      ) : (
        <div className="-mx-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-2 font-medium">Started</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Lang</th>
                <th className="px-4 py-2 font-medium text-right">Msgs</th>
                <th className="px-4 py-2 font-medium text-right">Duration</th>
                <th className="px-4 py-2 font-medium">Device</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s: SessionRow) => (
                <tr
                  key={s.id}
                  onClick={() => onOpen(s.id)}
                  className="cursor-pointer border-b border-gray-50 hover:bg-emerald-50/40"
                >
                  <td className="px-4 py-2.5 text-gray-700" title={fmtDateTime(s.startedAt)}>
                    {fmtRelative(s.startedAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Tag value={s.source === "web" ? "web" : s.source} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Tag value={s.language} />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">
                    {s.messages}
                    <span className="text-gray-400"> / {s.userMessages}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-500">
                    {fmtDuration(s.durationMs)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400">
                    {s.deviceHash ? s.deviceHash.slice(0, 10) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Session transcript</h2>
            <p className="font-mono text-xs text-gray-400">{id.slice(0, 18)}…</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
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
                  <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-gray-500">
                    v{data.session.appVersion}
                  </span>
                )}
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-gray-500">
                  {fmtDateTime(data.session.startedAt)}
                </span>
              </div>

              {!data.messages.length ? (
                <Empty label="No messages in this session." />
              ) : (
                <ul className="space-y-3">
                  {data.messages.map((m) => (
                    <li
                      key={m.id}
                      className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          m.role === "user"
                            ? "rounded-br-sm bg-emerald-600 text-white"
                            : "rounded-bl-sm bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            m.role === "user" ? "text-emerald-100" : "text-gray-400"
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

// ── Community feedback ────────────────────────────────────────────────────────
function FeedbackTab() {
  const { data, loading, error, refetch } = useAdminData(() => api.feedback(200), [], onAuthError);
  return (
    <Panel title="Community feedback" action={<RefreshButton onClick={refetch} />}>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <Empty />
      ) : (
        <ul className="space-y-3">
          {data.map((f, i) => (
            <li key={i} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
              <p className="text-sm text-gray-800">{f.message}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <Tag value={f.language} />
                <span>·</span>
                <span title={fmtDateTime(f.createdAt)}>{fmtRelative(f.createdAt)}</span>
                {f.deviceHash && (
                  <span className="ml-auto font-mono">{f.deviceHash.slice(0, 10)}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// ── Offline events ────────────────────────────────────────────────────────────
function EventsTab() {
  const { data, loading, error, refetch } = useAdminData(() => api.events(200), [], onAuthError);
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
