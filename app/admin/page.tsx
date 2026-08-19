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
import { useLiveEvent } from "@/components/admin/LiveContext";
import { BarList, Donut, LineChart } from "@/components/admin/charts";
import { TopicWordCloud } from "@/components/admin/TopicWordCloud";
import { UserLocationMap } from "@/components/admin/UserLocationMap";
import { RegionSessionsTable } from "@/components/admin/RegionSessionsTable";
import {
  calcGrowth,
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
  const geo = useAdminData(() => api.geo(), [], onAuthError);

  const refreshAll = () => {
    overview.refetch();
    series.refetch();
    languages.refetch();
    topics.refetch();
    quality.refetch();
    geo.refetch();
  };

  // Live: any of these means the numbers on this page just went stale.
  useLiveEvent(
    ["session.created", "session.ended", "message.created", "feedback.created", "offline.created", "unanswered.created"],
    refreshAll,
  );

  const o = overview.data;
  const p = o?.platforms;

  // Period-over-period growth: split the selected range in half and compare
  // sums, so "+12%" means "busier in the recent half of this range."
  const seriesData = series.data ?? [];
  const mid = Math.floor(seriesData.length / 2);
  const earlier = seriesData.slice(0, mid);
  const recent = seriesData.slice(mid);
  const sum = (rows: typeof seriesData, key: "sessions" | "messages") =>
    rows.reduce((a, r) => a + r[key], 0);
  const trendLabel = `vs earlier ${days}d`;
  const sessionsGrowth =
    earlier.length && recent.length ? calcGrowth(sum(recent, "sessions"), sum(earlier, "sessions")) : null;
  const messagesGrowth =
    earlier.length && recent.length ? calcGrowth(sum(recent, "messages"), sum(earlier, "messages")) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-2xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest-moss-700">Operations pulse</p>
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">What is happening across AflaChat</h2>
          <p className="mt-1 text-sm text-slate-500">Live engagement, answer quality and access signals from the website and mobile apps.</p>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="Sessions"
            value={fmtNum(o.sessions)}
            sub={`${o.endedSessions} ended`}
            icon={Users}
            trend={{ growth: sessionsGrowth, label: trendLabel }}
          />
          <StatCard
            label="Messages"
            value={fmtNum(o.messages)}
            sub={`${fmtNum(o.userMessages)} from users`}
            accent="#0ea5e9"
            icon={MessageSquare}
            trend={{ growth: messagesGrowth, label: trendLabel }}
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
            accent="#66b710"
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
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${days === r ? "bg-white text-forest-moss-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
          <LineChart
            data={(series.data ?? []).map((d) => ({
              label: d.day.slice(5),
              Sessions: d.sessions,
              Messages: d.messages,
            }))}
            series={[
              { key: "Sessions", label: "Sessions", color: "#66b710" },
              { key: "Messages", label: "Messages", color: "#0ea5e9" },
            ]}
          />
        )}
      </Panel>

      {/* Source + languages */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Traffic source (website vs app)">
          {p ? (
            <Donut
              segments={[
                { label: "Website", value: p.web, color: "#0ea5e9" },
                { label: "Android", value: p.android, color: "#66b710" },
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
              <StatCard label="👍 Helpful" value={quality.data.feedback.up} accent="#66b710" />
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

      {/* Open Source Map — User Geolocation & Audience Hotspots */}
      <UserLocationMap
        data={geo.data}
        loading={geo.loading}
        error={geo.error}
        onRetry={geo.refetch}
      />

      {/* Regional Sessions Breakdown Table */}
      <RegionSessionsTable
        data={geo.data}
        loading={geo.loading}
        error={geo.error}
        onRetry={geo.refetch}
      />

      {/* Word Cloud & Topics Table */}
      <TopicWordCloud
        topics={topics.data}
        loading={topics.loading}
        error={topics.error}
        onRetry={topics.refetch}
      />
    </div>
  );
}
