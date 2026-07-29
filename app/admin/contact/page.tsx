"use client";

import { useMemo, useState } from "react";
import { Archive, Mail, MailOpen, RefreshCw, Search } from "lucide-react";
import { api, type ContactSubmission } from "@/lib/adminApi";
import { useAdminData } from "@/components/admin/useAdmin";
import { useLiveEvent } from "@/components/admin/LiveContext";
import {
  Badge,
  EmptyState,
  ErrorState,
  Panel,
  Spinner,
  fmtDateTime,
  fmtRelative,
  useToast,
} from "@/components/admin/ui";

const onAuthError = () => {
  if (typeof window !== "undefined") window.location.reload();
};

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["key"];

export default function ContactPage() {
  const { data, loading, error, refetch } = useAdminData(() => api.contactSubmissions(), [], onAuthError);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const { notify } = useToast();

  useLiveEvent("contact.created", (payload) => {
    refetch();
    notify(`New message from ${(payload.name as string) ?? "the website"}`);
  });
  // Don't toast on .updated — it also fires for this admin's own Mark read/Archive clicks.
  useLiveEvent("contact.updated", refetch);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.message.toLowerCase().includes(q);
    });
  }, [data, query, status]);

  const newCount = (data ?? []).filter((r) => r.status === "new").length;

  async function setSubmissionStatus(s: ContactSubmission, next: ContactSubmission["status"]) {
    try {
      await api.updateContactStatus(s.id, next);
      notify(next === "read" ? "Marked as read" : next === "archived" ? "Archived" : "Marked as new");
      refetch();
    } catch (err) {
      notify((err as Error).message || "Failed to update status", "error");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Contact form submissions</h2>
          <p className="text-sm text-slate-500">
            Messages sent through the public Contact page.
            {newCount > 0 && <span className="ml-1.5 font-medium text-forest-moss-600">{newCount} new</span>}
          </p>
        </div>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <Panel
        title="All submissions"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, message…"
                className="w-40 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-forest-moss-500 focus:bg-white focus:ring-4 focus:ring-forest-moss-500/10 sm:w-56"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatus(f.key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    status === f.key ? "bg-white text-forest-moss-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !filtered.length ? (
          <EmptyState
            icon={Mail}
            label={data?.length ? "No submissions match your filters" : "No submissions yet"}
            hint={data?.length ? "Try clearing the search or status filter." : "New contact form messages will appear here."}
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((s) => (
              <SubmissionRow key={s.id} submission={s} onStatusChange={setSubmissionStatus} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

const STATUS_TONE: Record<ContactSubmission["status"], "forest" | "sky" | "slate"> = {
  new: "forest",
  read: "sky",
  archived: "slate",
};

function SubmissionRow({
  submission,
  onStatusChange,
}: {
  submission: ContactSubmission;
  onStatusChange: (s: ContactSubmission, next: ContactSubmission["status"]) => void;
}) {
  const tone = STATUS_TONE[submission.status];
  return (
    <li className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{submission.name}</p>
          <a href={`mailto:${submission.email}`} className="truncate text-xs text-forest-moss-600 hover:underline">
            {submission.email}
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={tone}>{submission.status}</Badge>
          <span className="text-xs text-slate-400" title={fmtDateTime(submission.createdAt)}>
            {fmtRelative(submission.createdAt)}
          </span>
        </div>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-700">{submission.message}</p>
      <div className="mt-3 flex gap-2">
        {submission.status !== "read" && (
          <button
            onClick={() => onStatusChange(submission, "read")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <MailOpen className="h-3.5 w-3.5" />
            Mark read
          </button>
        )}
        {submission.status !== "archived" && (
          <button
            onClick={() => onStatusChange(submission, "archived")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </button>
        )}
      </div>
    </li>
  );
}
