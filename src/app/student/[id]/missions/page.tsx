"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MissionCard } from "@/components/MissionCard";
import { ArrowRight } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Coin } from "@/components/ui/Coin";
import { Callout } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PurchaseCard } from "@/components/PurchaseCard";
import {
  getStudentMissions,
  getStudent,
  getRecommendedSplit,
  getPendingRewardsForStudent,
  getRewards,
  getActivity,
} from "@/lib/store";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Mission } from "@/types";
import { useStore } from "@/lib/useStore";

const SPEND_VS_GROW_FALLBACK =
  "You earned tokens! Some go to Spend (use now), some to Save, and some to Grow (locked and growing).";

function getActionHint(status: string): string | undefined {
  switch (status) {
    case "IN_PROGRESS":
      return "Finish it, then ask your teacher to approve it.";
    case "COMPLETED":
      return "Done! Tokens earned.";
    case "REQUESTED":
      return "Waiting for your teacher to assign it.";
    default:
      return undefined;
  }
}

export default function ActivityPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [splitModalMission, setSplitModalMission] = useState<Mission | null>(null);
  const [splitExplanation, setSplitExplanation] = useState<string | null>(null);
  const [loadingSplitExplanation, setLoadingSplitExplanation] = useState(false);

  useStore();
  const student = getStudent(studentId);
  const missions = getStudentMissions(studentId);
  const pendingRewards = getPendingRewardsForStudent(studentId);
  const purchasedRewardItems = student
    ? getRewards().filter((r) => student.purchasedRewards.includes(r.id))
    : [];

  const handleExplainRewardSplit = (mission: Mission) => {
    setSplitModalMission(mission);
    setSplitExplanation(null);
    setLoadingSplitExplanation(true);
    const reward = mission.currentReward;
    const { spend: spendAmount, save: saveAmount, grow: growAmount } = getRecommendedSplit(reward);
    fetch("/api/gemini/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "SPEND_VS_GROW",
        studentName: student?.name ?? "Student",
        context: { totalReward: reward, spendAmount, saveAmount, growAmount },
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => setSplitExplanation(data.explanation ?? SPEND_VS_GROW_FALLBACK))
      .catch(() => setSplitExplanation(SPEND_VS_GROW_FALLBACK))
      .finally(() => setLoadingSplitExplanation(false));
  };

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Activity"
        title="Your missions & purchases"
        description="Keep track of what you're working on, what you've earned and what you've bought."
      />

      {pendingRewards.length > 0 && (
        <Link
          href={`/student/${studentId}`}
          className="flex items-center justify-between gap-4 rounded-card bg-butter-soft border border-[#efe3ae] px-6 py-5 hover:brightness-[0.98] transition"
        >
          <div className="flex items-center gap-3">
            <Coin type="spend" size={32} />
            <p className="font-medium">
              You have {pendingRewards.length} reward{pendingRewards.length > 1 ? "s" : ""} to claim
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm">
            Claim on Home <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      )}

      {/* My Missions */}
      <section>
        <SectionHeading title="My missions" className="mb-5" />
        {missions.length === 0 ? (
          <EmptyState
            title="No missions yet"
            description="Head to the marketplace to request one. Your teacher will assign it to you."
            action={
              <Link href={`/student/${studentId}/marketplace`}>
                <Button>Browse missions</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                variant="myMission"
                studentId={studentId}
                actionHint={getActionHint(mission.status)}
                onExplainRewardSplit={handleExplainRewardSplit}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Money activity */}
        <Card className="p-6 md:p-8">
          <SectionHeading title="Money activity" description="Every token you've earned, spent, moved or grown." className="mb-2" />
          <ActivityFeed entries={getActivity(studentId)} limit={8} emptyText="Nothing yet. Claim a reward or buy something to see it here." />
        </Card>

        {/* My Purchases */}
        <Card className="p-6 md:p-8">
          <SectionHeading
            title="My purchases"
            action={
              <Link href={`/student/${studentId}/shop`} className="text-sm underline underline-offset-4 decoration-line-strong hover:decoration-ink">
                Visit shop
              </Link>
            }
            className="mb-4"
          />
          {purchasedRewardItems.length === 0 ? (
            <p className="text-muted py-6">No purchases yet. Rewards you buy will show up here.</p>
          ) : (
            <div className="space-y-2">
              {purchasedRewardItems.map((reward) => (
                <PurchaseCard key={reward.id} reward={reward} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={!!splitModalMission}
        onClose={() => setSplitModalMission(null)}
        title="How was my reward split?"
      >
        <Callout loading={loadingSplitExplanation} className="mb-6">
          {splitExplanation}
        </Callout>
        <Button onClick={() => setSplitModalMission(null)} fullWidth>
          Got it
        </Button>
      </Modal>
    </div>
  );
}
