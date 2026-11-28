"use client";

import React, { useMemo, useState } from "react";
import { ArrowDownRight } from "lucide-react";
import { Mission } from "@/types";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { Coin } from "@/components/ui/Coin";
import { MarketSupplyDemandChart } from "@/components/MarketSupplyDemandChart";

const MISSION_SUGGESTION_FALLBACK =
  "Pick a mission few others want and you'll get the full reward! Or try a popular one if you like a challenge.";

interface MissionStats {
  mission: Mission;
  priceDropPercent: number;
  priceChange: number;
}

interface MarketLeaderboardProps {
  missions: Mission[];
  studentId?: string;
  studentName?: string;
}

function RankRow({ rank, title, subtitle, right }: { rank: number; title: string; subtitle: React.ReactNode; right: React.ReactNode }) {
  return (
    <li className="flex items-center gap-4 py-4">
      <span className="w-8 h-8 rounded-full bg-paper font-display flex items-center justify-center num shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        <div className="text-sm text-muted truncate">{subtitle}</div>
      </div>
      <div className="text-right shrink-0">{right}</div>
    </li>
  );
}

export function MarketLeaderboard({ missions, studentName }: MarketLeaderboardProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const missionStats: MissionStats[] = useMemo(
    () =>
      missions.map((mission) => {
        const priceChange = mission.baseReward - mission.currentReward;
        const priceDropPercent = mission.baseReward > 0 ? (priceChange / mission.baseReward) * 100 : 0;
        return { mission, priceDropPercent, priceChange };
      }),
    [missions],
  );

  const sortedByDemand = useMemo(
    () => [...missionStats].sort((a, b) => b.mission.requestCount - a.mission.requestCount),
    [missionStats],
  );
  const sortedByDrop = useMemo(
    () => [...missionStats].filter((s) => s.priceChange > 0).sort((a, b) => b.priceDropPercent - a.priceDropPercent),
    [missionStats],
  );

  // Available missions (not assigned) for suggestion context
  const { availableMissions, bestValue, popular } = useMemo(() => {
    const available = missions.filter((m) => !m.assignedStudentId);
    const best = [...available].sort((a, b) => b.baseReward - a.baseReward).slice(0, 5);
    const pop = [...available].sort((a, b) => b.requestCount - a.requestCount).slice(0, 5);
    return {
      availableMissions: available.map((m) => ({
        title: m.title,
        baseReward: m.baseReward,
        currentReward: m.currentReward,
        requestCount: m.requestCount,
      })),
      bestValue: best.filter((m) => m.requestCount === 0).map((m) => ({ title: m.title, baseReward: m.baseReward })),
      popular: pop
        .filter((m) => m.requestCount > 0)
        .map((m) => ({ title: m.title, currentReward: m.currentReward, requestCount: m.requestCount })),
    };
  }, [missions]);

  const handleAskSuggestion = () => {
    if (!studentName) return;
    setSuggestion(null);
    setLoadingSuggestion(true);
    fetch("/api/gemini/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "MISSION_SUGGESTION",
        studentName,
        context: { availableMissions, bestValue, popular },
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => setSuggestion(data.explanation ?? MISSION_SUGGESTION_FALLBACK))
      .catch(() => setSuggestion(MISSION_SUGGESTION_FALLBACK))
      .finally(() => setLoadingSuggestion(false));
  };

  const stats = useMemo(() => {
    const requestedMissions = missions.filter((m) => m.requestCount > 0).length;
    const totalRequests = missions.reduce((sum, m) => sum + m.requestCount, 0);
    return {
      requestedMissions,
      totalRequests,
      avg: requestedMissions > 0 ? totalRequests / requestedMissions : 0,
      hottest: sortedByDemand[0]?.mission.requestCount ? sortedByDemand[0].mission.title : "—",
    };
  }, [missions, sortedByDemand]);

  const topDemand = sortedByDemand.filter((s) => s.mission.requestCount > 0).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Explainer */}
      <Card className="p-6 md:p-8 bg-peach-soft! border-[#f3dcbc]!">
        <div className="md:flex md:items-start md:justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl tracking-tight">Why some missions pay less</h2>
            <p className="text-ink-soft mt-2 leading-relaxed">
              Only one kid can do each mission. When lots of kids ask for the same one, it pays a little less
              each time. Missions nobody else wants keep their full reward. Grown-ups call this supply and demand.
            </p>
          </div>
          {studentName && (
            <Button variant="secondary" onClick={handleAskSuggestion} className="mt-4 md:mt-0 shrink-0 bg-surface!">
              Which mission should I pick?
            </Button>
          )}
        </div>
        {(loadingSuggestion || suggestion) && (
          <Callout loading={loadingSuggestion} className="mt-5 bg-surface!">
            {suggestion}
          </Callout>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Missions kids want", value: stats.requestedMissions },
          { label: "Times kids asked", value: stats.totalRequests },
          { label: "Asks per mission", value: stats.avg.toFixed(1) },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="display text-4xl num mt-2">{s.value}</p>
          </Card>
        ))}
        <Card className="p-5">
          <p className="text-sm text-muted">Most popular</p>
          <p className="font-display text-xl tracking-tight mt-2 leading-snug line-clamp-2">{stats.hottest}</p>
        </Card>
      </div>

      <MarketSupplyDemandChart missions={missions} />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="p-6 md:p-8">
          <SectionHeading title="Most wanted" description="Lots of kids want these, so they pay less." />
          {topDemand.length === 0 ? (
            <p className="text-muted py-8">Nobody has asked for a mission yet.</p>
          ) : (
            <ul className="divide-y divide-line mt-2">
              {topDemand.map((stat, i) => (
                <RankRow
                  key={stat.mission.id}
                  rank={i + 1}
                  title={stat.mission.title}
                  subtitle={`${stat.mission.requestCount} kid${stat.mission.requestCount === 1 ? "" : "s"} asked`}
                  right={
                    <span className="inline-flex items-center gap-1.5">
                      <Coin type="spend" size={20} />
                      <span className="font-display text-xl num">{stat.mission.currentReward}</span>
                    </span>
                  }
                />
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 md:p-8">
          <SectionHeading title="Biggest drops" description="How much less each one pays now." />
          {sortedByDrop.length === 0 ? (
            <p className="text-muted py-8">Every mission still pays its full reward.</p>
          ) : (
            <ul className="divide-y divide-line mt-2">
              {sortedByDrop.slice(0, 5).map((stat, i) => (
                <RankRow
                  key={stat.mission.id}
                  rank={i + 1}
                  title={stat.mission.title}
                  subtitle={
                    <span className="num">
                      <span className="line-through">{stat.mission.baseReward}</span> → {stat.mission.currentReward} tokens
                    </span>
                  }
                  right={
                    <span className="inline-flex items-center gap-0.5 text-negative font-medium num">
                      <ArrowDownRight className="w-4 h-4" />
                      {stat.priceDropPercent.toFixed(0)}%
                    </span>
                  }
                />
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* All missions table */}
      <Card className="p-6 md:p-8">
        <SectionHeading title="All missions" className="mb-4" />
        <div className="overflow-x-auto -mx-6 md:-mx-8">
          <table className="w-full text-[15px] min-w-[640px]">
            <thead>
              <tr className="border-b border-line text-sm text-muted text-left">
                <th className="font-normal py-3 pl-6 md:pl-8 pr-3">Mission</th>
                <th className="font-normal py-3 px-3 text-right">Full price</th>
                <th className="font-normal py-3 px-3 text-right">Now</th>
                <th className="font-normal py-3 px-3 text-right">Requests</th>
                <th className="font-normal py-3 px-3 text-right">Change</th>
                <th className="font-normal py-3 pl-3 pr-6 md:pr-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {missionStats.map((stat) => (
                <tr key={stat.mission.id} className="hover:bg-paper/50">
                  <td className="py-4 pl-6 md:pl-8 pr-3">
                    <p className="font-medium">{stat.mission.title}</p>
                    <p className="text-sm text-muted truncate max-w-xs">{stat.mission.description}</p>
                  </td>
                  <td className="py-4 px-3 text-right num text-muted">{stat.mission.baseReward}</td>
                  <td className="py-4 px-3 text-right num font-medium">{stat.mission.currentReward}</td>
                  <td className="py-4 px-3 text-right num">{stat.mission.requestCount}</td>
                  <td className="py-4 px-3 text-right num">
                    {stat.priceChange > 0 ? (
                      <span className="text-negative">−{stat.priceDropPercent.toFixed(0)}%</span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="py-4 pl-3 pr-6 md:pr-8">
                    <Badge status={stat.mission.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
