"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Mission } from "@/types";
import { MarketLeaderboard } from "@/components/MarketLeaderboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { LiveIndicator } from "@/components/ui/Feedback";
import { Loading } from "@/components/ui/Loading";
import { getStudent } from "@/lib/store";

export default function StudentLeaderboardPage() {
  const params = useParams();
  const studentId = params.id as string;
  const student = getStudent(studentId);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

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
    <div>
      <PageHeader
        eyebrow="Market trends"
        title="What's hot in class"
        description="See which missions everyone wants and how that changes their rewards."
        action={
          !loading && (
            <LiveIndicator refreshing={refreshing} lastUpdate={lastUpdate} onRefresh={() => fetchLeaderboardData(true)} />
          )
        }
      />
      {loading ? (
        <Loading text="Loading market data" />
      ) : (
        <MarketLeaderboard missions={missions} studentId={studentId} studentName={student?.name} />
      )}
    </div>
  );
}
