"use client";

import React from "react";

const AVATAR_FILLS = [
  "#f6c88f", // peach
  "#b6c1f5", // periwinkle
  "#aee2c2", // mint
  "#d6c6f4", // lavender
  "#f2b0cf", // pink
  "#f4e297", // butter
  "#a9d9ef", // sky
  "#e5cfae", // sand
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface StudentAvatarProps {
  studentId: string;
  studentName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** @deprecated all avatars use the pastel palette now */
  palette?: "default" | "pastel";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-8 h-8 text-sm border-[1.5px]",
  sm: "w-10 h-10 text-base border-2",
  md: "w-14 h-14 text-2xl border-2",
  lg: "w-20 h-20 text-4xl border-[2.5px]",
  xl: "w-28 h-28 text-5xl border-[3px]",
};

export function StudentAvatar({
  studentId,
  studentName,
  size = "md",
  className = "",
}: StudentAvatarProps) {
  const fill = AVATAR_FILLS[hashString(studentId) % AVATAR_FILLS.length];
  const initial = (studentName?.charAt(0) || "?").toUpperCase();

  return (
    <div
      className={`shrink-0 rounded-full border-ink flex items-center justify-center font-display text-ink leading-none ${SIZE_CLASSES[size]} ${className}`}
      style={{ background: fill }}
      role="img"
      aria-label={`${studentName}'s avatar`}
    >
      <span className="-mt-[0.06em]">{initial}</span>
    </div>
  );
}
