import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const SIZES = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-10 h-10" };

export function Loading({ size = "md", text }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <div
        className={`${SIZES[size]} rounded-full border-2 border-line-strong border-t-ink animate-spin`}
        aria-hidden
      />
      {text && <p className="text-sm text-muted">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-[var(--radius-card)] border border-line p-6 animate-pulse">
      <div className="h-24 bg-paper rounded-2xl mb-5" />
      <div className="h-5 bg-paper rounded-full w-2/3 mb-3" />
      <div className="h-4 bg-paper rounded-full w-full mb-2" />
      <div className="h-4 bg-paper rounded-full w-4/5 mb-6" />
      <div className="h-11 bg-paper rounded-full w-full" />
    </div>
  );
}
