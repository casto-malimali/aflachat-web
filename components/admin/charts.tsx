"use client";

// MUI X Charts wrappers for the admin dashboard. Thin adapters that keep the
// same prop shape callers already use (`data`/`series` for LineChart, `items`
// for BarList, `segments` for Donut) so app/admin/page.tsx didn't need to
// change when this moved off the old dependency-free SVG charts. Colors come
// from the forest-moss/espresso brand theme via MuiThemeRegistry.

import { LineChart as MuiLineChart } from "@mui/x-charts/LineChart";
import { BarChart as MuiBarChart } from "@mui/x-charts/BarChart";
import { PieChart as MuiPieChart } from "@mui/x-charts/PieChart";

type Series = { key: string; label: string; color: string };
type Row = { label: string;[key: string]: number | string };

/** Multi-series area + line chart (e.g. sessions & messages over time). */
export function LineChart({
  data,
  series,
  height = 260,
}: {
  data: Row[];
  series: Series[];
  height?: number;
}) {
  const total = data.reduce((sum, row) => sum + series.reduce((s, item) => s + Number(row[item.key] ?? 0), 0), 0);
  if (!data.length || total === 0) return <Empty height={height} />;

  return (
    <MuiLineChart
      height={height}
      dataset={data}
      xAxis={[{ scaleType: "point", dataKey: "label", tickLabelStyle: { fontSize: 10 } }]}
      yAxis={[{ tickLabelStyle: { fontSize: 10 } }]}
      series={series.map((s) => ({
        dataKey: s.key,
        label: s.label,
        color: s.color,
        area: true,
        showMark: data.length <= 40,
        curve: "monotoneX",
      }))}
      grid={{ horizontal: true }}
      margin={{ top: 10, bottom: 30, left: 36, right: 8 }}
      slotProps={{ legend: { direction: "horizontal", position: { vertical: "bottom", horizontal: "center" } } }}
    />
  );
}

/** Horizontal bar list — topics, languages, etc. */
export function BarList({
  items,
  emptyLabel = "No data yet",
}: {
  items: { label: string; value: number; color?: string }[];
  emptyLabel?: string;
}) {
  if (!items.length || items.every((item) => item.value === 0)) return <Empty height={Math.max(160, items.length * 42)} label={emptyLabel} />;

  return (
    <MuiBarChart
      layout="horizontal"
      height={Math.max(120, items.length * 42)}
      dataset={items}
      yAxis={[{ scaleType: "band", dataKey: "label", tickLabelStyle: { fontSize: 11 } }]}
      xAxis={[{ tickLabelStyle: { fontSize: 10 } }]}
      series={[{ dataKey: "value", color: items[0]?.color ?? "#66b710" }]}
      grid={{ vertical: true }}
      margin={{ top: 8, bottom: 24, left: 100, right: 16 }}
      hideLegend
    />
  );
}

/** Donut chart with legend — platform / source split. */
export function Donut({
  segments,
  size = 220,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return <Empty height={size} label="No traffic recorded yet" />;

  return (
    <MuiPieChart
      height={size}
      series={[
        {
          data: segments.map((s, i) => ({ id: i, value: s.value, label: s.label, color: s.color })),
          innerRadius: size * 0.32,
          outerRadius: size * 0.46,
          paddingAngle: total > 0 ? 2 : 0,
          cornerRadius: 3,
        },
      ]}
      margin={{ top: 10, bottom: 10, left: 10, right: 140 }}
      slotProps={{ legend: { direction: "vertical", position: { vertical: "middle", horizontal: "end" } } }}
    />
  );
}

function Empty({ height, label = "No activity in this range" }: { height: number; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center" style={{ height }}>
      <span className="mb-2 h-2 w-2 rounded-full bg-forest-moss-400" />
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-400">Data will appear here as people use AflaChat.</p>
    </div>
  );
}
