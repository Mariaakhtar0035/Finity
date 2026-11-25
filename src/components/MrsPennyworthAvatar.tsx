"use client";

import React, { useId } from "react";

export type MrsPennyworthState =
  | "idle"
  | "thinking"
  | "speaking"
  | "encouraging"
  | "celebration";

const INK = "#141414";
const SKIN = "#f5d2b3";
const HAIR = "#4a3128";
const VEST = "#3a3f55";

/**
 * Original Mrs. Pennyworth portrait, drawn in the Finity doodle style:
 * a young startup-founder type — long hair tucked behind one ear, fleece vest over a tee, and a coin "logo" patch.
 */
export function PennyworthPortrait({
  thinking = false,
  className = "",
}: {
  thinking?: boolean;
  className?: string;
}) {
  const clipId = useId();
  // Pupils glance up and to the side while thinking
  const eyeY = thinking ? 60 : 62;
  const eyeDX = thinking ? 1.5 : 0;

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* background */}
        <circle cx="60" cy="60" r="60" fill="#f6c88f" stroke="none" />

        {/* long hair (back) */}
        <path d="M32 62C30 37 44 24 60 24S90 37 88 62L93 118C85 124 76 122 72 116H48C44 122 35 124 27 118Z" fill={HAIR} />

        {/* neck */}
        <path d="M53 82v16h14V82" fill={SKIN} />

        {/* tee */}
        <path d="M14 128c2-20 18-31 46-31s44 11 46 31Z" fill="#aee2c2" />
        <path d="M51 97.5q9 7 18 0" fill="none" strokeWidth="2" />

        {/* fleece vest */}
        <path d="M14 128c2-17 10-27 25-30l13 4 2 26Z" fill={VEST} />
        <path d="M106 128c-2-17-10-27-25-30l-13 4-2 26Z" fill={VEST} />
        <path d="M54 104v24M66 104v24" fill="none" stroke="#5d6380" strokeWidth="1.5" strokeDasharray="1.5 2.5" />
        <rect x="64.5" y="106" width="3.5" height="6" rx="1.5" fill="#c9c6bf" strokeWidth="1.5" />
        {/* coin "logo" patch */}
        <circle cx="84" cy="112" r="4.5" fill="#f6c88f" strokeWidth="2" />
        <path d="M82.3 110.6c.5-.9 1.5-1.3 2.5-1.2" fill="none" stroke="#fff" strokeWidth="1.4" />

        {/* long front lock over her shoulder */}
        <path d="M37 58C33 78 30 98 27 122L42 124C44 104 45 84 44 66Z" fill={HAIR} />
        <path d="M38 80c-1 12-3 24-5 36" fill="none" stroke="#7a5a4c" strokeWidth="1.8" />

        {/* ear tucked behind hair */}
        <ellipse cx="84" cy="65" rx="5" ry="6.5" fill={SKIN} />

        {/* face */}
        <ellipse cx="60" cy="63" rx="24" ry="24" fill={SKIN} />

        {/* curtain bangs */}
        <path
          d="M35 64C33 42 45 31 60 31S87 41 85 60C80 50 72 45 64 45C62 45 60.5 46 60 48C59 45.5 56 45 52 46C44 48 38 54 35 64Z"
          fill={HAIR}
        />
        <path d="M60 33v13" fill="none" stroke="#7a5a4c" strokeWidth="1.8" />
        <path d="M41 46c3-6 8-10 14-12" fill="none" stroke="#fff" strokeWidth="2.2" opacity="0.35" />

        {/* brows */}
        <path d={thinking ? "M44 52q4-3.5 9-2" : "M45 54q4-2.5 8-.5"} fill="none" stroke={HAIR} strokeWidth="2.2" />
        <path d="M67 53.5q4-2 8 .5" fill="none" stroke={HAIR} strokeWidth="2.2" />

        {/* eyes with sparkle and lashes */}
        <ellipse cx={50 + eyeDX} cy={eyeY} rx="3.4" ry="4.4" fill={INK} stroke="none" />
        <ellipse cx={70 + eyeDX} cy={eyeY} rx="3.4" ry="4.4" fill={INK} stroke="none" />
        <circle cx={51.2 + eyeDX} cy={eyeY - 1.7} r="1.3" fill="#fff" stroke="none" />
        <circle cx={71.2 + eyeDX} cy={eyeY - 1.7} r="1.3" fill="#fff" stroke="none" />
        <path
          d={`M${46.8 + eyeDX} ${eyeY - 1}l-2.8-1.6M${73.2 + eyeDX} ${eyeY - 1}l2.8-1.6`}
          fill="none"
          strokeWidth="1.8"
        />

        {/* rosy cheeks */}
        <ellipse cx="43" cy="70" rx="5" ry="3.6" fill="#f2b0cf" stroke="none" />
        <ellipse cx="77" cy="70" rx="5" ry="3.6" fill="#f2b0cf" stroke="none" />

        {/* tiny nose */}
        <path d="M58.5 67q1.5 1.5 3 0" fill="none" strokeWidth="2" />

        {/* mouth */}
        {thinking ? (
          <ellipse cx="62" cy="75.5" rx="2.4" ry="2.8" fill="#7a3236" strokeWidth="2" />
        ) : (
          <>
            <path d="M53 72.5q7 1.4 14 0q-1 7.5-7 7.5t-7-7.5Z" fill="#7a3236" strokeWidth="2" />
            <path d="M56 77.6q4-2.6 8 0q-1.8 2.2-4 2.2t-4-2.2Z" fill="#f2b0cf" stroke="none" />
          </>
        )}
      </g>
    </svg>
  );
}

interface MrsPennyworthAvatarProps {
  state?: MrsPennyworthState;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-7 h-7",
  sm: "w-9 h-9",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export function MrsPennyworthAvatar({
  state = "idle",
  size = "md",
  className = "",
}: MrsPennyworthAvatarProps) {
  const thinking = state === "thinking";
  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full overflow-hidden shrink-0 border border-line ${
        thinking ? "pennyworth-thinking" : ""
      } ${state === "celebration" ? "animate-pop-in" : ""} ${className}`}
      role="img"
      aria-label="Mrs. Pennyworth"
    >
      <PennyworthPortrait thinking={thinking} className="w-full h-full block" />
    </div>
  );
}
