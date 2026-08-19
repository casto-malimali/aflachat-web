"use client";

import { useMemo, useState } from "react";
import {
  Compass,
  Globe,
  Languages,
  MapPin,
  Search,
  Smartphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge, Panel, Spinner, Tag, fmtDateTime, fmtNum, fmtRelative } from "@/components/admin/ui";
import type { GeoAnalytics, GeoCell } from "@/lib/adminApi";

interface RegionSessionsTableProps {
  data?: GeoAnalytics | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// Approximate Tanzania & East Africa region resolver from coordinates
function resolveRegionName(lat: number, lng: number): { name: string; zone: string } {
  if (lat >= -7.2 && lat <= -6.6 && lng >= 39.0 && lng <= 39.6) {
    return { name: "Dar es Salaam", zone: "Coastal Zone" };
  }
  if (lat >= -3.6 && lat <= -3.1 && lng >= 36.4 && lng <= 37.0) {
    return { name: "Arusha & Meru", zone: "Northern Zone" };
  }
  if (lat >= -3.5 && lat <= -3.0 && lng >= 37.1 && lng <= 37.8) {
    return { name: "Kilimanjaro / Moshi", zone: "Northern Zone" };
  }
  if (lat >= -6.4 && lat <= -5.8 && lng >= 35.4 && lng <= 36.1) {
    return { name: "Dodoma Central", zone: "Central Zone" };
  }
  if (lat >= -2.8 && lat <= -2.2 && lng >= 32.6 && lng <= 33.2) {
    return { name: "Mwanza & Lake Victoria", zone: "Lake Zone" };
  }
  if (lat >= -9.2 && lat <= -8.6 && lng >= 33.2 && lng <= 33.7) {
    return { name: "Mbeya & Rungwe", zone: "Southern Highlands" };
  }
  if (lat >= -8.0 && lat <= -7.5 && lng >= 35.5 && lng <= 36.0) {
    return { name: "Iringa Region", zone: "Southern Highlands" };
  }
  if (lat >= -5.3 && lat <= -4.8 && lng >= 38.8 && lng <= 39.3) {
    return { name: "Tanga Coast", zone: "Coastal Zone" };
  }
  if (lat >= -5.2 && lat <= -4.7 && lng >= 29.4 && lng <= 30.0) {
    return { name: "Kigoma & Lake Tanganyika", zone: "Western Zone" };
  }
  if (lat >= -7.0 && lat <= -6.5 && lng >= 37.4 && lng <= 38.0) {
    return { name: "Morogoro Region", zone: "Eastern Zone" };
  }
  if (lat >= -1.5 && lat <= -1.0 && lng >= 31.6 && lng <= 32.0) {
    return { name: "Kagera / Bukoba", zone: "Lake Zone" };
  }
  if (lat >= -11.0 && lat <= -10.0 && lng >= 35.0 && lng <= 36.0) {
    return { name: "Ruvuma / Songea", zone: "Southern Zone" };
  }
  if (lat >= -10.5 && lat <= -10.0 && lng >= 39.8 && lng <= 40.3) {
    return { name: "Mtwara Coast", zone: "Southern Zone" };
  }
  if (lat >= -12.0 && lat <= -1.0 && lng >= 29.0 && lng <= 41.0) {
    return { name: `Tanzania (${lat.toFixed(2)}, ${lng.toFixed(2)})`, zone: "Tanzania" };
  }
  return { name: `Region (${lat.toFixed(2)}, ${lng.toFixed(2)})`, zone: "Global / Regional" };
}

export function RegionSessionsTable({
  data,
  loading = false,
  error = null,
  onRetry,
}: RegionSessionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState<number | "all">(25);
  const [sortBy, setSortBy] = useState<"sessions" | "name">("sessions");

  const regions = useMemo(() => {
    const rawCells = data?.cells ?? [];
    return rawCells
      .map((c) => {
        let lat = c.lat;
        let lng = c.lng;
        if (lat === undefined || lng === undefined) {
          const parts = c.cell.split(",");
          lat = Number(parts[0]);
          lng = Number(parts[1]);
        }
        const { name, zone } = resolveRegionName(lat, lng);
        return {
          ...c,
          lat,
          lng,
          regionName: name,
          zone,
        };
      })
      .filter((c) => !isNaN(c.lat) && !isNaN(c.lng));
  }, [data]);

  const totalSessions = useMemo(() => {
    return regions.reduce((sum, r) => sum + r.count, 0);
  }, [regions]);

  const filteredRegions = useMemo(() => {
    let list = [...regions];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.regionName.toLowerCase().includes(term) ||
          r.zone.toLowerCase().includes(term) ||
          r.cell.toLowerCase().includes(term),
      );
    }

    if (sortBy === "sessions") {
      list.sort((a, b) => b.count - a.count);
    } else {
      list.sort((a, b) => a.regionName.localeCompare(b.regionName));
    }

    if (limit !== "all") {
      list = list.slice(0, limit);
    }

    return list;
  }, [regions, searchTerm, sortBy, limit]);

  const topRegion = regions[0];

  return (
    <Panel
      title="Sessions by Region"
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search region or zone…"
              aria-label="Filter regions"
              className="h-8 w-44 sm:w-56 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-8 pr-2.5 text-xs outline-none focus:border-forest-moss-500 focus:bg-white focus:ring-2 focus:ring-forest-moss-500/10 transition-all"
            />
          </div>

          {/* Rows limit */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            {[10, 25, 50, "all"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setLimit(val as number | "all")}
                className={`rounded-md px-2 py-1 transition-colors ${
                  limit === val
                    ? "bg-white text-forest-moss-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {val === "all" ? "All" : val}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {loading ? (
        <Spinner label="Loading regional session breakdown…" />
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Total Regional Sessions
              </p>
              <p className="mt-0.5 text-lg font-bold text-forest-moss-700 tabular-nums">
                {fmtNum(data?.sessionsWithLocation ?? totalSessions)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Active Regions / Hubs
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-900 tabular-nums">
                {fmtNum(regions.length)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Top Active Region
              </p>
              <p className="mt-0.5 truncate text-lg font-bold text-teal-700" title={topRegion?.regionName}>
                {topRegion?.regionName ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Top Hub Session Share
              </p>
              <p className="mt-0.5 text-lg font-bold text-amber-700 tabular-nums">
                {topRegion && totalSessions > 0
                  ? `${((topRegion.count / totalSessions) * 100).toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Regional Sessions Table */}
          {filteredRegions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              {regions.length === 0
                ? "No regional session data recorded yet."
                : "No regions match your search criteria."}
            </div>
          ) : (
            <div className="-mx-4 overflow-x-auto sm:-mx-5">
              <table className="w-full min-w-[660px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="w-12 px-5 py-2.5 font-medium text-center">SN</th>
                    <th className="px-5 py-2.5 font-medium">Region & Zone</th>
                    <th className="px-5 py-2.5 font-medium text-right">Sessions</th>
                    <th className="w-48 px-5 py-2.5 font-medium">Share of Total</th>
                    <th className="px-5 py-2.5 font-medium">Language</th>
                    <th className="px-5 py-2.5 font-medium">Source</th>
                    <th className="px-5 py-2.5 font-medium text-right">Latest Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRegions.map((r, idx) => {
                    const sharePct = totalSessions > 0 ? (r.count / totalSessions) * 100 : 0;
                    const swShare = r.swCount !== undefined && r.count > 0 ? Math.round((r.swCount / r.count) * 100) : 100;
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    return (
                      <tr
                        key={r.cell}
                        className="transition-colors hover:bg-forest-moss-50/40"
                      >
                        {/* Serial Number */}
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold tabular-nums ${
                              isTop1
                                ? "bg-amber-100 text-amber-800"
                                : isTop2
                                ? "bg-slate-200 text-slate-700"
                                : isTop3
                                ? "bg-amber-700/15 text-amber-900"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>

                        {/* Region & Zone */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-forest-moss-600" />
                            <div>
                              <p className="font-semibold text-slate-900">{r.regionName}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{r.zone}</span>
                                <span>·</span>
                                <span className="font-mono text-[11px]">
                                  {r.lat.toFixed(3)}, {r.lng.toFixed(3)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Sessions Count */}
                        <td className="px-5 py-3 text-right font-bold tabular-nums text-slate-900">
                          {fmtNum(r.count)}
                        </td>

                        {/* Share % with Visual Progress Bar */}
                        <td className="px-5 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700 tabular-nums">
                                {sharePct.toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-slate-400 tabular-nums">
                                {r.count}/{totalSessions}
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-forest-moss-500 transition-all"
                                style={{ width: `${Math.max(4, sharePct)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Language */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Tag value={swShare >= 50 ? "sw" : "en"} />
                            <span className="text-[11px] text-slate-500">
                              {swShare}% Swahili
                            </span>
                          </div>
                        </td>

                        {/* Platform */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            {r.webCount && r.webCount > (r.appCount ?? 0) ? (
                              <>
                                <Globe className="h-3.5 w-3.5 text-forest-moss-600" />
                                <span>Web ({r.webCount})</span>
                              </>
                            ) : (
                              <>
                                <Smartphone className="h-3.5 w-3.5 text-sky-600" />
                                <span>Mobile ({r.appCount ?? r.count})</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Recency */}
                        <td className="px-5 py-3 text-right text-xs text-slate-400" title={r.latestSessionAt ? fmtDateTime(r.latestSessionAt) : undefined}>
                          {r.latestSessionAt ? fmtRelative(r.latestSessionAt) : "Active"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
