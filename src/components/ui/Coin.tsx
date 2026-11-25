import React from "react";

export type TokenType = "spend" | "save" | "grow";

export const TOKEN_META: Record<
  TokenType,
  {
    label: string;
    short: string;
    description: string;
    face: string;
    edge: string;
    soft: string;
    chart: string;
  }
> = {
  spend: {
    label: "Spend",
    short: "Use now",
    description: "Ready to use in the reward shop.",
    face: "#f6c88f",
    edge: "#e2a55c",
    soft: "bg-peach-soft",
    chart: "#e2a55c",
  },
  save: {
    label: "Save",
    short: "Set aside",
    description: "Set aside for a goal you choose.",
    face: "#b6c1f5",
    edge: "#7f90e3",
    soft: "bg-periwinkle-soft",
    chart: "#7f90e3",
  },
  grow: {
    label: "Grow",
    short: "Locked & growing",
    description: "Locked away, earning 2% every week.",
    face: "#aee2c2",
    edge: "#5fbf88",
    soft: "bg-mint-soft",
    chart: "#3fa56b",
  },
};

interface CoinProps {
  type: TokenType;
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Hand-drawn style token coin: thick ink outline, flat pastel face,
 * visible edge for depth and a glyph per token type.
 */
export function Coin({ type, size = 32, className = "", title }: CoinProps) {
  const { face, edge } = TOKEN_META[type];
  const ink = "#141414";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={`shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* edge */}
      <ellipse cx="21.5" cy="21.5" rx="16" ry="16" fill={edge} stroke={ink} strokeWidth="2.2" />
      {/* face */}
      <circle cx="19" cy="19" r="16" fill={face} stroke={ink} strokeWidth="2.2" />
      {/* highlight */}
      <path d="M9.5 15.5a10.5 10.5 0 0 1 6-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />

      {type === "spend" && (
        <g stroke={ink} strokeWidth="2" strokeLinecap="round" fill="none">
          {/* winking smile */}
          <circle cx="14.5" cy="17" r="1.4" fill={ink} stroke="none" />
          <path d="M21.5 17.2c.8-1 2.4-1 3.2 0" />
          <path d="M13.5 22c1.6 2.6 7.4 2.8 9.6 0" />
        </g>
      )}

      {type === "save" && (
        <g stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* little padlock */}
          <path d="M15.5 17.5v-2.2a3.5 3.5 0 0 1 7 0v2.2" />
          <rect x="13.2" y="17.5" width="11.6" height="8.6" rx="2" fill="#fff" />
          <path d="M19 20.6v2.2" />
        </g>
      )}

      {type === "grow" && (
        <g stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* sprout */}
          <path d="M19 27v-8" fill="none" />
          <path d="M19 20.5c-4.2.3-6.5-2-6.6-5.6 3.8-.2 6.3 1.8 6.6 5.6Z" fill="#fff" />
          <path d="M19 19c.2-4 2.8-6.3 6.8-6.2-.1 4-2.6 6.3-6.8 6.2Z" fill="#fff" />
        </g>
      )}
    </svg>
  );
}
