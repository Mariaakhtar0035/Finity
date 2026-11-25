import React from "react";
import { JarDoodle } from "@/components/ui/Doodles";

interface EmptyStateProps {
  /** Illustration; defaults to the coin jar doodle */
  illustration?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`bg-surface rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-14 text-center ${className}`}
    >
      <div className="flex justify-center mb-5">
        {illustration ?? <JarDoodle className="w-20 h-auto" />}
      </div>
      <h2 className="font-display text-2xl tracking-tight text-ink mb-2">{title}</h2>
      <p className="text-muted max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
