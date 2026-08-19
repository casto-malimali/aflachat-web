"use client";

import { useMemo, useState } from "react";
import {
  Cloud,
  Flame,
  Hash,
  Layers,
  Percent,
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  Tag,
  X,
} from "lucide-react";
import { Badge, EmptyState, Panel, Spinner, fmtNum } from "@/components/admin/ui";
import type { Topic } from "@/lib/adminApi";

interface TopicWordCloudProps {
  topics?: Topic[] | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

type SortField = "count" | "keyword";
type SortOrder = "asc" | "desc";

export function TopicWordCloud({
  topics,
  loading = false,
  error = null,
  onRetry,
}: TopicWordCloudProps) {
  const topicList = useMemo(() => topics ?? [], [topics]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("count");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<"both" | "cloud" | "table">("both");
  const [limit, setLimit] = useState<number>(20);

  const { minCount, maxCount, totalMentions } = useMemo(() => {
    if (!topicList.length) return { minCount: 0, maxCount: 0, totalMentions: 0 };
    let min = Infinity;
    let max = -Infinity;
    let total = 0;
    for (const t of topicList) {
      if (t.count < min) min = t.count;
      if (t.count > max) max = t.count;
      total += t.count;
    }
    return {
      minCount: min === Infinity ? 0 : min,
      maxCount: max === -Infinity ? 0 : max,
      totalMentions: total,
    };
  }, [topicList]);

  // Filtered & sorted topics
  const filteredTopics = useMemo(() => {
    let list = topicList.filter((t) =>
      t.keyword.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );

    if (selectedKeyword) {
      list = list.filter(
        (t) => t.keyword.toLowerCase() === selectedKeyword.toLowerCase(),
      );
    }

    list.sort((a, b) => {
      if (sortField === "count") {
        return sortOrder === "desc" ? b.count - a.count : a.count - b.count;
      }
      return sortOrder === "desc"
        ? b.keyword.localeCompare(a.keyword)
        : a.keyword.localeCompare(b.keyword);
    });

    return list;
  }, [topicList, searchTerm, selectedKeyword, sortField, sortOrder]);

  const displayedTopics = useMemo(() => {
    if (limit === 0) return filteredTopics;
    return filteredTopics.slice(0, limit);
  }, [filteredTopics, limit]);

  // Helper to compute size & weight class for a topic in the word cloud
  const getWordStyle = (count: number) => {
    if (maxCount === minCount) {
      return {
        fontSize: "text-sm",
        fontWeight: "font-semibold",
        colorClass:
          "bg-forest-moss-50 text-forest-moss-800 border-forest-moss-200 hover:bg-forest-moss-100",
        badgeClass: "bg-forest-moss-200/80 text-forest-moss-900",
      };
    }

    const weight = (count - minCount) / (maxCount - minCount);

    if (weight >= 0.8) {
      return {
        fontSize: "text-lg sm:text-xl",
        fontWeight: "font-black tracking-tight",
        colorClass:
          "bg-forest-moss-600 text-white border-forest-moss-700 shadow-sm hover:bg-forest-moss-700 scale-105",
        badgeClass: "bg-white/20 text-white",
      };
    }
    if (weight >= 0.55) {
      return {
        fontSize: "text-base sm:text-lg",
        fontWeight: "font-bold",
        colorClass:
          "bg-forest-moss-100 text-forest-moss-900 border-forest-moss-300 hover:bg-forest-moss-200",
        badgeClass: "bg-forest-moss-200 text-forest-moss-800",
      };
    }
    if (weight >= 0.3) {
      return {
        fontSize: "text-sm sm:text-base",
        fontWeight: "font-semibold",
        colorClass: "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100",
        badgeClass: "bg-teal-100 text-teal-800",
      };
    }
    if (weight >= 0.15) {
      return {
        fontSize: "text-xs sm:text-sm",
        fontWeight: "font-medium",
        colorClass: "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100",
        badgeClass: "bg-sky-100 text-sky-800",
      };
    }
    return {
      fontSize: "text-xs",
      fontWeight: "font-normal",
      colorClass: "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100",
      badgeClass: "bg-zinc-200/70 text-zinc-600",
    };
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <Panel
      title="Topics & Keyword Intelligence"
      action={
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg bg-zinc-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("both")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                viewMode === "both"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Layers className="h-3 w-3" />
              <span className="hidden sm:inline">All</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cloud")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                viewMode === "cloud"
                  ? "bg-white text-forest-moss-700 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Cloud className="h-3 w-3" />
              <span>Word Cloud</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                viewMode === "table"
                  ? "bg-white text-forest-moss-700 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <TableIcon className="h-3 w-3" />
              <span>Table</span>
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <Spinner label="Loading topics intelligence…" />
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Retry
            </button>
          )}
        </div>
      ) : topicList.length === 0 ? (
        <EmptyState
          icon={Tag}
          label="No topics extracted yet"
          hint="Topics will appear as users interact with AflaChat."
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Pills */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Total Topics</p>
              <p className="mt-0.5 text-lg font-bold text-zinc-900 tabular-nums">{fmtNum(topicList.length)}</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Total Mentions</p>
              <p className="mt-0.5 text-lg font-bold text-forest-moss-700 tabular-nums">{fmtNum(totalMentions)}</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Top Topic</p>
              <p className="mt-0.5 truncate text-lg font-bold text-zinc-900" title={topicList[0]?.keyword}>
                {topicList[0]?.keyword ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Peak Frequency</p>
              <p className="mt-0.5 text-lg font-bold text-teal-700 tabular-nums">
                {maxCount ? `${fmtNum(maxCount)} hits` : "—"}
              </p>
            </div>
          </div>

          {/* 1. WORD CLOUD SECTION */}
          {(viewMode === "both" || viewMode === "cloud") && (
            <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-zinc-50/80 to-white p-5 shadow-2xs">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-moss-100 text-forest-moss-700">
                    <Cloud className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Word Cloud Visualization</h3>
                    <p className="text-xs text-zinc-500">
                      Sized and color-scaled by discussion frequency. Click any keyword to filter.
                    </p>
                  </div>
                </div>

                {selectedKeyword && (
                  <button
                    type="button"
                    onClick={() => setSelectedKeyword(null)}
                    className="inline-flex items-center gap-1 rounded-full bg-forest-moss-100 px-3 py-1 text-xs font-semibold text-forest-moss-800 hover:bg-forest-moss-200 transition-colors"
                  >
                    <span>Filter: {selectedKeyword}</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Word Cloud Cluster */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 py-4 min-h-[160px]">
                {topicList.map((t) => {
                  const style = getWordStyle(t.count);
                  const isSelected = selectedKeyword?.toLowerCase() === t.keyword.toLowerCase();
                  const pct = totalMentions > 0 ? ((t.count / totalMentions) * 100).toFixed(1) : "0";

                  return (
                    <button
                      key={t.keyword}
                      type="button"
                      onClick={() =>
                        setSelectedKeyword((prev) =>
                          prev?.toLowerCase() === t.keyword.toLowerCase() ? null : t.keyword,
                        )
                      }
                      title={`"${t.keyword}": ${fmtNum(t.count)} mentions (${pct}% of discussions)`}
                      className={`group inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 transition-all duration-200 cursor-pointer ${
                        style.fontSize
                      } ${style.fontWeight} ${
                        isSelected
                          ? "ring-3 ring-forest-moss-500 ring-offset-1 scale-110 !bg-forest-moss-700 !text-white !border-forest-moss-800 shadow-md"
                          : style.colorClass
                      }`}
                    >
                      <span>{t.keyword}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums transition-opacity ${style.badgeClass}`}
                      >
                        {fmtNum(t.count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. TOPICS TABLE SECTION (placed below the Word Cloud) */}
          {(viewMode === "both" || viewMode === "table") && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                    <TableIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Topics Table Breakdown</h3>
                    <p className="text-xs text-zinc-500">
                      Detailed rankings, discussion share, and prevalence metrics.
                    </p>
                  </div>
                </div>

                {/* Search & Limit controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter topic..."
                      aria-label="Filter topics"
                      className="h-8 w-44 rounded-lg border border-zinc-200 bg-white py-1 pl-8 pr-3 text-xs outline-none focus:border-forest-moss-500 focus:ring-1 focus:ring-forest-moss-500"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-zinc-700 outline-none focus:border-forest-moss-500"
                    aria-label="Display limit"
                  >
                    <option value={10}>Show 10</option>
                    <option value={20}>Show 20</option>
                    <option value={50}>Show 50</option>
                    <option value={0}>Show all ({topicList.length})</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50/75 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="w-14 py-2.5 px-3 text-center">Sn</th>
                        <th
                          className="py-2.5 px-4 cursor-pointer select-none hover:text-zinc-800"
                          onClick={() => toggleSort("keyword")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Topic Keyword</span>
                            <SlidersHorizontal className="h-3 w-3 text-zinc-400" />
                          </div>
                        </th>
                        <th
                          className="py-2.5 px-4 text-right cursor-pointer select-none hover:text-zinc-800"
                          onClick={() => toggleSort("count")}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>Mentions</span>
                            <SlidersHorizontal className="h-3 w-3 text-zinc-400" />
                          </div>
                        </th>
                        <th className="py-2.5 px-4 text-right w-24">Share</th>
                        <th className="py-2.5 px-4 w-40 sm:w-56">Relative Prevalence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {displayedTopics.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                            No matching topics found for &ldquo;{searchTerm}&rdquo;.
                          </td>
                        </tr>
                      ) : (
                        displayedTopics.map((t, idx) => {
                          const pct =
                            totalMentions > 0 ? (t.count / totalMentions) * 100 : 0;
                          const barWidth =
                            maxCount > 0 ? Math.max(4, (t.count / maxCount) * 100) : 0;

                          const isTop3 = idx < 3 && sortField === "count" && sortOrder === "desc";

                          return (
                            <tr
                              key={t.keyword}
                              className={`transition-colors hover:bg-zinc-50/70 ${
                                selectedKeyword?.toLowerCase() === t.keyword.toLowerCase()
                                  ? "bg-forest-moss-50/60 font-medium"
                                  : ""
                              }`}
                            >
                              {/* Serial Number (Sn) */}
                              <td className="py-3 px-3 text-center text-xs font-semibold tabular-nums text-zinc-400">
                                {isTop3 ? (
                                  <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                                      idx === 0
                                        ? "bg-amber-100 text-amber-800"
                                        : idx === 1
                                        ? "bg-slate-200 text-slate-700"
                                        : "bg-amber-700/15 text-amber-900"
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                ) : (
                                  idx + 1
                                )}
                              </td>

                              {/* Topic Keyword */}
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedKeyword((prev) =>
                                      prev?.toLowerCase() === t.keyword.toLowerCase()
                                        ? null
                                        : t.keyword,
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 text-left font-semibold text-zinc-900 hover:text-forest-moss-700 transition-colors"
                                >
                                  <Tag className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                  <span className="capitalize">{t.keyword}</span>
                                  {isTop3 && (
                                    <span className="inline-flex items-center gap-0.5 rounded-md bg-forest-moss-50 px-1.5 py-0.5 text-[10px] font-bold text-forest-moss-700">
                                      <Flame className="h-3 w-3 text-forest-moss-600" />
                                      Top {idx + 1}
                                    </span>
                                  )}
                                </button>
                              </td>

                              {/* Mentions / Count */}
                              <td className="py-3 px-4 text-right font-bold text-zinc-900 tabular-nums">
                                {fmtNum(t.count)}
                              </td>

                              {/* Discussion Share % */}
                              <td className="py-3 px-4 text-right text-xs font-semibold text-zinc-600 tabular-nums">
                                {pct.toFixed(1)}%
                              </td>

                              {/* Relative Prevalence Bar */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isTop3 ? "bg-forest-moss-500" : "bg-teal-500/80"
                                      }`}
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                {displayedTopics.length < filteredTopics.length && (
                  <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-4 py-2.5 text-xs text-zinc-500">
                    <span>
                      Showing {displayedTopics.length} of {filteredTopics.length} topics
                    </span>
                    <button
                      type="button"
                      onClick={() => setLimit(0)}
                      className="font-semibold text-forest-moss-700 hover:underline"
                    >
                      View all ({filteredTopics.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
