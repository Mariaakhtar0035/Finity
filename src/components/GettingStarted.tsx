"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, ChevronDown, X } from "lucide-react";
import { getTour, isTourDismissed, setTourDismissed } from "@/lib/store";
import { useStore } from "@/lib/useStore";
import type { TourStep } from "@/types";

type Step = { id: TourStep; title: string; body: string; href: (studentId: string | null) => string; cta: string };

const STEPS: Step[] = [
  {
    id: "request",
    title: "Request a mission",
    body: "Join as a student and pick a mission from the marketplace.",
    href: (sid) => (sid ? `/student/${sid}/marketplace` : "/join"),
    cta: "Browse missions",
  },
  {
    id: "approve",
    title: "Approve it as the teacher",
    body: "Assign the mission to that student, then approve the finished work.",
    href: () => "/teacher",
    cta: "Open teacher dashboard",
  },
  {
    id: "claim",
    title: "Claim and split the reward",
    body: "Back as the student, choose how much goes to Spend, Save and Grow.",
    href: (sid) => (sid ? `/student/${sid}` : "/join"),
    cta: "Go to student home",
  },
  {
    id: "advance",
    title: "Start a new week",
    body: "As the teacher, start the next week and watch Grow tokens earn interest.",
    href: () => "/teacher",
    cta: "Open teacher dashboard",
  },
  {
    id: "buy",
    title: "Buy a reward",
    body: "Spend tokens in the reward shop, then find it in your activity.",
    href: (sid) => (sid ? `/student/${sid}/shop` : "/join"),
    cta: "Visit the shop",
  },
];

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90" aria-hidden>
      <circle cx="12" cy="12" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="#aee2c2"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - done / total)}
        className="transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}

/** Floating first-visit checklist that tracks real actions in the app */
export function GettingStarted() {
  useStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStudentId(localStorage.getItem("student_session"));
  }, [pathname]);

  if (!mounted || isTourDismissed()) return null;

  const tour = getTour();
  const done = STEPS.filter((s) => tour[s.id]).length;
  const next = STEPS.find((s) => !tour[s.id]);
  const allDone = !next;
  // Student pages have a 16rem sidebar on desktop; sit just to the right of it
  const inStudentApp = pathname.startsWith("/student/") && !pathname.endsWith("/login");

  return (
    <div
      className={`fixed z-[45] bottom-4 left-4 lg:bottom-6 flex flex-col items-start gap-3 max-w-[calc(100vw-2rem)] ${
        inStudentApp ? "lg:left-[calc(16rem+1.5rem)]" : "lg:left-6"
      }`}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Getting started"
          className="w-[340px] max-w-full bg-surface rounded-[1.75rem] border border-line shadow-lift p-5 animate-fade-up"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl tracking-tight leading-tight">
                {allDone ? "You've seen it all" : "Explore Finity"}
              </p>
              <p className="text-sm text-muted mt-0.5 num">
                {allDone ? "Nice work. Keep playing or start fresh any time." : `${done} of ${STEPS.length} done`}
              </p>
            </div>
            <div className="flex items-center gap-1 -mr-2 -mt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper"
                aria-label="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTourDismissed(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper"
                aria-label="Hide checklist"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ol className="mt-4 space-y-1">
            {STEPS.map((step, i) => {
              const isDone = !!tour[step.id];
              const isNext = step === next;
              return (
                <li key={step.id} className={`rounded-2xl p-3 ${isNext ? "bg-paper" : ""}`}>
                  <div className="flex gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs num ${
                        isDone ? "bg-ink text-white" : "border-[1.5px] border-line-strong text-muted"
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[15px] leading-snug ${isDone ? "text-muted line-through decoration-line-strong" : "font-medium"}`}>
                        {step.title}
                      </p>
                      {isNext && (
                        <>
                          <p className="text-sm text-muted mt-1 leading-relaxed">{step.body}</p>
                          <Link
                            href={step.href(studentId)}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 mt-2 text-sm font-medium hover:gap-2 transition-all"
                          >
                            {step.cta} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-2.5 h-11 pl-2 pr-4 rounded-full bg-ink text-white shadow-lift hover:bg-ink-soft transition-colors"
      >
        {allDone ? (
          <span className="w-6 h-6 rounded-full bg-mint text-ink flex items-center justify-center">
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </span>
        ) : (
          <ProgressRing done={done} total={STEPS.length} />
        )}
        <span className="text-sm font-medium">{allDone ? "All done" : "Getting started"}</span>
        {!allDone && <span className="text-sm text-white/60 num">{done}/{STEPS.length}</span>}
      </button>
    </div>
  );
}
