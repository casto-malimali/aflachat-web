"use client";

import { useState } from "react";
import {
  RefreshCw,
  Users,
  MessageSquare,
  Gauge,
  Timer,
  MessagesSquare,
  HelpCircle,
  WifiOff,
  Globe,
} from "lucide-react";
import { api } from "@/lib/adminApi";
import { useAdminData } from "@/components/admin/useAdmin";
import { BarList, Donut, LineChart } from "@/components/admin/charts";
import {
  ErrorState,
  Panel,
  Spinner,
  StatCard,
  StatCardSkeleton,
  fmtDuration,
  fmtNum,
} from "@/components/admin/ui";

const RANGES = [7, 30, 90] as const;

const onAuthError = () => {
  if (typeof window !== "undefined") window.location.reload();
};

/** Read the saved default analytics range from the Settings page (if any). */
function defaultRange(): (typeof RANGES)[number] {
  if (typeof window === "undefined") return 30;
  try {
    const saved = Number(JSON.parse(localStorage.getItem("aflachat_admin_prefs") ?? "{}").defaultRange);
    return (RANGES as readonly number[]).includes(saved) ? (saved as (typeof RANGES)[number]) : 30;
  } catch {
    return 30;
  }
}

export default function OverviewPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(defaultRange);

  const overview = useAdminData(() => api.overview(), [], onAuthError);
  const series = useAdminData(() => api.timeseries(days), [days], onAuthError);
  const languages = useAdminData(() => api.languages(), [], onAuthError);
  const topics = useAdminData(() => api.topics(), [], onAuthError);
  const quality = useAdminData(() => api.quality(), [], onAuthError);

  const refreshAll = () => {
    overview.refetch();
    series.refetch();
    languages.refetch();
    topics.refetch();
    quality.refetch();
  };

  const o = overview.data;
  const p = o?.platforms;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Dashboard overview</h2>
          <p className="text-sm text-slate-500">Analytics across the website and mobile app.</p>
        </div>
        <button
          onClick={refreshAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {/* KPI cards */}
      {overview.loading ? (
        <StatCardSkeleton count={8} />
      ) : overview.error ? (
        <ErrorState message={overview.error} onRetry={overview.refetch} />
      ) : o ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Sessions" value={fmtNum(o.sessions)} sub={`${o.endedSessions} ended`} icon={Users} />
          <StatCard
            label="Messages"
            value={fmtNum(o.messages)}
            sub={`${fmtNum(o.userMessages)} from users`}
            accent="#0ea5e9"
            icon={MessageSquare}
          />
          <StatCard
            label="Avg / session"
            value={o.avgMessagesPerSession}
            sub={fmtDuration(o.avgSessionMs)}
            accent="#0d9488"
            icon={Gauge}
          />
          <StatCard
            label="Avg latency"
            value={`${fmtNum(o.avgLatencyMs)}ms`}
            sub={`${o.activeDays} active days`}
            accent="#f59e0b"
            icon={Timer}
          />
          <StatCard label="Community feedback" value={fmtNum(o.communityFeedback)} accent="#0f766e" icon={MessagesSquare} />
          <StatCard label="Unanswered" value={fmtNum(o.unanswered)} accent="#ef4444" icon={HelpCircle} />
          <StatCard label="Offline attempts" value={fmtNum(o.offlineAttempts)} accent="#64748b" icon={WifiOff} />
          <StatCard
            label="Web sessions"
            value={p ? fmtNum(p.web) : "—"}
            sub={p ? `${p.android + p.ios + p.other} from app` : undefined}
            accent="#10b981"
            icon={Globe}
          />
        </div>
      ) : null}

      {/* Trend */}
      <Panel
        title="Activity trend"
        action={
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  days === r ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        }
      >
        {series.loading ? (
          <Spinner />
        ) : series.error ? (
          <ErrorState message={series.error} onRetry={series.refetch} />
        ) : (
          <>
            <LineChart
              data={(series.data ?? []).map((d) => ({
                label: d.day.slice(5),
                Sessions: d.sessions,
                Messages: d.messages,
              }))}
              series={[
                { key: "Sessions", label: "Sessions", color: "#10b981" },
                { key: "Messages", label: "Messages", color: "#0ea5e9" },
              ]}
            />
            <Legend
              items={[
                { label: "Sessions", color: "#10b981" },
                { label: "Messages", color: "#0ea5e9" },
              ]}
            />
          </>
        )}
      </Panel>

      {/* Source + languages */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Traffic source (website vs app)">
          {p ? (
            <Donut
              segments={[
                { label: "Website", value: p.web, color: "#0ea5e9" },
                { label: "Android", value: p.android, color: "#10b981" },
                { label: "iOS", value: p.ios, color: "#0d9488" },
                { label: "Other", value: p.other, color: "#cbd5e1" },
              ]}
            />
          ) : (
            <Spinner />
          )}
        </Panel>

        <Panel title="Languages">
          {languages.loading ? (
            <Spinner />
          ) : (
            <BarList
              items={[
                { label: "English", value: languages.data?.totals.en ?? 0, color: "#f59e0b" },
                { label: "Swahili", value: languages.data?.totals.sw ?? 0, color: "#d97706" },
              ]}
            />
          )}
        </Panel>
      </div>

      {/* Topics + quality */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top topics">
          {topics.loading ? (
            <Spinner />
          ) : (
            <BarList
              items={(topics.data ?? []).slice(0, 10).map((t) => ({ label: t.keyword, value: t.count }))}
            />
          )}
        </Panel>

        <Panel title="Answer quality">
          {quality.loading ? (
            <Spinner />
          ) : quality.data ? (
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="👍 Helpful" value={quality.data.feedback.up} accent="#10b981" />
              <StatCard label="👎 Not helpful" value={quality.data.feedback.down} accent="#ef4444" />
              <StatCard
                label="Context hit rate"
                value={`${Math.round(quality.data.contextHitRate * 100)}%`}
                sub={`of ${fmtNum(quality.data.answers)} answers`}
                accent="#0ea5e9"
              />
              <StatCard label="Unanswered" value={quality.data.unansweredCount} accent="#f59e0b" />
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-3 flex justify-center gap-5 text-xs text-slate-500">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
