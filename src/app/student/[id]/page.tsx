"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coin, TOKEN_META, TokenType } from "@/components/ui/Coin";
import { CoinStackDoodle } from "@/components/ui/Doodles";
import { SuccessSparkle } from "@/components/SuccessSparkle";
import { ClaimRewardModal } from "@/components/ClaimRewardModal";
import {
  getStudent,
  getStudentMissions,
  getRewards,
  getPendingRewardsForStudent,
  claimPendingReward,
  getBalanceHistory,
  getCurrentWeek,
} from "@/lib/store";
import { TransferTokensCard } from "@/components/TransferTokensCard";
import { GrowthComparisonChart } from "@/components/GrowthComparisonChart";
import { SpendingBehaviorCard } from "@/components/SpendingBehaviorCard";
import { computeWhatIfGrow } from "@/lib/growthCalculator";
import type { PendingReward } from "@/types";
import { useStore } from "@/lib/useStore";

export default function StudentDashboard() {
  const params = useParams();
  const studentId = params.id as string;
  const [claimingPending, setClaimingPending] = useState<PendingReward | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  useStore();
  const student = getStudent(studentId);
  const missions = getStudentMissions(studentId);
  const pendingRewards = getPendingRewardsForStudent(studentId);

  const handleClaim = (spendAmount: number, saveAmount: number, growAmount: number) => {
    if (!claimingPending) return;
    claimPendingReward(claimingPending.id, spendAmount, saveAmount, growAmount);
    setClaimingPending(null);
    setCelebrate(true);
  };

  if (!student) return null;

  const completedMissions = missions.filter((m) => m.status === "COMPLETED");
  const totalTokens = student.spendTokens + student.saveTokens + student.growTokens;
  const history = getBalanceHistory(studentId);
  const whatIfGrow = computeWhatIfGrow(history);
  const rewards = getRewards();
  const purchasedRewardItems = rewards.filter((r) => student.purchasedRewards.includes(r.id));
  const availableRewards = rewards
    .filter((r) => !r.soldOut && !student.purchasedRewards.includes(r.id))
    .slice(0, 5)
    .map((r) => ({ title: r.title, cost: r.cost }));

  const accounts: { type: TokenType; amount: number; href: string }[] = [
    { type: "spend", amount: student.spendTokens, href: `/student/${studentId}/shop` },
    { type: "save", amount: student.saveTokens, href: `/student/${studentId}/save` },
    { type: "grow", amount: student.growTokens, href: `/student/${studentId}/grow` },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <p className="font-display text-lg text-muted mb-1">Welcome back · Week {getCurrentWeek()}</p>
        <h1 className="display text-[44px] md:text-[56px]">{student.name}&apos;s money</h1>
      </header>

      {/* Pending claim banner */}
      {pendingRewards.length > 0 && (
        <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-butter-soft border border-[#efe3ae] p-6 md:p-8">
          <CoinStackDoodle className="absolute -right-4 -bottom-6 w-32 md:w-40 opacity-90 hidden sm:block" />
          <div className="relative sm:pr-36">
            <h2 className="font-display text-2xl md:text-3xl tracking-tight">You have tokens to claim</h2>
            <p className="text-ink-soft mt-1">
              Your teacher approved {pendingRewards.length} mission{pendingRewards.length > 1 ? "s" : ""}. Decide how to
              split your reward.
            </p>
            <div className="mt-5 space-y-2">
              {pendingRewards.map((pending) => (
                <div
                  key={pending.id}
                  className="flex items-center justify-between gap-4 bg-surface rounded-2xl pl-5 pr-2 py-2 border border-line"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{pending.missionTitle}</p>
                    <p className="text-sm text-muted num">{pending.totalAmount} tokens</p>
                  </div>
                  <Button size="sm" onClick={() => setClaimingPending(pending)}>
                    Claim
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {claimingPending && (
        <ClaimRewardModal
          pendingReward={claimingPending}
          studentName={student.name}
          onClaim={handleClaim}
          onClose={() => setClaimingPending(null)}
        />
      )}
      <SuccessSparkle show={celebrate} onComplete={() => setCelebrate(false)} />

      {/* Balance */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Total tokens</p>
            <p className="display text-7xl md:text-8xl num mt-1">{totalTokens}</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-muted">Missions done</p>
              <p className="font-display text-2xl num">{completedMissions.length}</p>
            </div>
            <div>
              <p className="text-muted">Rewards owned</p>
              <p className="font-display text-2xl num">{purchasedRewardItems.length}</p>
            </div>
          </div>
        </div>

        {/* Split bar */}
        {totalTokens > 0 && (
          <div className="flex h-2.5 rounded-full overflow-hidden mt-6 gap-0.5" aria-hidden>
            {accounts.map((a) => (
              <div
                key={a.type}
                className="bar-grow"
                style={{ width: `${(a.amount / totalTokens) * 100}%`, background: TOKEN_META[a.type].edge }}
              />
            ))}
          </div>
        )}

        <div className="mt-6 divide-y divide-line border-t border-line">
          {accounts.map((a) => (
            <Link key={a.type} href={a.href} className="group flex items-center gap-4 py-4 -mx-2 px-2 rounded-xl hover:bg-paper/60 transition-colors">
              <Coin type={a.type} size={40} />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{TOKEN_META[a.type].label}</p>
                <p className="text-sm text-muted">{TOKEN_META[a.type].description}</p>
              </div>
              <span className="font-display text-2xl num">{a.amount}</span>
              <ChevronRight className="w-5 h-5 text-faint group-hover:text-ink transition-colors" />
            </Link>
          ))}
        </div>
      </Card>

      {/* Money story chart */}
      <Card className="p-6 md:p-8">
        <GrowthComparisonChart history={history} whatIfGrow={whatIfGrow} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <SpendingBehaviorCard
          studentId={studentId}
          studentName={student.name}
          history={history}
          purchasedRewardItems={purchasedRewardItems}
          currentSpend={student.spendTokens}
          currentSave={student.saveTokens}
          currentGrow={student.growTokens}
          saveGoal={student.saveGoal}
          availableRewards={availableRewards}
        />
        <TransferTokensCard
          studentId={studentId}
          studentName={student.name}
          spendTokens={student.spendTokens}
          saveTokens={student.saveTokens}
          growTokens={student.growTokens}
          onTransfer={() => {}}
        />
      </div>
    </div>
  );
}
