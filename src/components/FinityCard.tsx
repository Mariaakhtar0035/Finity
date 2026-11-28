"use client";

import React, { useEffect, useRef, useState } from "react";
import { Coin, TOKEN_META, TokenType } from "@/components/ui/Coin";
import { LogoMark } from "@/components/ui/LogoMark";
import { Wordmark } from "@/components/ui/Logo";

interface FinityCardProps {
  name?: string;
  subtitle?: string;
  /** Tilt the card in 3D like it's resting on a table */
  tilted?: boolean;
  /** Tilt toward the cursor and flip on click to reveal balances */
  interactive?: boolean;
  balances?: Record<TokenType, number>;
  week?: number;
  className?: string;
}

const SHAPE = "rounded-[7%/11%] border-[3px] border-ink overflow-hidden";
const FACE_STYLE: React.CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

const FLIP_MS = 1000;
/** Slow in, quick through the middle, long soft landing */
const FLIP_EASING = "cubic-bezier(0.5, 0.05, 0.2, 1)";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Soft white highlight that follows the cursor; sits above the card artwork */
function Glare({ x, y, show }: { x: number; y: number; show: boolean }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.65), rgba(255,255,255,0) 55%)`,
        opacity: show ? 0.85 : 0,
        transition: "opacity 0.5s ease",
        mixBlendMode: "soft-light",
      }}
    />
  );
}

/**
 * Finity student card: pearl card with a holographic serif "F", a chip and the
 * student's name, drawn with the same thick ink outline as the doodles.
 * Interactive cards tilt toward the cursor and flip to show balances.
 */
export function FinityCard({
  name = "Alex",
  subtitle = "Student · Grade 4",
  tilted = false,
  interactive = false,
  balances = { spend: 165, save: 60, grow: 95 },
  week = 12,
  className = "",
}: FinityCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });
  const flipRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const displayName = name.trim() || "Your name";

  const base = tilted ? { x: 10, y: -16, z: -7 } : { x: 0, y: 0, z: 0 };
  // While the card is turning, ignore the cursor so the two motions don't fight
  const follow = tilt.active && !flipping;
  const rx = base.x - (follow ? tilt.y * 14 : 0);
  const ry = base.y + (follow ? tilt.x * 20 : 0);

  const tiltTransform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${base.z}deg)`;
  // Short while following the cursor, long and soft when easing back to rest
  const tiltTransition = follow ? "transform 0.25s ease-out" : "transform 0.9s cubic-bezier(.2,.8,.2,1)";

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || reduced || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5, active: true });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0, active: false });

  const flip = () => {
    if (!interactive || flipping) return;
    const next = !flipped;
    const el = flipRef.current;

    if (el && !reduced && typeof el.animate === "function") {
      const from = flipped ? 180 : 0;
      const to = next ? 180 : 0;
      setFlipping(true);
      // Lift toward the viewer as it turns, then settle back down
      const anim = el.animate(
        [
          { transform: `translateZ(0px) rotateY(${from}deg) scale(1)` },
          { transform: `translateZ(60px) rotateY(${(from + to) / 2}deg) scale(1.06)`, offset: 0.5 },
          { transform: `translateZ(0px) rotateY(${to}deg) scale(1)` },
        ],
        { duration: FLIP_MS, easing: FLIP_EASING },
      );
      const done = () => setFlipping(false);
      anim.onfinish = done;
      anim.oncancel = done;

      // The shadow slab turns by the same angle on the same clock, inside the same tilt,
      // so it's always exactly as wide as the card and goes edge-on at the same instant
      shadowRef.current?.animate(
        [{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${to}deg)` }],
        { duration: FLIP_MS, easing: FLIP_EASING },
      );
    }
    setFlipped(next);
  };

  // Mirror the glare horizontally on the back face so it follows the cursor there too
  const glareX = (tilt.x + 0.5) * 100;
  const glareY = (tilt.y + 0.5) * 100;

  return (
    <div
      className={`relative @container ${className}`}
      style={{ perspective: "1400px" }}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
    >
      {/* Solid ink shadow: its own flat layer under the card so the turning card can never
          clip into it. It tilts with the card and turns in step with it. */}
      {tilted && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            transform: `translate(12px, 16px) ${tiltTransform}`,
            transition: tiltTransition,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            ref={shadowRef}
            className="absolute inset-0 rounded-[7%/11%] bg-ink"
            style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}
          />
        </div>
      )}

      <div
        className={`relative aspect-[1.586] w-full ${interactive ? "cursor-pointer" : ""}`}
        style={{
          transformStyle: "preserve-3d",
          transform: tiltTransform,
          transition: tiltTransition,
          willChange: "transform",
        }}
        {...(interactive
          ? {
              role: "button",
              tabIndex: 0,
              "aria-pressed": flipped,
              "aria-label": `Finity student card for ${displayName}. ${flipped ? "Showing balances." : ""} Press to flip.`,
              onClick: flip,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  flip();
                }
              },
            }
          : { role: "img", "aria-label": `Finity student card for ${displayName}` })}
      >
        {/* The flipping part. Its resting angle is set here; the turn itself is animated in flip() */}
        <div
          ref={flipRef}
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${flipped ? 180 : 0}deg)`,
            willChange: "transform",
          }}
        >
          {/* ---------- Front ---------- */}
          <div
            className={`absolute inset-0 ${SHAPE}`}
            style={{ ...FACE_STYLE, background: "linear-gradient(135deg, #fdfcf9 0%, #f1efe9 55%, #e8e6df 100%)" }}
          >
            <span
              aria-hidden
              className="absolute font-display leading-none select-none finity-holo"
              style={{ fontSize: "50cqw", right: "7%", top: "-2%", fontWeight: 600 }}
            >
              F
            </span>
            <span aria-hidden className="absolute inset-0 finity-sheen" />

            <div className="absolute left-[6%] top-[9%] flex items-center gap-[0.35em]" style={{ fontSize: "4.2cqw" }}>
              <LogoMark size="1.5em" />
              <Wordmark className="text-ink" />
            </div>

            <svg viewBox="0 0 60 46" className="absolute left-[7%] top-[38%] w-[15%]" aria-hidden>
              <rect x="2" y="2" width="56" height="42" rx="8" fill="#f1dc8a" stroke="#141414" strokeWidth="2.5" />
              <path d="M2 16h16M2 30h16M42 16h16M42 30h16M18 2v42M42 2v42M18 23h24" stroke="#141414" strokeWidth="1.8" opacity="0.55" />
            </svg>

            <div className="absolute left-[7%] bottom-[9%] max-w-[60%]" style={{ fontSize: "3.6cqw" }}>
              <p className="font-medium tracking-[0.14em] uppercase text-ink leading-tight truncate">{displayName}</p>
              <p className="text-ink-soft tracking-wide leading-tight mt-[0.2em]" style={{ fontSize: "0.78em" }}>
                {subtitle}
              </p>
            </div>

            <div className="absolute right-[6%] bottom-[9%] flex -space-x-[0.4em]" style={{ fontSize: "5cqw" }}>
              {(["spend", "save", "grow"] as const).map((t) => (
                <Coin key={t} type={t} size={0} className="w-[1.3em] h-[1.3em]" />
              ))}
            </div>

            <Glare x={glareX} y={glareY} show={follow && !flipped} />
          </div>

          {/* ---------- Back ---------- */}
          <div
            className={`absolute inset-0 ${SHAPE}`}
            style={{
              ...FACE_STYLE,
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #eef0fd 0%, #e3e7fb 100%)",
            }}
          >
            <div className="absolute inset-x-0 top-[10%] h-[17%] bg-ink" />
            <div className="absolute inset-x-[7%] top-[34%] space-y-[2.2cqw]" style={{ fontSize: "4cqw" }}>
              {(["spend", "save", "grow"] as const).map((t) => (
                <div key={t} className="flex items-center gap-[0.5em]">
                  <Coin type={t} size={0} className="w-[1.25em] h-[1.25em]" />
                  <span className="flex-1 text-ink-soft">{TOKEN_META[t].label}</span>
                  <span className="font-display text-ink num" style={{ fontSize: "1.25em" }}>
                    {balances[t]}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="absolute inset-x-[7%] bottom-[7%] flex items-center justify-between text-ink-soft"
              style={{ fontSize: "3cqw" }}
            >
              <span>Week {week}</span>
              <span>{interactive ? "Tap to flip back" : ""}</span>
            </div>

            <Glare x={100 - glareX} y={glareY} show={follow && flipped} />
          </div>
        </div>
      </div>
    </div>
  );
}
