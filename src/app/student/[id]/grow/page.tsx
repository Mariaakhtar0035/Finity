"use client";

import { useParams } from "next/navigation";
import { Lock, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Coin } from "@/components/ui/Coin";
import { PageHeader } from "@/components/ui/PageHeader";
import { SproutDoodle } from "@/components/ui/Doodles";
import { GROW_LOCK_WEEKS, getGrowLocks, getInterestEarned, getStudent } from "@/lib/store";
import { useStore } from "@/lib/useStore";
import { getProjections, getGrowthPercentage } from "@/lib/growthCalculator";

export default function GrowTokensPage() {
  const params = useParams();
  const studentId = params.id as string;
  useStore();

  const student = getStudent(studentId);
  if (!student) return null;

  const now = student.growTokens;
  const interestEarned = getInterestEarned(studentId);
  const locks = getGrowLocks(student);
  const lockedNow = locks.reduce((sum, l) => sum + l.amount, 0);
  const projections = getProjections(now);
  const max = Math.max(projections.oneYear, 1);

  const rows = [
    { label: "Today", value: now, shade: "#d8f0e1" },
    { label: "In 1 month", value: projections.oneMonth, shade: "#aee2c2" },
    { label: "In 6 months", value: projections.sixMonths, shade: "#7fd0a1" },
    { label: "In 1 year", value: projections.oneYear, shade: "#4fb87f" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Grow"
        title="Watch your tokens grow"
        description={`Every week, your Grow tokens get a little bigger: 2 more for every 100 you have. Tokens you put in stay for ${GROW_LOCK_WEEKS} weeks. The longer you wait, the more you get.`}
      />

      {/* Balance */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[1fr_auto]">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Coin type="grow" size={40} />
              <div>
                <p className="text-sm text-muted">Grow balance</p>
                <p className="display text-5xl num">{now}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-mint-soft text-sm">
                <TrendingUp className="w-4 h-4" /> +2 for every 100, each week
              </span>
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-paper text-sm text-ink-soft">
                <Lock className="w-3.5 h-3.5" />
                {lockedNow > 0 ? (
                  <span className="num">
                    {lockedNow} locked · next unlocks week {locks[0].untilWeek}
                  </span>
                ) : (
                  `New tokens stay ${GROW_LOCK_WEEKS} weeks`
                )}
              </span>
              {interestEarned > 0 && (
                <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-paper text-sm text-ink-soft num">
                  {interestEarned} extra tokens earned so far (that&apos;s called interest)
                </span>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-end justify-center bg-mint-soft px-14 pt-6">
            <SproutDoodle className="w-32 h-auto" />
          </div>
        </div>
      </Card>

      {/* Projections */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "1 month", value: projections.oneMonth },
          { label: "6 months", value: projections.sixMonths },
          { label: "1 year", value: projections.oneYear },
        ].map((p) => (
          <Card key={p.label} className="p-6">
            <p className="text-sm text-muted">In {p.label}</p>
            <p className="display text-5xl num mt-2">{p.value}</p>
            <p className="text-sm mt-3">
              <span className="text-positive font-medium num">+{p.value - now} tokens</span>
              <span className="text-muted num"> · {getGrowthPercentage(now, p.value)}% more</span>
            </p>
          </Card>
        ))}
      </div>

      {/* Growth bars */}
      <Card className="p-6 md:p-8">
        <h2 className="font-display text-2xl tracking-tight">Watch it grow</h2>
        <p className="text-muted mt-1 text-[15px]">
          Your tokens earn tokens. Then those new tokens earn tokens too! That&apos;s called compound growth.
        </p>
        <div className="space-y-5 mt-8">
          {rows.map((r, i) => (
            <div key={r.label} className="grid grid-cols-[96px_1fr_56px] items-center gap-4">
              <span className="text-sm text-ink-soft">{r.label}</span>
              <div className="h-8 rounded-full bg-paper overflow-hidden">
                <div
                  className="h-full rounded-full border-[1.5px] border-ink bar-grow"
                  style={{
                    width: `${Math.max((r.value / max) * 100, 4)}%`,
                    background: r.shade,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              </div>
              <span className="font-display text-xl num text-right">{r.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
