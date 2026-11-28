"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftRight, ArrowRight, ChevronRight, Heart, Pencil } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Coin, TOKEN_META, type TokenType } from "@/components/ui/Coin";
import { BagDoodle, CoinStackDoodle, JarDoodle, StarDoodle } from "@/components/ui/Doodles";
import { SuccessSparkle } from "@/components/SuccessSparkle";
import { ClaimRewardModal } from "@/components/ClaimRewardModal";
import { TransferTokensCard } from "@/components/TransferTokensCard";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";
import { lookOf } from "@/lib/avatar";
import { AvatarPicture, RoomScene } from "@/components/room/RoomArt";
import {
  claimPendingReward,
  getCurrentWeek,
  getPendingRewardsForStudent,
  getRewards,
  getRoom,
  getSaveGoal,
  getStudent,
  getStudentMissions,
  saveGoalTitle,
} from "@/lib/store";
import { WEEKLY_RATE } from "@/lib/growthCalculator";
import type { PendingReward, Student } from "@/types";
import { useStore } from "@/lib/useStore";

/*
 * Student home: one big number, one thing to do next, and the three
 * accounts in plain words. Charts and tips live one tap away.
 */

type NextStep = {
  tone: "gold" | "plain";
  art: React.ReactNode;
  title: string;
  body: string;
  action: { label: string; href?: string; onClick?: () => void };
};

/** One short tip from Mrs. Pennyworth, picked from how the student's tokens look right now */
function pennyworthTip(s: Student, goalName: string | null, nextWeekGrow: number): string {
  if (s.spendTokens > 2 * Math.max(s.saveTokens, 1) && goalName)
    return `You have lots in Spend. Moving a few tokens to Save gets you to the ${goalName} sooner!`;
  if (nextWeekGrow > 0) return `Your Grow tokens will earn about ${nextWeekGrow} more next week, just for waiting. Nice!`;
  if (s.growTokens === 0) return "Try putting a few tokens in Grow. They get a little bigger every week.";
  return "Saving a little from every mission adds up fast.";
}

export default function StudentHome() {
  const params = useParams();
  const studentId = params.id as string;
  const [claiming, setClaiming] = useState<PendingReward | null>(null);
  const [moving, setMoving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  useStore();

  const student = getStudent(studentId);
  if (!student) return null;

  const pending = getPendingRewardsForStudent(studentId);
  const missions = getStudentMissions(studentId);
  const inProgress = missions.find((m) => m.status === "IN_PROGRESS");
  const asked = missions.find((m) => m.status === "REQUESTED");
  const goal = getSaveGoal(student);
  const goalName = goal.kind !== "amount" ? saveGoalTitle(goal) : null;
  const goalProgress = Math.min(1, student.saveTokens / Math.max(goal.target, 1));
  const total = student.spendTokens + student.saveTokens + student.growTokens;
  const nextWeekGrow = student.growTokens > 0 ? Math.max(1, Math.round(student.growTokens * WEEKLY_RATE)) : 0;
  const room = getRoom(studentId);

  // What the Spend tokens can buy right now
  const shop = getRewards()
    .filter((r) => !r.soldOut && !student.purchasedRewards.includes(r.id))
    .sort((a, b) => a.cost - b.cost);
  const affordable = [...shop].reverse().find((r) => r.cost <= student.spendTokens);
  const cheapest = shop[0];

  const handleClaim = (spend: number, save: number, grow: number) => {
    if (!claiming) return;
    claimPendingReward(claiming.id, spend, save, grow);
    setClaiming(null);
    setCelebrate(true);
  };

  // The one thing to do next
  const next: NextStep = pending.length
    ? {
        tone: "gold",
        art: <CoinStackDoodle className="w-20 h-auto" />,
        title: `You have ${pending[0].totalAmount} tokens to collect!`,
        body:
          pending.length > 1
            ? `For ${pending[0].missionTitle}, and ${pending.length - 1} more.`
            : `For ${pending[0].missionTitle}. Your teacher says it's done.`,
        action: { label: "Collect", onClick: () => setClaiming(pending[0]) },
      }
    : !student.look
      ? {
          tone: "plain",
          art: <AvatarPicture look={lookOf(student)} className="w-14 h-auto" />,
          title: "Make your character!",
          body: "Pick your hair, skin and shirt. Your character lives in your room.",
          action: { label: "Make it", href: `/student/${studentId}/look` },
        }
    : goalName && goalProgress >= 0.75 && goalProgress < 1
      ? {
          tone: "plain",
          art: <JarDoodle className="w-16 h-auto" />,
          title: "You're so close!",
          body: `Just ${goal.target - student.saveTokens} more Save tokens for the ${goalName}.`,
          action: { label: "See my goal", href: `/student/${studentId}/save` },
        }
      : goalName && goalProgress >= 1
        ? {
            tone: "gold",
            art: <JarDoodle className="w-16 h-auto" />,
            title: "You saved enough!",
            body: `You can get the ${goalName} with your Save tokens now.`,
            action: { label: "Get it", href: `/student/${studentId}/save` },
          }
        : inProgress
          ? {
              tone: "plain",
              art: <StarDoodle className="w-14 h-auto" />,
              title: `Finish ${inProgress.title}`,
              body: `When your teacher says it's done, you'll get ${inProgress.currentReward} tokens.`,
              action: { label: "See my missions", href: `/student/${studentId}/missions` },
            }
          : asked
            ? {
                tone: "plain",
                art: <StarDoodle className="w-14 h-auto" />,
                title: "Your mission is on its way",
                body: `You asked for ${asked.title}. Want to pick another one too?`,
                action: { label: "Find missions", href: `/student/${studentId}/marketplace` },
              }
            : {
                tone: "plain",
                art: <StarDoodle className="w-14 h-auto" />,
                title: "Earn more tokens",
                body: "Pick a mission to do in class. Ones nobody else wants pay the most!",
                action: { label: "Find missions", href: `/student/${studentId}/marketplace` },
              };

  const rows: { type: TokenType; href: string; status: React.ReactNode }[] = [
    {
      type: "spend",
      href: `/student/${studentId}/shop`,
      status: affordable
        ? `Enough for ${affordable.title}`
        : cheapest
          ? `${cheapest.cost - student.spendTokens} more for ${cheapest.title}`
          : "For things you want now",
    },
    {
      type: "save",
      href: `/student/${studentId}/save`,
      status: goalName ? (
        <span className="flex items-center gap-2">
          <span className="w-16 h-1.5 rounded-full bg-periwinkle-soft overflow-hidden shrink-0">
            <span className="block h-full rounded-full bg-periwinkle-deep" style={{ width: `${goalProgress * 100}%` }} />
          </span>
          <span className="truncate">
            {Math.min(student.saveTokens, goal.target)} of {goal.target} for the {goalName}
          </span>
        </span>
      ) : (
        "Pick something to save for"
      ),
    },
    {
      type: "grow",
      href: `/student/${studentId}/grow`,
      status: nextWeekGrow > 0 ? `+${nextWeekGrow} more next week` : "Gets a little bigger every week",
    },
  ];

  const nextCard = (
    <Card className={`p-6 md:p-7 overflow-hidden relative ${next.tone === "gold" ? "bg-butter-soft! border-[#efe3ae]!" : ""}`}>
      <div className="flex items-start gap-5">
        <div className="shrink-0 w-20 flex justify-center pt-1 bob">{next.art}</div>
        <div className="min-w-0">
          <p className="text-sm text-muted">Next up</p>
          <h2 className="font-display text-2xl md:text-3xl tracking-tight leading-tight mt-0.5">{next.title}</h2>
          <p className="text-ink-soft mt-2">{next.body}</p>
          <div className="mt-5">
            {next.action.href ? (
              <Link href={next.action.href}>
                <Button>
                  {next.action.label} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button onClick={next.action.onClick}>{next.action.label}</Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Hello */}
      <header className="flex items-end gap-4">
        <Link href={`/student/${studentId}/look`} className="relative shrink-0 -mb-1 group" aria-label="Change how your character looks">
          <AvatarPicture look={lookOf(student)} className="w-14 h-auto group-hover:scale-105 transition-transform" />
          <span className="absolute -right-1 bottom-1 w-6 h-6 rounded-full bg-surface border border-line shadow-soft flex items-center justify-center">
            <Pencil className="w-3 h-3" />
          </span>
        </Link>
        <div>
          <p className="text-muted">Week {getCurrentWeek()}</p>
          <h1 className="display text-[40px] md:text-[52px] leading-none">Hi, {student.name}!</h1>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
        {/* Next up: first on phones, top right on wider screens */}
        <div className="lg:col-start-2 lg:row-start-1">{nextCard}</div>

        {/* Balance: second on phones, the whole left side on wider screens */}
        <div className="lg:col-start-1 lg:row-start-1 lg:row-span-3">
          <Card className="p-6 md:p-8">
            <p className="text-muted">You have</p>
            <p className="mt-1 flex items-baseline gap-3">
              <span className="display text-7xl md:text-8xl num leading-none">{total}</span>
              <span className="font-display text-2xl text-ink-soft">tokens</span>
            </p>
            {total > 0 && (
              <div className="flex h-2 rounded-full overflow-hidden mt-6 gap-0.5" aria-hidden>
                {rows.map((r) => {
                  const amount = r.type === "spend" ? student.spendTokens : r.type === "save" ? student.saveTokens : student.growTokens;
                  return <div key={r.type} className="bar-grow" style={{ width: `${(amount / total) * 100}%`, background: TOKEN_META[r.type].edge }} />;
                })}
              </div>
            )}

            <div className="mt-5 divide-y divide-line">
              {rows.map((r) => {
                const amount = r.type === "spend" ? student.spendTokens : r.type === "save" ? student.saveTokens : student.growTokens;
                return (
                  <Link key={r.type} href={r.href} className="group flex items-center gap-4 py-4 -mx-2 px-2 rounded-xl hover:bg-paper/60 transition-colors">
                    <Coin type={r.type} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-lg leading-tight">{TOKEN_META[r.type].label}</p>
                      <div className="text-sm text-muted mt-0.5 truncate">{r.status}</div>
                    </div>
                    <span className="font-display text-3xl num">{amount}</span>
                    <ChevronRight className="w-5 h-5 text-faint group-hover:text-ink transition-colors" />
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 pt-5 border-t border-line">
              <Button variant="secondary" size="sm" onClick={() => setMoving(true)}>
                <ArrowLeftRight className="w-4 h-4" /> Move tokens
              </Button>
              <Link href={`/student/${studentId}/missions`}>
                <Button variant="ghost" size="sm">
                  See my money story
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Their room */}
        <div className="lg:col-start-2 lg:row-start-2">
          <Link href={`/student/${studentId}/room`} className="block group">
            <Card className="overflow-hidden lift">
              <div className="h-44 bg-paper overflow-hidden border-b border-line">
                <RoomScene still room={room} className="w-full h-full" />
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium">My room</p>
                  <p className="text-sm text-muted flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> {room.likes.length} classmate{room.likes.length === 1 ? "" : "s"} liked it
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm group-hover:gap-2 transition-all">
                  Go in <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Card>
          </Link>
        </div>

        {/* One tip */}
        <div className="lg:col-start-2 lg:row-start-3">
          <div className="flex items-start gap-3">
            <MrsPennyworthAvatar size="sm" className="shrink-0" />
            <p className="bg-surface border border-line rounded-2xl rounded-tl-md px-4 py-3 text-[15px] leading-relaxed text-ink-soft">
              {pennyworthTip(student, goalName, nextWeekGrow)}
            </p>
          </div>
        </div>
      </div>

      {claiming && (
        <ClaimRewardModal pendingReward={claiming} studentName={student.name} onClaim={handleClaim} onClose={() => setClaiming(null)} />
      )}
      <Modal isOpen={moving} onClose={() => setMoving(false)} title="Move tokens" illustration={<BagDoodle className="w-16 h-auto" />}>
        <TransferTokensCard
          bare
          studentId={studentId}
          studentName={student.name}
          spendTokens={student.spendTokens}
          saveTokens={student.saveTokens}
          growTokens={student.growTokens}
          onTransfer={() => {}}
        />
      </Modal>
      <SuccessSparkle show={celebrate} onComplete={() => setCelebrate(false)} />
    </div>
  );
}
