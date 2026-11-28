"use client";

import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import type { Mission } from "@/types";

const MAX_MISSIONS = 8;
const TITLE_LENGTH = 17;
const ROW_HEIGHT = 44;
const AXIS_STYLE = { fontFamily: "var(--font-jost), sans-serif", fontSize: 12, fill: "#9a9892" };

interface MarketSupplyDemandChartProps {
  missions: Mission[];
}

function truncate(s: string, len: number): string {
  if (s.length <= len) return s;
  return s.slice(0, len).trim() + "…";
}

export function MarketSupplyDemandChart({ missions }: MarketSupplyDemandChartProps) {
  const chartData = useMemo(() => {
    const sorted = [...missions].sort((a, b) => b.requestCount - a.requestCount);
    return sorted.slice(0, MAX_MISSIONS).map((m) => ({
      name: truncate(m.title, TITLE_LENGTH),
      fullTitle: m.title,
      baseReward: m.baseReward,
      currentReward: m.currentReward,
      requestCount: m.requestCount,
    }));
  }, [missions]);

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Full price vs. today</h2>
          <p className="text-muted mt-1 text-[15px]">The missions kids want most, and what they pay now.</p>
        </div>
        <div className="flex gap-5 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-paper-deep" /> Full price
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-peach-deep" /> Current price
          </span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-muted text-center py-16">Ask for some missions to see prices change.</p>
      ) : (
        <div className="w-full" style={{ height: chartData.length * ROW_HEIGHT + 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="22%"
              barGap={2}
            >
              <CartesianGrid stroke="#ece9e3" horizontal={false} />
              <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={128}
                tick={(props) => {
                  // Render our own label so recharts doesn't wrap names onto two lines
                  const { x, y, payload } = props as { x: number; y: number; payload: { value: string } };
                  return (
                    <text x={x - 8} y={y} dy={4} textAnchor="end" style={{ ...AXIS_STYLE, fill: "#2b2b2b" }}>
                      {payload.value}
                    </text>
                  );
                }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "rgba(20,20,20,0.03)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0]?.payload as
                    | { fullTitle?: string; baseReward?: number; currentReward?: number; requestCount?: number }
                    | undefined;
                  if (!p) return null;
                  return (
                    <div className="px-4 py-3 rounded-2xl bg-surface shadow-lift border border-line text-sm">
                      <p className="font-medium mb-1">{p.fullTitle}</p>
                      <p className="text-muted num">
                        {p.currentReward} now · {p.baseReward} full price
                      </p>
                      <p className="text-muted num">
                        {p.requestCount} request{p.requestCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="baseReward" name="Full price" fill="#e9e7e1" radius={[0, 6, 6, 0]} isAnimationActive={false} />
              <Bar dataKey="currentReward" name="Current price" fill="#e2a55c" radius={[0, 6, 6, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
