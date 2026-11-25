"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { TypingDots } from "@/components/ui/Feedback";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";
import { getFallbackText } from "@/lib/gemini";
import type { BalanceHistoryEntry, Reward } from "@/types";

const CACHE_KEY_PREFIX = "mrs-pennyworth-spending-insight";

function getCacheKey(studentId?: string): string {
  return `${CACHE_KEY_PREFIX}-${studentId ?? "default"}`;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

interface SpendingBehaviorCardProps {
  studentId?: string;
  studentName: string;
  history: BalanceHistoryEntry[];
  purchasedRewardItems: Reward[];
  currentSpend: number;
  currentSave: number;
  currentGrow: number;
  saveGoal?: number;
  availableRewards?: Array<{ title: string; cost: number }>;
}

const SPENDING_BEHAVIOR_FALLBACK =
  "Here's a tip: try saving a little before you spend. Your future self will thank you!";

const DOT_COLORS = ["#f6c88f", "#aee2c2", "#b6c1f5", "#d6c6f4"];

/** Splits the model's text into paragraphs and drops a trailing cut-off line */
function toParagraphs(text: string): string[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const last = lines[lines.length - 1];
  if (lines.length > 1 && last && !/[.!?]$/.test(last)) return lines.slice(0, -1);
  return lines;
}

export function SpendingBehaviorCard({
  studentId,
  studentName,
  history,
  purchasedRewardItems,
  currentSpend,
  currentSave,
  currentGrow,
  saveGoal,
  availableRewards = [],
}: SpendingBehaviorCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = getCacheKey(studentId);
    const today = getToday();

    function tryRestoreFromCache(): boolean {
      if (typeof window === "undefined") return false;
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return false;
        const parsed = JSON.parse(raw) as { insight?: string; date?: string };
        if (parsed.insight && parsed.date === today) {
          setInsight(parsed.insight);
          setLoading(false);
          return true;
        }
      } catch {
        // ignore parse errors
      }
      return false;
    }

    async function fetchInsight() {
      setLoading(true);
      try {
        const purchasedRewards = purchasedRewardItems.map((r) => ({ title: r.title, cost: r.cost }));
        const response = await fetch("/api/gemini/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "SPENDING_BEHAVIOR_INSIGHT",
            studentName,
            context: {
              history,
              purchasedRewards,
              currentSpend,
              currentSave,
              currentGrow,
              saveGoal,
              availableRewards,
            },
          }),
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const text = data.explanation ?? SPENDING_BEHAVIOR_FALLBACK;
        if (isMounted) {
          setInsight(text);
          if (typeof window !== "undefined") {
            localStorage.setItem(cacheKey, JSON.stringify({ insight: text, date: today }));
          }
        }
      } catch {
        if (isMounted) setInsight(getFallbackText("SPENDING_BEHAVIOR_INSIGHT"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (tryRestoreFromCache()) return;
    fetchInsight();
    return () => {
      isMounted = false;
    };
    // Only refetch when the student changes; the rest is read from the latest props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const paragraphs = toParagraphs(insight ?? SPENDING_BEHAVIOR_FALLBACK);

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <MrsPennyworthAvatar size="md" state={loading ? "thinking" : "idle"} />
        <div>
          <h2 className="font-display text-2xl tracking-tight leading-tight">Today&apos;s insights</h2>
          <p className="text-sm text-muted">From Mrs. Pennyworth</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <TypingDots label="Looking at your habits" />
          <div className="h-4 bg-paper rounded-full w-full animate-pulse" />
          <div className="h-4 bg-paper rounded-full w-5/6 animate-pulse" />
          <div className="h-4 bg-paper rounded-full w-2/3 animate-pulse" />
        </div>
      ) : (
        <ul className="space-y-4">
          {paragraphs.map((paragraph, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="mt-2 w-2.5 h-2.5 rounded-full border-[1.5px] border-ink shrink-0"
                style={{ background: DOT_COLORS[i % DOT_COLORS.length] }}
                aria-hidden
              />
              <p className="text-[15px] leading-relaxed text-ink-soft">{paragraph}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
