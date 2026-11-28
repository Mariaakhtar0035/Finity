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
