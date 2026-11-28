"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Check, Sofa, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coin } from "@/components/ui/Coin";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { BagDoodle } from "@/components/ui/Doodles";
import { SuccessSparkle } from "@/components/SuccessSparkle";
import { getRewards, getStudent, purchaseReward, setSaveGoalReward } from "@/lib/store";
import Link from "next/link";
import { rewardTint } from "@/lib/palette";
import { useStore } from "@/lib/useStore";
import { RewardIcon } from "@/components/RewardIcon";

export default function RewardShopPage() {
  const params = useParams();
  const studentId = params.id as string;
  useStore();
  const student = getStudent(studentId);
  const rewards = getRewards();
  const [modal, setModal] = useState<{ title: string; message: string; success: boolean } | null>(null);
  const [showSparkle, setShowSparkle] = useState(false);

  if (!student) return null;

  const handlePurchase = (rewardId: string) => {
    const result = purchaseReward(studentId, rewardId);

    if (result) {
      setShowSparkle(true);
      setModal({
        success: true,
        title: `${result.reward.title} is yours`,
        message: `You have ${result.student.spendTokens} Spend tokens left.`,
      });
    } else {
      const reward = rewards.find((r) => r.id === rewardId);
      setModal(
        reward?.soldOut
          ? { success: false, title: "Sold out", message: "This reward is sold out right now. Check back later!" }
          : {
              success: false,
              title: "Not enough tokens",
              message: "You need more Spend tokens for this. Do more jobs to earn some!",
            },
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Reward shop"
        title="Pick something you really want"
        description="Use your Spend tokens on class rewards. Your Save and Grow tokens stay where they are."
        action={
          <div className="flex items-center gap-3 bg-surface border border-line rounded-full pl-2 pr-5 py-2">
            <Coin type="spend" size={36} />
            <div className="leading-tight">
              <p className="text-xs text-muted">Spend balance</p>
              <p className="font-display text-2xl num">{student.spendTokens}</p>
            </div>
          </div>
        }
      />

      <Link
        href={`/student/${studentId}/room`}
        className="mb-6 flex items-center justify-between gap-4 rounded-card bg-lavender-soft border border-lavender/60 px-5 py-4 hover:brightness-[0.98] transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-full bg-surface border-2 border-ink flex items-center justify-center shrink-0">
            <Sofa className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="font-medium leading-tight">Looking for room stuff?</p>
            <p className="text-sm text-ink-soft">Furniture, pets and new rooms are in the shop inside your room.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm shrink-0">
          <span className="hidden sm:inline">Go to my room</span> <ArrowRight className="w-4 h-4" />
        </span>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const canAfford = student.spendTokens >= reward.cost;
          const owned = student.purchasedRewards.includes(reward.id);
          const shortBy = reward.cost - student.spendTokens;
          const isGoal = student.saveGoalRewardId === reward.id;

          return (
            <Card key={reward.id} className={`flex flex-col overflow-hidden ${reward.soldOut ? "opacity-60" : "lift"}`}>
              <div
                className="m-2 mb-0 rounded-[1.25rem] h-36 flex items-center justify-center relative"
                style={{ background: rewardTint(reward.id) }}
              >
                <span className="w-16 h-16 rounded-full bg-surface border-2 border-ink flex items-center justify-center">
                  <RewardIcon icon={reward.icon} className="w-7 h-7" />
                </span>
                {reward.soldOut && (
                  <span className="absolute top-3 right-3 h-6 px-2.5 rounded-full bg-ink text-white text-xs font-medium flex items-center">
                    Sold out
                  </span>
                )}
                {isGoal && !owned && !reward.soldOut && (
                  <span className="absolute top-3 left-3 h-6 px-2.5 rounded-full bg-surface text-xs font-medium flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> Your goal
                  </span>
                )}
                {owned && !reward.soldOut && (
                  <span className="absolute top-3 right-3 h-6 px-2.5 rounded-full bg-surface text-xs font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Owned
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-medium leading-snug">{reward.title}</h3>
                  <span className="inline-flex items-center gap-1.5 shrink-0">
                    <Coin type="spend" size={20} />
                    <span className="font-display text-xl num">{reward.cost}</span>
                  </span>
                </div>
                <p className="text-[15px] text-muted mt-1 leading-relaxed">{reward.description}</p>

                <div className="mt-auto pt-5">
                  {reward.soldOut ? (
                    <Button variant="secondary" fullWidth disabled>
                      Sold out
                    </Button>
                  ) : owned ? (
                    <Button variant="secondary" fullWidth disabled>
                      <Check className="w-4 h-4" /> Purchased
                    </Button>
                  ) : canAfford ? (
                    <Button fullWidth onClick={() => handlePurchase(reward.id)}>
                      Buy for {reward.cost}
                    </Button>
                  ) : (
                    <div>
                      <Button variant="secondary" fullWidth disabled>
                        {shortBy} more tokens needed
                      </Button>
                      {isGoal ? (
                        <Link
                          href={`/student/${studentId}/save`}
                          className="block text-center text-sm text-muted mt-3 hover:text-ink"
                        >
                          You&apos;re saving for this · see progress
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSaveGoalReward(studentId, reward.id);
                            setModal({
                              success: true,
                              title: "New savings goal",
                              message: `You're saving for ${reward.title} now. Watch your jar fill up on the Save page.`,
                            });
                          }}
                          className="w-full flex items-center justify-center gap-1.5 text-sm text-ink-soft mt-3 hover:text-ink"
                        >
                          <Target className="w-4 h-4" /> Save for this instead
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <SuccessSparkle show={showSparkle} onComplete={() => setShowSparkle(false)} />

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.title}
        description={modal?.message}
        illustration={modal?.success ? <BagDoodle className="w-20 h-auto" /> : undefined}
      >
        <Button onClick={() => setModal(null)} fullWidth>
          Got it
        </Button>
      </Modal>
    </div>
  );
}
