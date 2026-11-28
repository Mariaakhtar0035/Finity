"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coin } from "@/components/ui/Coin";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { BagDoodle } from "@/components/ui/Doodles";
import { ProgressJar } from "@/components/ProgressJar";
import { RewardIcon } from "@/components/RewardIcon";
import { SuccessSparkle } from "@/components/SuccessSparkle";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";
import {
  buyWithSavings,
  getRoom,
  getRewards,
  getSaveGoal,
  getStudent,
  getWeeklySavePace,
  setSaveGoalReward,
  updateStudent,
} from "@/lib/store";
import { rewardTint } from "@/lib/palette";
import { useStore } from "@/lib/useStore";
import { ROOM_ITEMS } from "@/lib/roomCatalog";
import { RoomThumb } from "@/components/room/RoomArt";

const TIPS = [
  { title: "Start small", body: "Even a few tokens each time add up fast." },
  { title: "Name your goal", body: "Waiting is easier when you know what you're saving for." },
  { title: "Save first", body: "Put a little in Save before you spend the rest." },
];

export default function SaveTokensPage() {
  const params = useParams();
  const studentId = params.id as string;
  useStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [bought, setBought] = useState<{ title: string } | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const student = getStudent(studentId);
  if (!student) return null;

  const goal = getSaveGoal(student);
  const saved = student.saveTokens;
  const progress = Math.min(1, saved / Math.max(goal.target, 1));
  const remaining = Math.max(0, goal.target - saved);
  const reached = remaining === 0;
  const pace = getWeeklySavePace(student);
  const weeksLeft = pace > 0 ? Math.ceil(remaining / pace) : null;

  const room = getRoom(studentId);
  type Option = { id: string; title: string; cost: number; icon: React.ReactNode; tint: string };
  const rewardOptions: Option[] = getRewards()
    .filter((r) => !r.soldOut && !student.purchasedRewards.includes(r.id))
    .sort((a, b) => a.cost - b.cost)
    .map((r) => ({
      id: r.id,
      title: r.title,
      cost: r.cost,
      tint: rewardTint(r.id),
      icon: <RewardIcon icon={r.icon} className="w-5 h-5" />,
    }));
  const roomOptions: Option[] = ROOM_ITEMS.filter((i) => i.cost > 0 && !(room.owned[i.id] ?? 0))
    .sort((a, b) => a.cost - b.cost)
    .map((i) => ({ id: i.id, title: i.name, cost: i.cost, tint: "#f6efe4", icon: <RoomThumb itemId={i.id} className="w-8 h-8" /> }));
  const goalId = goal.kind === "reward" ? goal.reward.id : goal.kind === "room" ? goal.item.id : null;

  const customNum = parseInt(customValue, 10);
  const customValid = !isNaN(customNum) && customNum >= 1 && customNum <= 9999;

  const handleBuy = () => {
    if (!goalId) return;
    const result = buyWithSavings(studentId, goalId);
    if (result) {
      setBought({ title: result.title });
      setCelebrate(true);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Save"
        title="Saving for something big"
        description="Pick a reward to save for, then watch your jar fill up week by week."
      />

      {/* Goal */}
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[240px_1fr]">
          <div className="flex items-end justify-center bg-periwinkle-soft pt-8 pb-4 md:py-8">
            <ProgressJar progress={progress} className="w-36 h-auto" />
          </div>

          <div className="p-6 md:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-muted">Saving for</p>
                {goal.kind === "reward" ? (
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center shrink-0"
                      style={{ background: rewardTint(goal.reward.id) }}
                    >
                      <RewardIcon icon={goal.reward.icon} className="w-5 h-5" />
                    </span>
                    <h2 className="font-display text-3xl tracking-tight leading-tight">{goal.reward.title}</h2>
                  </div>
                ) : goal.kind === "room" ? (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="w-12 h-12 rounded-full border-2 border-ink bg-sand-soft flex items-center justify-center shrink-0 overflow-hidden">
                      <RoomThumb itemId={goal.item.id} className="w-9 h-9" />
                    </span>
                    <h2 className="font-display text-3xl tracking-tight leading-tight">{goal.item.name}</h2>
                  </div>
                ) : (
                  <h2 className="font-display text-3xl tracking-tight mt-1 num">{goal.target} tokens</h2>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)} className="shrink-0">
                <Target className="w-4 h-4" /> Change goal
              </Button>
            </div>

            <div className="mt-8">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <p className="flex items-center gap-2 text-ink-soft">
                  <Coin type="save" size={22} />
                  <span>
                    <span className="font-medium text-ink num">{saved}</span>
                    <span className="num"> of {goal.target}</span> Save tokens
                  </span>
                </p>
                <span className="font-display text-2xl num">{Math.round(progress * 100)}%</span>
              </div>
              <div
                className="h-3 w-full rounded-full bg-periwinkle-soft overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Savings goal progress"
              >
                <div className="h-full rounded-full bg-periwinkle-deep bar-grow" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>

            <div className="mt-auto pt-6">
              {reached ? (
                goal.kind !== "amount" ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between rounded-2xl bg-mint-soft p-4">
                    <p className="font-medium">You&apos;ve saved enough. Nice patience!</p>
                    <Button onClick={handleBuy}>Buy with savings</Button>
                  </div>
                ) : (
                  <p className="rounded-2xl bg-mint-soft p-4 font-medium">You reached your goal. Pick a reward to save for next!</p>
                )
              ) : (
                <p className="text-[15px] text-ink-soft">
                  <span className="font-medium text-ink num">{remaining}</span> to go
                  {weeksLeft !== null ? (
                    <>
                      {" "}· about <span className="font-medium text-ink num">{weeksLeft}</span> week{weeksLeft === 1 ? "" : "s"} if you
                      keep saving like this
                    </>
                  ) : (
                    <>
                      {" "}·{" "}
                      <Link href={`/student/${studentId}`} className="underline underline-offset-4 decoration-line-strong hover:decoration-ink">
                        move some tokens into Save
                      </Link>{" "}
                      to get going
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {TIPS.map((tip, i) => (
          <Card key={tip.title} className="p-6">
            <span className="w-8 h-8 rounded-full bg-paper font-display flex items-center justify-center num">{i + 1}</span>
            <h3 className="text-lg font-medium mt-4">{tip.title}</h3>
            <p className="text-muted mt-1 text-[15px] leading-relaxed">{tip.body}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 md:p-8 flex gap-4 items-start">
        <MrsPennyworthAvatar size="md" />
        <div>
          <p className="text-sm text-muted">Mrs. Pennyworth says</p>
          <p className="font-display text-xl md:text-2xl tracking-tight leading-snug mt-1">
            &ldquo;Saving is like planting a tiny seed. Keep planting, and soon you&apos;ll have a whole garden.&rdquo;
          </p>
        </div>
      </Card>

      {/* Goal picker */}
      <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} title="What are you saving for?">
        <div className="max-h-[360px] overflow-y-auto -mx-1 px-1 space-y-5">
          {[
            { label: "Rewards", items: rewardOptions },
            { label: "For your room", items: roomOptions },
          ].map((group) =>
            group.items.length === 0 ? null : (
              <div key={group.label}>
                <p className="text-xs font-medium tracking-wide uppercase text-muted mb-2">{group.label}</p>
                <ul className="space-y-2">
                  {group.items.map((o) => {
                    const active = goalId === o.id;
                    const pct = Math.min(100, Math.round((saved / o.cost) * 100));
                    return (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSaveGoalReward(studentId, o.id);
                            setPickerOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                            active ? "border-ink bg-paper" : "border-line hover:border-ink"
                          }`}
                        >
                          <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                            style={{ background: o.tint }}
                          >
                            {o.icon}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block font-medium truncate">{o.title}</span>
                            <span className="block text-xs text-muted num">
                              {o.cost} tokens · {pct >= 100 ? "you can afford it" : `${pct}% saved`}
                            </span>
                          </span>
                          {active && <Check className="w-4 h-4 shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
          )}
        </div>

        <form
          className="mt-5 pt-5 border-t border-line"
          onSubmit={(e) => {
            e.preventDefault();
            if (!customValid) return;
            setSaveGoalReward(studentId, null);
            updateStudent(studentId, { saveGoal: customNum });
            setCustomValue("");
            setPickerOpen(false);
          }}
        >
          <label htmlFor="custom-goal" className="label">
            Or save toward an amount
          </label>
          <div className="flex gap-2">
            <input
              id="custom-goal"
              type="number"
              inputMode="numeric"
              min={1}
              max={9999}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="e.g. 150"
              className="input num"
            />
            <Button type="submit" variant="secondary" disabled={!customValid} className="h-auto! shrink-0">
              Set goal
            </Button>
          </div>
        </form>
      </Modal>

      <SuccessSparkle show={celebrate} onComplete={() => setCelebrate(false)} />
      <Modal
        isOpen={!!bought}
        onClose={() => setBought(null)}
        illustration={<BagDoodle className="w-20 h-auto" />}
        title={bought ? `${bought.title} is yours` : undefined}
        description="You paid for it with tokens you saved up. That's what saving is for!"
      >
        <Button
          fullWidth
          onClick={() => {
            setBought(null);
            setPickerOpen(true);
          }}
        >
          Pick my next goal
        </Button>
      </Modal>
    </div>
  );
}
