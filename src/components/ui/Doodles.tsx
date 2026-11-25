import React from "react";

/*
 * Flat pastel illustrations with a thick ink outline and a solid ink
 * "cast shadow" — playful details that sit inside an otherwise calm UI.
 */

const INK = "#141414";
const SW = 3; // stroke width

interface DoodleProps {
  className?: string;
  style?: React.CSSProperties;
}

export function PiggyDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 160" className={className} style={style} aria-hidden>
      <ellipse cx="104" cy="146" rx="70" ry="9" fill={INK} />
      {/* legs */}
      <rect x="52" y="112" width="22" height="32" rx="8" fill="#e98fb8" stroke={INK} strokeWidth={SW} />
      <rect x="122" y="112" width="22" height="32" rx="8" fill="#e98fb8" stroke={INK} strokeWidth={SW} />
      {/* tail */}
      <path d="M168 84c14-4 16 12 6 12s-4-16 10-14" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* body */}
      <ellipse cx="100" cy="88" rx="70" ry="48" fill="#f2b0cf" stroke={INK} strokeWidth={SW} />
      {/* ear */}
      <path d="M62 50 56 24l28 16" fill="#e98fb8" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {/* coin slot */}
      <path d="M86 44h30" stroke={INK} strokeWidth={SW + 1} strokeLinecap="round" />
      {/* snout */}
      <ellipse cx="34" cy="92" rx="14" ry="18" fill="#e98fb8" stroke={INK} strokeWidth={SW} />
      <ellipse cx="30" cy="86" rx="2.5" ry="4" fill={INK} />
      <ellipse cx="38" cy="96" rx="2.5" ry="4" fill={INK} />
      {/* eye */}
      <circle cx="64" cy="72" r="4.5" fill={INK} />
      {/* shine */}
      <path d="M130 58c10 4 16 12 18 20" fill="none" stroke="#fff" strokeWidth={SW + 1} strokeLinecap="round" />
    </svg>
  );
}

export function CoinStackDoodle({ className = "", style }: DoodleProps) {
  const coin = (y: number, fill: string) => (
    <g key={y}>
      <path d={`M30 ${y}v12c0 8 22 14 50 14s50-6 50-14v-12`} fill="#e2a55c" stroke={INK} strokeWidth={SW} />
      <ellipse cx="80" cy={y} rx="50" ry="14" fill={fill} stroke={INK} strokeWidth={SW} />
    </g>
  );
  return (
    <svg viewBox="0 0 160 150" className={className} style={style} aria-hidden>
      <ellipse cx="86" cy="138" rx="62" ry="9" fill={INK} />
      {coin(110, "#f6c88f")}
      {coin(88, "#f6c88f")}
      {coin(66, "#f6c88f")}
      {coin(44, "#f6c88f")}
      {/* face on top coin */}
      <circle cx="68" cy="42" r="3" fill={INK} />
      <path d="M86 41c2-2.5 6-2.5 8 0" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M70 48c5 4 15 4 20 0" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export function SproutDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 140 170" className={className} style={style} aria-hidden>
      <ellipse cx="74" cy="160" rx="48" ry="8" fill={INK} />
      {/* stem */}
      <path d="M70 98c0-22 2-40 4-58" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      {/* leaves */}
      <path d="M72 70C46 74 26 62 22 38c26-4 46 8 50 32Z" fill="#aee2c2" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M74 52c2-26 20-42 46-40-2 26-20 42-46 40Z" fill="#7fd0a1" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M36 44c10 4 20 12 30 20M110 22c-8 8-16 16-28 24" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity="0.5" />
      {/* pot */}
      <path d="M34 112h76l-8 44H42Z" fill="#e5cfae" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x="28" y="96" width="88" height="20" rx="6" fill="#d9b98c" stroke={INK} strokeWidth={SW} />
    </svg>
  );
}

export function PencilDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 80" className={className} style={style} aria-hidden>
      <ellipse cx="108" cy="70" rx="80" ry="6" fill={INK} />
      <g transform="rotate(-12 100 40)">
        <rect x="40" y="24" width="120" height="30" rx="4" fill="#f4e297" stroke={INK} strokeWidth={SW} />
        <path d="M40 34h120M40 44h120" stroke={INK} strokeWidth={1.5} opacity="0.35" />
        <path d="M40 24 12 39l28 15Z" fill="#f6dfc0" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M21 34 12 39l9 5Z" fill={INK} />
        <rect x="160" y="22" width="16" height="34" rx="4" fill="#c9c6bf" stroke={INK} strokeWidth={SW} />
        <rect x="176" y="22" width="18" height="34" rx="7" fill="#f2b0cf" stroke={INK} strokeWidth={SW} />
      </g>
    </svg>
  );
}

export function StarDoodle({ className = "", style, fill = "#d6c6f4" }: DoodleProps & { fill?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} style={style} aria-hidden>
      <path
        d="M40 6l9.5 21.5L72 30l-17 15.5 5 23L40 56.5 20 68.5l5-23L8 30l22.5-2.5Z"
        fill={fill}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function JarDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 130 160" className={className} style={style} aria-hidden>
      <ellipse cx="70" cy="150" rx="50" ry="8" fill={INK} />
      {/* jar */}
      <path d="M24 44c0-6 6-8 10-8h62c4 0 10 2 10 8v86c0 10-8 16-18 16H42c-10 0-18-6-18-16Z" fill="#e9ecfc" stroke={INK} strokeWidth={SW} />
      {/* coins inside */}
      <ellipse cx="50" cy="128" rx="16" ry="6" fill="#b6c1f5" stroke={INK} strokeWidth={2.5} />
      <ellipse cx="78" cy="124" rx="16" ry="6" fill="#f6c88f" stroke={INK} strokeWidth={2.5} />
      <ellipse cx="64" cy="112" rx="16" ry="6" fill="#aee2c2" stroke={INK} strokeWidth={2.5} />
      <ellipse cx="62" cy="98" rx="16" ry="6" fill="#b6c1f5" stroke={INK} strokeWidth={2.5} />
      {/* lid */}
      <rect x="30" y="18" width="70" height="20" rx="6" fill="#b6c1f5" stroke={INK} strokeWidth={SW} />
      {/* label */}
      <rect x="40" y="58" width="50" height="24" rx="5" fill="#fff" stroke={INK} strokeWidth={2.5} />
      <path d="M50 70h30" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {/* shine */}
      <path d="M34 56v40" stroke="#fff" strokeWidth={SW + 1} strokeLinecap="round" />
    </svg>
  );
}

export function TrophyDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 140 160" className={className} style={style} aria-hidden>
      <ellipse cx="74" cy="150" rx="44" ry="7" fill={INK} />
      <path d="M36 40H18c0 22 10 34 26 36M104 40h18c0 22-10 34-26 36" fill="none" stroke={INK} strokeWidth={SW} />
      <path d="M36 22h68v34c0 22-14 38-34 38S36 78 36 56Z" fill="#f4e297" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M62 94h16v20H62Z" fill="#e6cf6a" stroke={INK} strokeWidth={SW} />
      <rect x="40" y="114" width="60" height="26" rx="6" fill="#d6c6f4" stroke={INK} strokeWidth={SW} />
      <path d="M50 34v22" stroke="#fff" strokeWidth={SW + 1} strokeLinecap="round" />
    </svg>
  );
}

export function BagDoodle({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 130 150" className={className} style={style} aria-hidden>
      <ellipse cx="68" cy="140" rx="48" ry="7" fill={INK} />
      <path d="M44 46c0-18 8-28 20-28s20 10 20 28" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <path d="M18 46h92l-8 86H26Z" fill="#a9d9ef" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx="46" cy="64" r="4" fill={INK} />
      <circle cx="82" cy="64" r="4" fill={INK} />
      <path d="M50 90c8 8 20 8 28 0" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
    </svg>
  );
}
