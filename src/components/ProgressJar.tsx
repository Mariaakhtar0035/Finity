import React, { useId } from "react";

const INK = "#141414";

/**
 * Doodle-style savings jar that fills with coins as progress goes from 0 to 1.
 * Coins stack from the bottom; a dashed line marks the goal at the top.
 */
export function ProgressJar({ progress, className = "" }: { progress: number; className?: string }) {
  const clipId = useId();
  const p = Math.max(0, Math.min(1, progress));
  // Inside of the jar runs from y=150 (bottom) to y=54 (goal line)
  const fillTop = 150 - p * 96;
  const coinRows = Math.round(p * 8);
  const COIN_FILLS = ["#b6c1f5", "#f6c88f", "#aee2c2"];

  return (
    <svg viewBox="0 0 140 180" className={className} role="img" aria-label={`Savings jar ${Math.round(p * 100)}% full`}>
      <defs>
        <clipPath id={clipId}>
          <path d="M28 52c0-6 5-9 10-9h64c5 0 10 3 10 9v92c0 10-8 16-18 16H46c-10 0-18-6-18-16Z" />
        </clipPath>
      </defs>

      {/* shadow */}
      <ellipse cx="74" cy="170" rx="52" ry="7" fill={INK} />

      {/* glass */}
      <path d="M28 52c0-6 5-9 10-9h64c5 0 10 3 10 9v92c0 10-8 16-18 16H46c-10 0-18-6-18-16Z" fill="#fff" />

      {/* fill + stacked coins, clipped to the jar */}
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="20"
          y={fillTop}
          width="100"
          height={160 - fillTop}
          fill="#e9ecfc"
          style={{ transition: "y 0.8s cubic-bezier(.2,.8,.2,1), height 0.8s cubic-bezier(.2,.8,.2,1)" }}
        />
        {Array.from({ length: coinRows }, (_, i) => {
          const y = 146 - i * 12;
          const x = i % 2 === 0 ? 54 : 84;
          return (
            <g key={i} className="animate-pop-in" style={{ animationDelay: `${i * 60}ms` }}>
              <ellipse cx={x} cy={y} rx="17" ry="6.5" fill={COIN_FILLS[i % 3]} stroke={INK} strokeWidth="2.5" />
            </g>
          );
        })}
      </g>

      {/* goal line */}
      <path d="M34 54h72" stroke={INK} strokeWidth="2" strokeDasharray="4 5" opacity="0.35" />

      {/* outline, lid, label, shine */}
      <path
        d="M28 52c0-6 5-9 10-9h64c5 0 10 3 10 9v92c0 10-8 16-18 16H46c-10 0-18-6-18-16Z"
        fill="none"
        stroke={INK}
        strokeWidth="3"
      />
      <rect x="34" y="22" width="72" height="20" rx="6" fill="#b6c1f5" stroke={INK} strokeWidth="3" />
      <path d="M58 32h24" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M37 64v44" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}
