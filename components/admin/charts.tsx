"use client";

// Tiny dependency-free SVG charts. Responsive via viewBox; all sizing is
// relative so they fill their container. Intentionally minimal — enough for an
// internal analytics dashboard without pulling in a charting library.

import { useId } from "react";

type Series = { key: string; label: string; color: string };
type Row = { label: string; [key: string]: number | string };

const numAt = (row: Row, key: string): number => Number(row[key] ?? 0);

/** Multi-series area + line chart (e.g. sessions & messages over time). */
export function LineChart({
  data,
  series,
  height = 220,
}: {
  data: Row[];
  series: Series[];
  height?: number;
}) {
  const uid = useId();
  const W = 760;
  const H = height;
  const padL = 36;
  const padB = 22;
  const padT = 10;
  const padR = 8;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => numAt(d, s.key))));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const x = (i: number) => padL + i * stepX;
  const y = (v: number) => padT + innerH - (v / max) * innerH;

  // ~6 evenly spaced x labels
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  if (!data.length) return <Empty height={H} />;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" preserveAspectRatio="none">
      {/* horizontal gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padL}
          x2={W - padR}
          y1={padT + innerH * t}
          y2={padT + innerH * t}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {[0, 0.5, 1].map((t) => (
        <text key={t} x={padL - 6} y={padT + innerH * t + 3} textAnchor="end" fontSize={9} fill="#9ca3af">
          {Math.round(max * (1 - t))}
        </text>
      ))}

      {series.map((s) => {
        const pts = data.map((d, i) => `${x(i)},${y(numAt(d, s.key))}`).join(" ");
        const area = `M ${x(0)},${padT + innerH} L ${pts.replaceAll(" ", " L ")} L ${x(data.length - 1)},${padT + innerH} Z`;
        const gid = `${uid}-${s.key}`;
        return (
          <g key={s.key}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gid})`} />
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      })}

      {data.map((d, i) =>
        i % labelEvery === 0 ? (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">
            {d.label}
          </text>
        ) : null,
      )}
    </svg>
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
  if (!items.length) return <p className="text-sm text-gray-400 py-6 text-center">{emptyLabel}</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-gray-600" title={it.label}>
            {it.label}
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(it.value / max) * 100}%`, background: it.color ?? "#10b981" }}
            />
          </div>
          <span className="w-10 shrink-0 text-right tabular-nums text-gray-500">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Donut chart with legend — platform / source split. */
export function Donut({
  segments,
  size = 160,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" width={size} height={size} className="shrink-0">
        <g transform="rotate(-90 70 70)">
          <circle cx={70} cy={70} r={r} fill="none" stroke="#f1f1ee" strokeWidth={18} />
          {total > 0 &&
            segments.map((s) => {
              const len = (s.value / total) * c;
              const el = (
                <circle
                  key={s.label}
                  cx={70}
                  cy={70}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={18}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
        </g>
        <text x={70} y={66} textAnchor="middle" fontSize={22} fontWeight={700} fill="#111827">
          {total}
        </text>
        <text x={70} y={84} textAnchor="middle" fontSize={10} fill="#9ca3af">
          total
        </text>
      </svg>
      <ul className="flex flex-col gap-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-gray-600">{s.label}</span>
            <span className="ml-auto tabular-nums text-gray-400">
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-gray-400"
      style={{ height }}
    >
      No data in range yet
    </div>
  );
}
