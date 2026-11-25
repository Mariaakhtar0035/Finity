import React from "react";
import { ArrowDownLeft, ArrowLeftRight, ShoppingBag, SlidersHorizontal, Sprout, type LucideIcon } from "lucide-react";
import type { ActivityEntry } from "@/types";

const KIND: Record<ActivityEntry["kind"], { icon: LucideIcon; bg: string }> = {
  earned: { icon: ArrowDownLeft, bg: "bg-peach-soft" },
  spent: { icon: ShoppingBag, bg: "bg-pink-soft" },
  moved: { icon: ArrowLeftRight, bg: "bg-periwinkle-soft" },
  interest: { icon: Sprout, bg: "bg-mint-soft" },
  adjusted: { icon: SlidersHorizontal, bg: "bg-lavender-soft" },
};

function signed(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

/** "Spend +56 · Save +22 · Grow +34" for the non-zero buckets */
function breakdown(e: ActivityEntry): string {
  return (
    [
      ["Spend", e.spend],
      ["Save", e.save],
      ["Grow", e.grow],
    ] as const
  )
    .filter(([, v]) => v !== 0)
    .map(([label, v]) => `${label} ${signed(v)}`)
    .join(" · ");
}

interface ActivityFeedProps {
  entries: ActivityEntry[];
  limit?: number;
  emptyText?: string;
}

export function ActivityFeed({ entries, limit, emptyText = "Nothing here yet." }: ActivityFeedProps) {
  const shown = limit ? entries.slice(0, limit) : entries;
  if (shown.length === 0) return <p className="text-muted py-6">{emptyText}</p>;

  return (
    <ul className="divide-y divide-line">
      {shown.map((e) => {
        const { icon: Icon, bg } = KIND[e.kind];
        const net = e.spend + e.save + e.grow;
        return (
          <li key={e.id} className="flex items-center gap-4 py-4">
            <span className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{e.title}</p>
              <p className="text-sm text-muted truncate num">
                Week {e.week} · {breakdown(e)}
              </p>
            </div>
            {e.kind === "moved" ? (
              <span className="text-sm text-muted">Moved</span>
            ) : (
              <span className={`font-display text-xl num ${net > 0 ? "text-positive" : "text-ink"}`}>{signed(net)}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
