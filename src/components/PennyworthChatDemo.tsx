"use client";

import { useEffect, useRef, useState } from "react";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";
import { TypingDots } from "@/components/ui/Feedback";

/*
 * The landing page chat with Mrs. Pennyworth: a question pops in, she thinks,
 * her answer types out, then the next example plays. Runs only while it's on
 * screen. With reduced motion it simply shows the first exchange.
 */

const EXAMPLES = [
  {
    q: "Why did my mission reward go down?",
    a: "Lots of classmates wanted that mission! When more people want the same thing, each one is worth a little less. That's supply and demand.",
  },
  {
    q: "Should I buy the class game or keep saving?",
    a: "You have 120 Spend tokens, so you could buy it today. If you wait, you'll reach your Homework Pass in about 2 weeks. Which matters more to you?",
  },
  {
    q: "What does Grow actually do?",
    a: "Your Grow tokens earn 2% every week, and the interest earns interest too. Leave your 95 alone and it could be about 266 in a year.",
  },
];

type Phase = "ask" | "think" | "answer" | "hold" | "out";

const TIMING: Record<Exclude<Phase, "answer">, number> = { ask: 700, think: 1300, hold: 3600, out: 450 };
const CHAR_MS = 22;

export function PennyworthChatDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [chars, setChars] = useState(0);
  const example = EXAMPLES[i];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStill(true);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Step through the conversation while it's on screen
  useEffect(() => {
    if (still || !inView) return;
    if (phase === "answer") {
      if (chars >= example.a.length) {
        setPhase("hold");
        return;
      }
      const t = setTimeout(() => setChars((c) => Math.min(example.a.length, c + 2)), CHAR_MS * 2);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (phase === "ask") setPhase("think");
      else if (phase === "think") {
        setChars(0);
        setPhase("answer");
      } else if (phase === "hold") setPhase("out");
      else {
        setI((n) => (n + 1) % EXAMPLES.length);
        setChars(0);
        setPhase("ask");
      }
    }, TIMING[phase]);
    return () => clearTimeout(t);
  }, [phase, chars, inView, still, example.a.length]);

  const showAnswer = still || phase === "answer" || phase === "hold" || phase === "out";
  const thinking = !still && phase === "think";
  const typing = !still && phase === "answer";
  const answerText = still ? example.a : example.a.slice(0, chars);

  return (
    <div ref={rootRef} className="bg-surface text-ink rounded-card p-5 shadow-lift max-w-md md:ml-auto w-full">
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <MrsPennyworthAvatar size="md" state={thinking ? "thinking" : "idle"} className="w-11! h-11!" />
        <div>
          <p className="font-medium leading-tight">Mrs. Pennyworth</p>
          <p className="text-sm text-muted">{thinking || typing ? "Typing…" : "Your money coach"}</p>
        </div>
      </div>

      {/* Fixed height so the card doesn't jump as messages come and go */}
      <div
        className={`space-y-3 pt-4 text-[15px] min-h-[13.5rem] transition-opacity duration-400 ${phase === "out" ? "opacity-0" : "opacity-100"}`}
        aria-live="polite"
      >
        <div key={`q-${i}`} className="flex justify-end animate-fade-up">
          <p className="bg-ink text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">{example.q}</p>
        </div>
        {thinking && (
          <div className="flex animate-fade-up">
            <p className="bg-paper rounded-2xl rounded-bl-md px-4 py-3">
              <TypingDots />
            </p>
          </div>
        )}
        {showAnswer && (
          <div className="flex">
            <p className="bg-paper rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[88%] leading-relaxed">
              {answerText}
              {typing && <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-ink/40 rounded-sm animate-pulse" aria-hidden />}
            </p>
          </div>
        )}
      </div>

      {/* Which example is playing */}
      {!still && (
        <div className="flex justify-center gap-1.5 pt-3" aria-hidden>
          {EXAMPLES.map((_, n) => (
            <span key={n} className={`h-1.5 rounded-full transition-all duration-300 ${n === i ? "w-5 bg-ink" : "w-1.5 bg-line-strong"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
