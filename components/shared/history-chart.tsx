"use client";

import { useEffect, useState } from "react";
import { Card } from "./card";

interface HistoryPoint {
  time: string;
  players: number;
  maxPlayers: number;
  isAlive: boolean;
  latencyMs?: number;
  cpuUsage?: number;
  memUsage?: number;
}

const RANGES = [
  { value: "-1h", label: "1H" },
  { value: "-6h", label: "6H" },
  { value: "-24h", label: "24H" },
  { value: "-7d", label: "7D" },
  { value: "-30d", label: "30D" },
];

export function HistoryChart({
  serverId,
  showSystem = false,
}: {
  serverId: string;
  /** Show System (CPU/MEM) tab. Only for admin pages. */
  showSystem?: boolean;
}) {
  const [range, setRange] = useState("-24h");
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"players" | "system">("players");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/servers/${serverId}/history?range=${range}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setData(d))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [serverId, range]);

  if (loading && data.length === 0) {
    return (
      <Card title="History">
        <div className="flex h-48 items-center justify-center text-sm text-muted">
          Loading...
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return null; // No InfluxDB data — hide section
  }

  return (
    <Card>
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <TabBtn active={tab === "players"} onClick={() => setTab("players")}>
            Players
          </TabBtn>
          {showSystem && (
            <TabBtn active={tab === "system"} onClick={() => setTab("system")}>
              System
            </TabBtn>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                range === r.value
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {tab === "players" ? (
        <LineChart
          data={data}
          lines={[
            {
              key: "players",
              getValue: (p) => p.players,
              color: "#f97316",
              label: "Players",
            },
          ]}
          maxLine={(p) => p.maxPlayers}
        />
      ) : (
        <LineChart
          data={data}
          lines={[
            {
              key: "cpu",
              getValue: (p) => p.cpuUsage ?? 0,
              color: "#3b82f6",
              label: "CPU %",
            },
            {
              key: "mem",
              getValue: (p) => p.memUsage ?? 0,
              color: "#22c55e",
              label: "MEM %",
            },
          ]}
          fixedMax={100}
        />
      )}

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
        {tab === "players" ? (
          <>
            <LegendItem color="#f97316" label="Players" />
            <LegendItem color="#64748b" label="Max" dashed />
          </>
        ) : (
          <>
            <LegendItem color="#3b82f6" label="CPU" />
            <LegendItem color="#22c55e" label="Memory" />
          </>
        )}
        {/* Uptime indicator */}
        <span className="ml-auto">
          Uptime:{" "}
          <span className="text-green">
            {(
              (data.filter((p) => p.isAlive).length / data.length) *
              100
            ).toFixed(1)}
            %
          </span>
        </span>
      </div>
    </Card>
  );
}

// ─── SVG Line Chart ─────────────────────────────────────────────────

interface LineDef {
  key: string;
  getValue: (p: HistoryPoint) => number;
  color: string;
  label: string;
}

function LineChart({
  data,
  lines,
  maxLine,
  fixedMax,
}: {
  data: HistoryPoint[];
  lines: LineDef[];
  maxLine?: (p: HistoryPoint) => number;
  fixedMax?: number;
}) {
  const W = 800;
  const H = 200;
  const PAD = { top: 10, right: 10, bottom: 24, left: 40 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  // Compute max Y
  let yMax = fixedMax ?? 0;
  if (!fixedMax) {
    for (const p of data) {
      for (const l of lines) {
        yMax = Math.max(yMax, l.getValue(p));
      }
      if (maxLine) yMax = Math.max(yMax, maxLine(p));
    }
    yMax = Math.max(yMax, 1);
    yMax = Math.ceil(yMax * 1.1); // 10% headroom
  }

  const xScale = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * cw;
  const yScale = (v: number) => PAD.top + ch - (v / yMax) * ch;

  // Time labels
  const timeLabels: { x: number; label: string }[] = [];
  const step = Math.max(1, Math.floor(data.length / 5));
  for (let i = 0; i < data.length; i += step) {
    const d = new Date(data[i].time);
    const label =
      data.length > 200
        ? `${d.getMonth() + 1}/${d.getDate()}`
        : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    timeLabels.push({ x: xScale(i), label });
  }

  // Y axis labels
  const yLabels: { y: number; label: string }[] = [];
  const yStep = yMax <= 10 ? 1 : Math.ceil(yMax / 5);
  for (let v = 0; v <= yMax; v += yStep) {
    yLabels.push({ y: yScale(v), label: String(v) });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      {/* Grid */}
      {yLabels.map((yl) => (
        <g key={yl.label}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yl.y}
            y2={yl.y}
            stroke="#1e293b"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 6}
            y={yl.y + 3}
            textAnchor="end"
            fill="#64748b"
            fontSize={10}
          >
            {yl.label}
          </text>
        </g>
      ))}

      {/* Time labels */}
      {timeLabels.map((tl, i) => (
        <text
          key={i}
          x={tl.x}
          y={H - 4}
          textAnchor="middle"
          fill="#64748b"
          fontSize={10}
        >
          {tl.label}
        </text>
      ))}

      {/* Max line (dashed) */}
      {maxLine && data.length > 0 && (
        <polyline
          fill="none"
          stroke="#64748b"
          strokeWidth={1}
          strokeDasharray="4 4"
          points={data.map((p, i) => `${xScale(i)},${yScale(maxLine(p))}`).join(" ")}
        />
      )}

      {/* Data lines */}
      {lines.map((l) => (
        <polyline
          key={l.key}
          fill="none"
          stroke={l.color}
          strokeWidth={2}
          strokeLinejoin="round"
          points={data.map((p, i) => `${xScale(i)},${yScale(l.getValue(p))}`).join(" ")}
        />
      ))}

      {/* Offline regions (red bars at bottom) */}
      {data.map((p, i) =>
        !p.isAlive ? (
          <rect
            key={`off-${i}`}
            x={xScale(i) - cw / data.length / 2}
            y={H - PAD.bottom}
            width={Math.max(cw / data.length, 2)}
            height={3}
            fill="#ef4444"
            opacity={0.6}
          />
        ) : null,
      )}
    </svg>
  );
}

// ─── Small components ─────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-accent/20 text-accent"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function LegendItem({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-4"
        style={{
          background: color,
          ...(dashed
            ? {
                backgroundImage: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 6px)`,
                background: "none",
                backgroundRepeat: "repeat-x",
                backgroundSize: "6px 2px",
              }
            : {}),
        }}
      />
      {label}
    </span>
  );
}
