"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Mail,
  MailOpen,
  RefreshCw,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import { api, type ContactSubmission } from "@/lib/adminApi";
import { useAdminData } from "@/components/admin/useAdmin";
import { useLiveEvent } from "@/components/admin/LiveContext";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Modal,
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
  const [previewing, setPreviewing] = useState<{ submission: ContactSubmission; sn: number } | null>(null);
  const [deleting, setDeleting] = useState<ContactSubmission | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { notify } = useToast();

  useLiveEvent("contact.created", (payload) => {
    refetch();
    notify(`New message from ${(payload.name as string) ?? "the website"}`);
  });
  useLiveEvent("contact.updated", refetch);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q)
      );
    });
  }, [data, query, status]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const newCount = (data ?? []).filter((r) => r.status === "new").length;

  async function setSubmissionStatus(s: ContactSubmission, next: ContactSubmission["status"]) {
    try {
      await api.updateContactStatus(s.id, next);
      notify(next === "read" ? "Marked as read" : next === "archived" ? "Archived" : "Marked as new");
      refetch();
      if (previewing && previewing.submission.id === s.id) {
        setPreviewing({ ...previewing, submission: { ...previewing.submission, status: next } });
      }
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
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, message…"
                className="w-40 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-forest-moss-500 focus:bg-white focus:ring-4 focus:ring-forest-moss-500/10 sm:w-56"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setStatus(f.key);
                    setPage(1);
                  }}
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
          <div className="space-y-4">
            <ul className="space-y-3">
              {paginatedRows.map((s, idx) => {
                const sn = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <SubmissionRow
                    key={s.id}
                    sn={sn}
                    submission={s}
                    onPreview={() => setPreviewing({ submission: s, sn })}
                    onDelete={() => setDeleting(s)}
                    onStatusChange={setSubmissionStatus}
                  />
                );
              })}
            </ul>

            {totalItems > pageSize && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div>
                  Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * pageSize + 1}</span>–
                  <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
                  <span className="font-semibold text-slate-800">{totalItems}</span> submissions
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>
                  <span className="px-2 font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* Preview / Detail Modal */}
      {previewing && (
        <ContactPreviewModal
          sn={previewing.sn}
          submission={previewing.submission}
          onClose={() => setPreviewing(null)}
          onDelete={() => {
            const s = previewing.submission;
            setPreviewing(null);
            setDeleting(s);
          }}
          onStatusChange={setSubmissionStatus}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <DeleteContactModal
          submission={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            notify("Contact submission deleted");
            refetch();
          }}
        />
      )}
    </div>
  );
}

const STATUS_TONE: Record<ContactSubmission["status"], "forest" | "sky" | "slate"> = {
  new: "forest",
  read: "sky",
  archived: "slate",
};

function SubmissionRow({
  sn,
  submission,
  onPreview,
  onDelete,
  onStatusChange,
}: {
  sn: number;
  submission: ContactSubmission;
  onPreview: () => void;
  onDelete: () => void;
  onStatusChange: (s: ContactSubmission, next: ContactSubmission["status"]) => void;
}) {
  const tone = STATUS_TONE[submission.status];
  const replyHref = `mailto:${submission.email}?subject=Re:%20AflaChat%20Inquiry%20from%20${encodeURIComponent(
    submission.name,
  )}`;

  return (
    <li className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-white hover:border-slate-200 hover:shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 tabular-nums">
            #{sn}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{submission.name}</p>
            <a
              href={`mailto:${submission.email}`}
              className="truncate text-xs text-forest-moss-700 hover:underline font-medium"
            >
              {submission.email}
            </a>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={tone}>{submission.status}</Badge>
          <span className="text-xs text-slate-400" title={fmtDateTime(submission.createdAt)}>
            {fmtRelative(submission.createdAt)}
          </span>
        </div>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-slate-700 line-clamp-3 whitespace-pre-wrap">
        {submission.message}
      </p>

      {/* Action buttons: Preview, Reply, Status, Delete */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/80 pt-2.5">
        <div className="flex items-center gap-1.5">
          {/* Preview Button */}
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-forest-moss-700"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>

          {/* Reply Button */}
          <a
            href={replyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-forest-moss-200 bg-forest-moss-50 px-2.5 py-1.5 text-xs font-semibold text-forest-moss-800 shadow-2xs transition-colors hover:bg-forest-moss-100"
          >
            <Reply className="h-3.5 w-3.5" />
            <span>Reply</span>
          </a>

          {/* Status buttons */}
          {submission.status !== "read" && (
            <button
              onClick={() => onStatusChange(submission, "read")}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:bg-slate-50"
            >
              <MailOpen className="h-3.5 w-3.5" />
              <span>Mark read</span>
            </button>
          )}
          {submission.status !== "archived" && (
            <button
              onClick={() => onStatusChange(submission, "archived")}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:bg-slate-50"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Archive</span>
            </button>
          )}
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Delete submission"
          aria-label="Delete submission"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function ContactPreviewModal({
  sn,
  submission,
  onClose,
  onDelete,
  onStatusChange,
}: {
  sn: number;
  submission: ContactSubmission;
  onClose: () => void;
  onDelete: () => void;
  onStatusChange: (s: ContactSubmission, next: ContactSubmission["status"]) => void;
}) {
  const { notify } = useToast();
  const replyHref = `mailto:${submission.email}?subject=Re:%20AflaChat%20Inquiry%20from%20${encodeURIComponent(
    submission.name,
  )}`;

  const copyEmail = () => {
    navigator.clipboard.writeText(submission.email);
    notify("Copied email address");
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(submission.message);
    notify("Copied message text");
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Submission #${sn} — ${submission.name}`}
      description={submission.email}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="danger" icon={Trash2} onClick={onDelete}>
            Delete
          </Button>

          <div className="flex items-center gap-2">
            <a
              href={replyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-forest-moss-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-forest-moss-800 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span>Reply via Email</span>
            </a>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge tone={STATUS_TONE[submission.status]}>{submission.status}</Badge>
            <span className="text-slate-500 font-medium">{fmtDateTime(submission.createdAt)}</span>
            <span className="text-slate-400">({fmtRelative(submission.createdAt)})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Copy className="h-3 w-3" />
              <span>Copy Email</span>
            </button>
            <button
              type="button"
              onClick={copyMessage}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Copy className="h-3 w-3" />
              <span>Copy Message</span>
            </button>
          </div>
        </div>

        {/* Message body */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Message Body</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 font-normal">
            {submission.message}
          </p>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-slate-500">Quick Status:</span>
          {submission.status !== "read" && (
            <button
              type="button"
              onClick={() => onStatusChange(submission, "read")}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Mark Read
            </button>
          )}
          {submission.status !== "archived" && (
            <button
              type="button"
              onClick={() => onStatusChange(submission, "archived")}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Archive
            </button>
          )}
          {submission.status !== "new" && (
            <button
              type="button"
              onClick={() => onStatusChange(submission, "new")}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Mark New
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function DeleteContactModal({
  submission,
  onClose,
  onDeleted,
}: {
  submission: ContactSubmission;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteContactSubmission(submission.id);
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
      title="Delete contact submission"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} loading={busy} icon={Trash2}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        Are you sure you want to delete the message from{" "}
        <span className="font-semibold text-slate-900">{submission.name}</span> ({submission.email})?
        This action cannot be undone.
      </p>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </Modal>
  );
}
