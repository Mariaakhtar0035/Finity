"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Segmented } from "@/components/ui/Feedback";
import { TOKEN_META } from "@/components/ui/Coin";
import type { BalanceHistoryEntry } from "@/types";

interface GrowthComparisonChartProps {
  history: BalanceHistoryEntry[];
  whatIfGrow: number[];
}

const SERIES = [
  { key: "spend", label: "Spend", color: TOKEN_META.spend.chart, type: "linear" as const },
  { key: "save", label: "Save", color: TOKEN_META.save.chart, type: "monotone" as const },
  { key: "grow", label: "Grow", color: TOKEN_META.grow.chart, type: "monotone" as const },
];

const AXIS_STYLE = { fontFamily: "var(--font-jost), sans-serif", fontSize: 12, fill: "#9a9892" };

/**
 * Spend / Save / Grow balance history.
 * "If I put it all in Grow" overlays a dashed line computed by computeWhatIfGrow(),
 * simulating 100% of earnings going to Grow with the same weekly timing.
 */
export function GrowthComparisonChart({ history, whatIfGrow }: GrowthComparisonChartProps) {
  const [mode, setMode] = useState<"real" | "whatif">("real");
  const showWhatIf = mode === "whatif";

  const chartData = history.map((h, i) => ({
    week: h.week,
    spend: h.spendBalance,
    save: h.saveBalance,
    grow: h.growBalance,
    whatIf: whatIfGrow[i] ?? 0,
  }));

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Your money story</h2>
          <p className="text-muted mt-1 text-[15px]">
            {showWhatIf
              ? "The dashed line shows what you'd have if you put every token in Grow."
              : "How your tokens changed each week."}
          </p>
        </div>
        <Segmented
          ariaLabel="Chart view"
          value={mode}
          onChange={setMode}
          options={[
            { value: "real", label: "My history" },
            { value: "whatif", label: "If I put it all in Grow" },
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-sm text-ink-soft">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        {showWhatIf && (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 border-t-2 border-dashed" style={{ borderColor: "#141414" }} />
            What if
          </span>
        )}
      </div>

      <div className="h-70 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#ece9e3" vertical={false} />
            <XAxis
              dataKey="week"
              tick={AXIS_STYLE}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `Wk ${v}`}
              dy={8}
            />
            <YAxis
              tick={AXIS_STYLE}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
            />
            <Tooltip
              cursor={{ stroke: "#d5d2ca" }}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #e6e4de",
                boxShadow: "0 18px 40px -16px rgba(20,20,20,0.22)",
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: 14,
              }}
              labelFormatter={(label) => `Week ${label}`}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type={s.type}
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                connectNulls
              />
            ))}
            {showWhatIf && (
              <Line
                type="monotone"
                dataKey="whatIf"
                name="What if"
                stroke="#141414"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
