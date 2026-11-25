import React from "react";
import { MissionStatus } from "@/types";

type BadgeType = MissionStatus | "popular" | "high_demand" | "locked" | "assigned" | "neutral";

interface BadgeProps {
  status?: MissionStatus;
  type?: BadgeType;
  className?: string;
  label?: string;
}

const CONFIG: Record<BadgeType, { className: string; dot: string; label: string }> = {
  AVAILABLE: { className: "bg-paper text-ink-soft", dot: "bg-faint", label: "Available" },
  REQUESTED: { className: "bg-butter-soft text-ink", dot: "bg-[#d9b92e]", label: "Requested" },
  IN_PROGRESS: { className: "bg-periwinkle-soft text-ink", dot: "bg-periwinkle-deep", label: "In progress" },
  COMPLETED: { className: "bg-mint-soft text-ink", dot: "bg-mint-deep", label: "Completed" },
  popular: { className: "bg-pink-soft text-ink", dot: "bg-[#e07aa9]", label: "Popular" },
  high_demand: { className: "bg-peach-soft text-ink", dot: "bg-peach-deep", label: "In demand" },
  locked: { className: "bg-periwinkle-soft text-ink", dot: "bg-periwinkle-deep", label: "Locked" },
  assigned: { className: "bg-lavender-soft text-ink", dot: "bg-[#9b7fdc]", label: "Assigned" },
  neutral: { className: "bg-paper text-ink-soft", dot: "bg-faint", label: "" },
};

export function Badge({ status, type, className = "", label }: BadgeProps) {
  const config = CONFIG[type ?? status ?? "AVAILABLE"] ?? CONFIG.AVAILABLE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${config.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden />
      {label ?? config.label}
    </span>
  );
}
