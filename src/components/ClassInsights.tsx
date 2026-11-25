"use client";

import React, { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, SectionHeading } from "@/components/ui/Card";
import { TOKEN_META, TokenType } from "@/components/ui/Coin";
import { StudentAvatar } from "@/components/StudentAvatar";
import { getClassHistory, getClassInterestPaid } from "@/lib/store";
import { RECOMMENDED_GROW_RATIO, RECOMMENDED_SAVE_RATIO, RECOMMENDED_SPEND_RATIO } from "@/lib/constants";
import type { Student } from "@/types";

const TYPES: TokenType[] = ["spend", "save", "grow"];
const AXIS = { fontFamily: "var(--font-jost), sans-serif", fontSize: 12, fill: "#9a9892" };
const GUIDE: Record<TokenType, number> = {
  spend: RECOMMENDED_SPEND_RATIO,
  save: RECOMMENDED_SAVE_RATIO,
  grow: RECOMMENDED_GROW_RATIO,
};

type Habit = { label: string; className: string };
function habitFor(savingRate: number): Habit {
  if (savingRate >= 0.5) return { label: "Saver", className: "bg-mint-soft" };
  if (savingRate >= 0.35) return { label: "Balanced", className: "bg-periwinkle-soft" };
  return { label: "Spender", className: "bg-peach-soft" };
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** 100% stacked bar with a 2px gap between segments and labels inside wide-enough segments */
function SplitBar({ shares, height = "h-10" }: { shares: Record<TokenType, number>; height?: string }) {
  return (
    <div className={`flex gap-0.5 ${height} rounded-xl overflow-hidden`}>
      {TYPES.map((t) => (
        <div
          key={t}
          className="flex items-center px-3 min-w-0 bar-grow"
          style={{ width: `${shares[t] * 100}%`, background: TOKEN_META[t].chart }}
          title={`${TOKEN_META[t].label} ${pct(shares[t])}`}
        >
          {shares[t] >= 0.12 && (
            <span className="text-sm font-medium text-ink truncate num">
              <span className="hidden sm:inline">{TOKEN_META[t].label} </span>
              {pct(shares[t])}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
      {TYPES.map((t) => (
        <span key={t} className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: TOKEN_META[t].chart }} />
          {TOKEN_META[t].label}
        </span>
      ))}
    </div>
  );
}

export function ClassInsights({ students }: { students: Student[] }) {
  const history = getClassHistory();
  const interestPaid = getClassInterestPaid();

  const totals = useMemo(() => {
    const spend = students.reduce((s, x) => s + x.spendTokens, 0);
    const save = students.reduce((s, x) => s + x.saveTokens, 0);
    const grow = students.reduce((s, x) => s + x.growTokens, 0);
    return { spend, save, grow, all: spend + save + grow };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, history]);

  const share: Record<TokenType, number> = {
    spend: totals.all ? totals.spend / totals.all : 0,
    save: totals.all ? totals.save / totals.all : 0,
    grow: totals.all ? totals.grow / totals.all : 0,
  };
  const classSavingRate = share.save + share.grow;
  const guideSavingRate = GUIDE.save + GUIDE.grow;
  const rewardsBought = students.reduce((s, x) => s + x.purchasedRewards.length, 0);

  const rows = students
    .map((s) => {
      const total = s.spendTokens + s.saveTokens + s.growTokens;
      const rate = total ? (s.saveTokens + s.growTokens) / total : 0;
      return {
        student: s,
        total,
        rate,
        shares: {
          spend: total ? s.spendTokens / total : 0,
          save: total ? s.saveTokens / total : 0,
          grow: total ? s.growTokens / total : 0,
        } as Record<TokenType, number>,
      };
    })
    .sort((a, b) => b.rate - a.rate);

  const chartData = history.map((h) => ({
    week: h.week,
    spend: h.spendBalance,
    save: h.saveBalance,
    grow: h.growBalance,
  }));

  const diff = Math.round((classSavingRate - guideSavingRate) * 100);

  return (
    <div className="space-y-6">
      {/* Headline numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tokens in the class", value: totals.all.toLocaleString() },
          { label: "Kept in Save + Grow", value: pct(classSavingRate) },
          { label: "Interest paid out", value: interestPaid.toLocaleString() },
          { label: "Rewards bought", value: rewardsBought },
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-sm text-muted">{k.label}</p>
            <p className="display text-4xl num mt-2">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Takeaway */}
      <Card className="p-6 md:p-8 bg-butter-soft! border-[#efe3ae]!">
        <p className="font-display text-2xl md:text-3xl tracking-tight leading-snug max-w-3xl">
          Your class keeps <span className="num">{pct(classSavingRate)}</span> of its tokens in Save and Grow.{" "}
          {diff >= 0
            ? `That's ${diff === 0 ? "right on" : `${diff} points above`} the ${pct(guideSavingRate)} guideline.`
            : `That's ${Math.abs(diff)} points below the ${pct(guideSavingRate)} guideline.`}
        </p>
        <p className="text-ink-soft mt-3">
          {diff >= 0
            ? "Great habits. Try a class event or a pricey reward to test their patience."
            : "A quick lesson on compound interest, or a week of bonus Grow interest, could nudge them toward saving."}
        </p>
      </Card>

      {/* Over time */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <SectionHeading title="Class balances over time" description="Every student's tokens added together, week by week." />
          <Legend />
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#ece9e3" vertical={false} />
              <XAxis dataKey="week" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `Wk ${v}`} dy={8} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
              <Tooltip
                cursor={{ stroke: "#141414", strokeOpacity: 0.25 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as { spend: number; save: number; grow: number };
                  return (
                    <div className="px-4 py-3 rounded-2xl bg-surface shadow-lift border border-line text-sm min-w-40">
                      <p className="font-medium mb-2">Week {label}</p>
                      {TYPES.map((t) => (
                        <p key={t} className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-ink-soft">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: TOKEN_META[t].chart }} />
                            {TOKEN_META[t].label}
                          </span>
                          <span className="num">{row[t].toLocaleString()}</span>
                        </p>
                      ))}
                      <p className="flex justify-between gap-4 mt-2 pt-2 border-t border-line">
                        <span className="text-muted">Total</span>
                        <span className="num font-medium">{(row.spend + row.save + row.grow).toLocaleString()}</span>
                      </p>
                    </div>
                  );
                }}
              />
              {/* Grow at the base, then Save, then Spend; white strokes give a 2px gap between bands */}
              {(["grow", "save", "spend"] as TokenType[]).map((t) => (
                <Area
                  key={t}
                  type="monotone"
                  dataKey={t}
                  name={TOKEN_META[t].label}
                  stackId="class"
                  stroke="#fff"
                  strokeWidth={2}
                  fill={TOKEN_META[t].chart}
                  fillOpacity={1}
                  activeDot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Split vs guideline */}
      <Card className="p-6 md:p-8">
        <SectionHeading title="How the class splits its tokens" description="Compared with the 50 / 20 / 30 Spend, Save, Grow guideline." className="mb-4" />
        <div className="sm:hidden mb-5">
          <Legend />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium">Your class</span>
            <SplitBar shares={share} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] sm:items-center gap-2 sm:gap-4">
            <span className="text-sm text-muted">Guideline</span>
            <SplitBar shares={GUIDE} />
          </div>
        </div>
      </Card>

      {/* Per-student table (also the accessible table view of the data) */}
      <Card className="p-6 md:p-8">
        <SectionHeading title="Saving habits" description="Sorted by how much of their tokens each student keeps in Save and Grow." className="mb-4" />
        <div className="overflow-x-auto -mx-6 md:-mx-8">
          <table className="w-full text-[15px] min-w-[620px]">
            <thead>
              <tr className="border-b border-line text-sm text-muted text-left">
                <th className="font-normal py-3 pl-6 md:pl-8 pr-3">Student</th>
                <th className="font-normal py-3 px-3 text-right">Tokens</th>
                <th className="font-normal py-3 px-3 w-[34%]">Spend / Save / Grow</th>
                <th className="font-normal py-3 px-3 text-right">Saving rate</th>
                <th className="font-normal py-3 pl-3 pr-6 md:pr-8">Habit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ student, total, rate, shares }) => {
                const habit = habitFor(rate);
                return (
                  <tr key={student.id} className="hover:bg-paper/50">
                    <td className="py-3 pl-6 md:pl-8 pr-3">
                      <span className="flex items-center gap-3">
                        <StudentAvatar studentId={student.id} studentName={student.name} size="xs" />
                        <span className="font-medium">{student.name}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right num">{total}</td>
                    <td className="py-3 px-3">
                      <div
                        className="flex gap-0.5 h-2.5 rounded-full overflow-hidden"
                        aria-label={`Spend ${pct(shares.spend)}, Save ${pct(shares.save)}, Grow ${pct(shares.grow)}`}
                        title={`Spend ${pct(shares.spend)} · Save ${pct(shares.save)} · Grow ${pct(shares.grow)}`}
                      >
                        {TYPES.map((t) => (
                          <div key={t} style={{ width: `${shares[t] * 100}%`, background: TOKEN_META[t].chart }} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right num font-medium">{pct(rate)}</td>
                    <td className="py-3 pl-3 pr-6 md:pr-8">
                      <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium ${habit.className}`}>
                        {habit.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-4">
          Saver: 50%+ in Save and Grow · Balanced: 35–49% · Spender: under 35%
        </p>
      </Card>
    </div>
  );
}
