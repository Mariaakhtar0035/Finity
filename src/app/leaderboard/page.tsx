"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Mission } from "@/types";
import { MarketLeaderboard } from "@/components/MarketLeaderboard";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PageHeader } from "@/components/ui/PageHeader";
import { LiveIndicator } from "@/components/ui/Feedback";
import { Loading } from "@/components/ui/Loading";

export default function LeaderboardPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const router = useRouter();

  const fetchLeaderboardData = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) setRefreshing(true);
      const res = await fetch(`/api/teacher/leaderboard?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      setMissions(data.missions || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(() => fetchLeaderboardData(true), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo href="/teacher" suffix="for teachers" />
          <Button variant="secondary" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <PageHeader
          eyebrow="Classroom market"
          title="Supply & demand, live"
          description="Track how student demand changes mission rewards in real time."
          action={
            !loading && (
              <LiveIndicator refreshing={refreshing} lastUpdate={lastUpdate} onRefresh={() => fetchLeaderboardData(true)} />
            )
          }
        />
        {loading ? <Loading text="Loading market data" /> : <MarketLeaderboard missions={missions} />}
      </main>
    </div>
  );
}
