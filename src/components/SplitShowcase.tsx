"use client";

import { useRef, useState } from "react";
import { Coin, TOKEN_META, type TokenType } from "@/components/ui/Coin";
import { WEEKLY_RATE } from "@/lib/growthCalculator";

/*
 * "How it works" on the landing page: drag the split for a 100-token reward
 * and see what each part means. Same choice students make in the app.
 */

const TOTAL = 100;
const STEP = 5;

/** Already saved toward the goal before this reward */
const SAVED_SO_FAR = 40;
const GOAL = { title: "Homework Pass", cost: 80 };
const PERKS = [
  { title: "Sit by a Friend", cost: 25 },
  { title: "Choose the Class Game", cost: 45 },
  { title: "a Homework Pass", cost: 80 },
];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Two handles that split TOTAL into Spend, Save and Grow */
function SplitBar({ cuts, onChange }: { cuts: [number, number]; onChange: (c: [number, number]) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [a, b] = cuts;
  const parts: { type: TokenType; size: number }[] = [
    { type: "spend", size: a },
    { type: "save", size: b - a },
    { type: "grow", size: TOTAL - b },
  ];

  const valueAt = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return Math.round((((clientX - r.left) / r.width) * TOTAL) / STEP) * STEP;
  };
  const set = (handle: 0 | 1, v: number) => {
    if (handle === 0) onChange([clamp(v, 0, b), b]);
    else onChange([a, clamp(v, a, TOTAL)]);
  };
  const drag = (handle: 0 | 1) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => set(handle, valueAt(ev.clientX));
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };
  const keys = (handle: 0 | 1) => (e: React.KeyboardEvent) => {
    const d = { ArrowLeft: -STEP, ArrowDown: -STEP, ArrowRight: STEP, ArrowUp: STEP }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    set(handle, cuts[handle] + d);
  };

  return (
    <div className="px-3">
      <div className="relative h-8 flex items-center" style={{ touchAction: "none" }}>
        <div ref={track} className="w-full h-2.5 rounded-full overflow-hidden flex gap-0.5 bg-line">
          {parts.map((p) => (
            <div
              key={p.type}
              className="h-full rounded-full transition-[width] duration-150 ease-out"
              style={{ width: `${p.size}%`, background: TOKEN_META[p.type].chart }}
            />
          ))}
        </div>
        {([0, 1] as const).map((h) => (
          <button
            key={h}
            type="button"
            role="slider"
            aria-label={h === 0 ? "Where Spend ends and Save begins" : "Where Save ends and Grow begins"}
            aria-valuemin={h === 0 ? 0 : a}
            aria-valuemax={h === 0 ? b : TOTAL}
            aria-valuenow={cuts[h]}
            aria-valuetext={`Spend ${a}, Save ${b - a}, Grow ${TOTAL - b}`}
            onPointerDown={drag(h)}
            onKeyDown={keys(h)}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface border border-line shadow-[0_1px_2px_rgba(20,20,20,0.08),0_4px_12px_-2px_rgba(20,20,20,0.18)] cursor-ew-resize hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-periwinkle/50 transition-[left,transform] duration-150 ease-out"
            style={{ left: `${cuts[h]}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SplitShowcase() {
  const [cuts, setCuts] = useState<[number, number]>([50, 70]);
  const spend = cuts[0];
  const save = cuts[1] - cuts[0];
  const grow = TOTAL - cuts[1];

  const perk = [...PERKS].reverse().find((p) => p.cost <= spend);
  const saved = Math.min(GOAL.cost, SAVED_SO_FAR + save);
  const inAYear = Math.round(grow * Math.pow(1 + WEEKLY_RATE, 52));

  const cards: { type: TokenType; value: number; hint: string; result: string }[] = [
    { type: "spend", value: spend, hint: "Use now", result: perk ? `Enough for ${perk.title}.` : "Not enough for a perk yet." },
    {
      type: "save",
      value: save,
      hint: "Set aside",
      result: saved >= GOAL.cost ? `Enough for the ${GOAL.title}!` : `${saved} of ${GOAL.cost} saved for a ${GOAL.title}.`,
    },
    { type: "grow", value: grow, hint: "Earns 2% a week", result: grow > 0 ? `Becomes ${inAYear} in a year.` : "Nothing growing this time." },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
        <p className="font-display text-lg text-muted mb-3">How it works</p>
        <h2 className="display text-5xl md:text-6xl text-ink text-balance">Every reward splits three ways</h2>
        <p className="text-lg text-ink-soft mt-5 leading-relaxed text-pretty">
          When students finish a job, they choose how much goes to Spend, Save and Grow. Drag to try it.
        </p>
      </div>

      <div className="rounded-[2rem] bg-surface border border-line shadow-soft">
        <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-8">
          <div className="flex items-baseline justify-between gap-3 mb-6">
            <p className="text-ink-soft">A mission reward</p>
            <p className="font-display text-3xl num">{TOTAL} tokens</p>
          </div>
          <SplitBar cuts={cuts} onChange={setCuts} />
        </div>

        <div className="grid md:grid-cols-3 border-t border-line divide-y md:divide-y-0 md:divide-x divide-line" aria-live="polite">
          {cards.map((c) => (
            <div key={c.type} className="px-6 sm:px-10 py-8">
              <div className="flex items-center gap-2.5">
                <Coin type={c.type} size={26} />
                <h3 className="font-medium">{TOKEN_META[c.type].label}</h3>
                <span className="text-sm text-muted">· {c.hint}</span>
              </div>
              <p key={c.value} className="display text-6xl num mt-5 animate-pop-in">
                {c.value}
              </p>
              <p className="text-ink-soft mt-2 text-[15px]">{c.result}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
