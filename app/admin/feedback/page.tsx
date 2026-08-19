"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  MessageSquareQuote,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { api, type CommunityFeedbackRow } from "@/lib/adminApi";
import { useAdminData } from "@/components/admin/useAdmin";
import { useLiveEvent } from "@/components/admin/LiveContext";
import {
  Button,
  EmptyState,
  ErrorState,
  Modal,
  Panel,
  Spinner,
  StatCard,
  StatCardSkeleton,
  Tag,
  fmtDateTime,
  fmtRelative,
  useToast,
} from "@/components/admin/ui";

const onAuthError = () => {
  if (typeof window !== "undefined") window.location.reload();
};

const LANG_FILTERS = [
  { key: "all", label: "All" },
  { key: "en", label: "English" },
  { key: "sw", label: "Swahili" },
] as const;

type LangFilter = (typeof LANG_FILTERS)[number]["key"];

function countRecent(rows: CommunityFeedbackRow[], hours: number): number {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return rows.filter((f) => new Date(f.createdAt).getTime() > cutoff).length;
}

export default function FeedbackPage() {
  const { data, loading, error, refetch } = useAdminData(() => api.feedback(300), [], onAuthError);
  const [lang, setLang] = useState<LangFilter>("all");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<{ feedback: CommunityFeedbackRow; sn: number } | null>(null);
  const [deleting, setDeleting] = useState<CommunityFeedbackRow | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { notify } = useToast();

  useLiveEvent("feedback.created", () => {
    refetch();
    notify("Feedback list updated");
  });

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((f) => {
      if (lang !== "all" && f.language !== lang) return false;
      if (query.trim() && !f.message.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [data, lang, query]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const enCount = (data ?? []).filter((f) => f.language === "en").length;
  const swCount = (data ?? []).filter((f) => f.language === "sw").length;
  const last24h = countRecent(data ?? [], 24);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Community feedback</h2>
          <p className="text-sm text-slate-500">Free-text feedback submitted from the website and app.</p>
        </div>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {loading ? (
        <StatCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total feedback" value={data?.length ?? 0} icon={MessageSquareQuote} />
          <StatCard label="Last 24h" value={last24h} accent="#0ea5e9" />
          <StatCard label="English" value={enCount} accent="#66b710" />
          <StatCard label="Swahili" value={swCount} accent="#d97706" />
        </div>
      )}

      <Panel
        title="All feedback"
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
                placeholder="Search messages…"
                className="w-40 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-forest-moss-500 focus:bg-white focus:ring-4 focus:ring-forest-moss-500/10 sm:w-56"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {LANG_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setLang(f.key);
                    setPage(1);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    lang === f.key ? "bg-white text-forest-moss-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
            icon={MessageSquareQuote}
            label={data?.length ? "No feedback matches your filters" : "No feedback yet"}
            hint={
              data?.length
                ? "Try clearing the search or switching language."
                : "Feedback submitted in the app or website will show up here."
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {paginatedRows.map((f, i) => {
                const sn = (currentPage - 1) * pageSize + i + 1;
                return (
                  <FeedbackCard
                    key={f.createdAt + i}
                    sn={sn}
                    feedback={f}
                    onView={() => setViewing({ feedback: f, sn })}
                    onDelete={() => setDeleting(f)}
                  />
                );
              })}
            </div>

            {totalItems > pageSize && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div>
                  Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * pageSize + 1}</span>–
                  <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
                  <span className="font-semibold text-slate-800">{totalItems}</span> feedback entries
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

      {/* View / Preview Modal */}
      {viewing && (
        <FeedbackDetailModal
          sn={viewing.sn}
          feedback={viewing.feedback}
          onClose={() => setViewing(null)}
          onDelete={() => {
            const f = viewing.feedback;
            setViewing(null);
            setDeleting(f);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <DeleteFeedbackModal
          feedback={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            notify("Feedback entry deleted");
            refetch();
          }}
        />
      )}
    </div>
  );
}

function FeedbackCard({
  sn,
  feedback,
  onView,
  onDelete,
}: {
  sn: number;
  feedback: CommunityFeedbackRow;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5.5 min-w-[22px] px-1.5 items-center justify-center rounded-md bg-forest-moss-100/70 text-[11px] font-bold text-forest-moss-800 tabular-nums">
              #{sn}
            </span>
            <Tag value={feedback.language} />
          </div>

          {/* Action buttons: View and Delete */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onView}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-forest-moss-50 hover:text-forest-moss-700 transition-colors"
              title="View feedback details"
              aria-label="View feedback"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete feedback"
              aria-label="Delete feedback"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="line-clamp-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{feedback.message}</p>
      </div>

      <div className="mt-3.5 flex items-center gap-2 border-t border-slate-100/80 pt-2.5 text-xs text-slate-400">
        <span title={fmtDateTime(feedback.createdAt)}>{fmtRelative(feedback.createdAt)}</span>
        {feedback.deviceHash && (
          <span className="ml-auto truncate font-mono text-[10px] text-slate-400">
            {feedback.deviceHash.slice(0, 10)}
          </span>
        )}
      </div>
    </div>
  );
}

function FeedbackDetailModal({
  sn,
  feedback,
  onClose,
  onDelete,
}: {
  sn: number;
  feedback: CommunityFeedbackRow;
  onClose: () => void;
  onDelete: () => void;
}) {
  const { notify } = useToast();

  const copyMessage = () => {
    navigator.clipboard.writeText(feedback.message);
    notify("Copied feedback text to clipboard");
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Feedback Details #${sn}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button variant="danger" icon={Trash2} onClick={onDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Copy} onClick={copyMessage}>
              Copy text
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Tag value={feedback.language} />
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
            {fmtDateTime(feedback.createdAt)} ({fmtRelative(feedback.createdAt)})
          </span>
          {feedback.deviceHash && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-slate-500">
              Device: {feedback.deviceHash}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {feedback.message}
          </p>
        </div>
      </div>
    </Modal>
  );
}

function DeleteFeedbackModal({
  feedback,
  onClose,
  onDeleted,
}: {
  feedback: CommunityFeedbackRow;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteFeedback(feedback.createdAt, feedback.message);
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
      title="Delete feedback entry"
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
        Are you sure you want to delete this community feedback entry? This action cannot be undone.
      </p>
      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 line-clamp-3 italic">
        &ldquo;{feedback.message}&rdquo;
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </Modal>
  );
}
