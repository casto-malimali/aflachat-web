"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/adminApi";
import { useAdminData } from "@/components/admin/useAdmin";
import { BarList, Donut, LineChart } from "@/components/admin/charts";
import {
  ErrorState,
  Panel,
  Spinner,
  StatCard,
  fmtDuration,
  fmtNum,
} from "@/components/admin/ui";

const RANGES = [7, 30, 90] as const;

const onAuthError = () => {
  if (typeof window !== "undefined") window.location.reload();
};

export default function OverviewPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);

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
          <h1 className="text-xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500">Analytics across the website and mobile app.</p>
        </div>
        <button
          onClick={refreshAll}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      {/* KPI cards */}
      {overview.loading ? (
        <Spinner />
      ) : overview.error ? (
        <ErrorState message={overview.error} onRetry={overview.refetch} />
      ) : o ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Sessions" value={fmtNum(o.sessions)} sub={`${o.endedSessions} ended`} />
          <StatCard
            label="Messages"
            value={fmtNum(o.messages)}
            sub={`${fmtNum(o.userMessages)} from users`}
            accent="#0ea5e9"
          />
          <StatCard
            label="Avg / session"
            value={o.avgMessagesPerSession}
            sub={fmtDuration(o.avgSessionMs)}
            accent="#8b5cf6"
          />
          <StatCard
            label="Avg latency"
            value={`${fmtNum(o.avgLatencyMs)}ms`}
            sub={`${o.activeDays} active days`}
            accent="#f59e0b"
          />
          <StatCard label="Community feedback" value={fmtNum(o.communityFeedback)} accent="#ec4899" />
          <StatCard label="Unanswered" value={fmtNum(o.unanswered)} accent="#ef4444" />
          <StatCard label="Offline attempts" value={fmtNum(o.offlineAttempts)} accent="#64748b" />
          <StatCard
            label="Web sessions"
            value={p ? fmtNum(p.web) : "—"}
            sub={p ? `${p.android + p.ios + p.other} from app` : undefined}
            accent="#10b981"
          />
        </div>
      ) : null}

      {/* Trend */}
      <Panel
        title="Activity trend"
        action={
          <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  days === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
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
                { label: "iOS", value: p.ios, color: "#8b5cf6" },
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
                { label: "Swahili", value: languages.data?.totals.sw ?? 0, color: "#f43f5e" },
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
    <div className="mt-3 flex justify-center gap-5 text-xs text-gray-500">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
