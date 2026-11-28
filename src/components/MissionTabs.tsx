"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The three Missions pages share one spot in the nav and switch with these tabs */
export function MissionTabs({ studentId }: { studentId: string }) {
  const pathname = usePathname();
  const base = `/student/${studentId}`;
  const tabs = [
    { href: `${base}/marketplace`, label: "Find missions" },
    { href: `${base}/missions`, label: "My activity" },
    { href: `${base}/leaderboard`, label: "Market trends" },
  ];
  return (
    <nav aria-label="Missions" className="mb-8 -mx-1 px-1 overflow-x-auto [scrollbar-width:none]">
      <div className="inline-flex p-1 rounded-full bg-surface border border-line">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`h-9 px-4 rounded-full text-sm flex items-center whitespace-nowrap transition-colors ${
                active ? "bg-ink text-white" : "text-ink-soft hover:text-ink hover:bg-paper"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
