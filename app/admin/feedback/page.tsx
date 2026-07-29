"use client";

import { useMemo, useState } from "react";
import { MessageSquareQuote, RefreshCw, Search } from "lucide-react";
import { api, type CommunityFeedbackRow } from "@/lib/adminApi";
import { useAdminData } from "@/components/admin/useAdmin";
import { useLiveEvent } from "@/components/admin/LiveContext";
import {
  EmptyState,
  ErrorState,
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
  const { notify } = useToast();

  useLiveEvent("feedback.created", () => {
    refetch();
    notify("New feedback received");
  });

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((f) => {
      if (lang !== "all" && f.language !== lang) return false;
      if (query.trim() && !f.message.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [data, lang, query]);

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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
                className="w-40 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-forest-moss-500 focus:bg-white focus:ring-4 focus:ring-forest-moss-500/10 sm:w-56"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {LANG_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setLang(f.key)}
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
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((f, i) => (
              <FeedbackCard key={i} feedback={f} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: CommunityFeedbackRow }) {
  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md">
      <MessageSquareQuote className="mb-2 h-5 w-5 text-forest-moss-300" aria-hidden />
      <p className="text-sm leading-relaxed text-slate-800">{feedback.message}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <Tag value={feedback.language} />
        <span>·</span>
        <span title={fmtDateTime(feedback.createdAt)}>{fmtRelative(feedback.createdAt)}</span>
        {feedback.deviceHash && (
          <span className="ml-auto truncate font-mono text-[10px]">{feedback.deviceHash.slice(0, 10)}</span>
        )}
      </div>
    </div>
  );
}
