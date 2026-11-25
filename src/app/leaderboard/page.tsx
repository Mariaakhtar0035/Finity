"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarketLeaderboard } from "@/components/MarketLeaderboard";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PageHeader } from "@/components/ui/PageHeader";
import { LiveIndicator } from "@/components/ui/Feedback";
import { getLastChangedAt, getMissions } from "@/lib/store";
import { useStore } from "@/lib/useStore";

export default function LeaderboardPage() {
  const router = useRouter();
  useStore();

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
          action={<LiveIndicator lastUpdate={getLastChangedAt()} />}
        />
        <MarketLeaderboard missions={[...getMissions()]} />
      </main>
    </div>
  );
}
