"use client";

import { useEffect, useRef, useState } from "react";

/*
 * The big wordmark at the bottom of the landing page. Letters hop and pick up
 * a token colour when you point at (or tap) them, the coin dot flips and the
 * leaf sways. It waves once when it first scrolls into view.
 */

const COLORS = ["#f6c88f", "#b6c1f5", "#aee2c2", "#d6c6f4", "#f2b0cf", "#f4e297"];

type Letter = { ch: string; dot?: "coin" | "leaf" };
const LETTERS: Letter[] = [{ ch: "F" }, { ch: "ı", dot: "coin" }, { ch: "n" }, { ch: "ı", dot: "leaf" }, { ch: "t" }, { ch: "y" }];

/*
 * Small line drawings around the letters: thin even ink strokes with a touch
 * of colour, a lighter style than the chunky doodles elsewhere. They don't
 * move. Sizes and positions are in em so they scale with the wordmark.
 */
const LINE = { fill: "none", stroke: "#141414", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** A paper plane flying in over the F */
function Plane() {
  return (
    <svg viewBox="0 0 120 50" className="absolute pointer-events-none" style={{ left: "0.02em", top: "0em", width: "0.3em" }} {...LINE}>
      <path d="M4 40 C30 44 40 20 62 28 C74 32 74 42 66 40" strokeDasharray="3 5" strokeWidth="1.6" />
      <path d="M82 22 L116 8 L96 34 L90 25 Z" fill="#fff" />
      <path d="M116 8 L90 25 L88 33 L96 34" />
      <path d="M90 25 L82 22" />
    </svg>
  );
}

/** Two little sparkles: the coin dot is shining */
function Sparkles() {
  const star = "M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z";
  return (
    <>
      <svg viewBox="-2 -2 24 24" className="absolute pointer-events-none" style={{ left: "0.8em", top: "0.02em", width: "0.06em" }} {...LINE} strokeWidth={1.6}>
        <path d={star} fill="#fff" />
      </svg>
      <svg viewBox="-2 -2 24 24" className="absolute pointer-events-none" style={{ left: "0.85em", top: "0.14em", width: "0.038em" }} {...LINE} strokeWidth={1.8}>
        <path d={star} fill="#fff" />
      </svg>
    </>
  );
}

/** A dashed cloud above the "ty", balancing the plane */
function Cloud() {
  return (
    <svg viewBox="0 0 120 60" className="absolute pointer-events-none" style={{ left: "1.62em", top: "0.05em", width: "0.3em" }} {...LINE}>
      <path
        d="M22 50 C9 50 7 35 19 33 C17 19 35 15 41 25 C45 11 67 9 73 23 C83 15 99 21 97 33 C111 33 113 50 99 50 Z"
        fill="#fff"
        strokeDasharray="4 5"
      />
    </svg>
  );
}

export function FooterWordmark({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wave, setWave] = useState(false);
  const [tapped, setTapped] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setWave(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tap = (i: number) => {
    setTapped(null);
    requestAnimationFrame(() => setTapped(i));
  };

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative font-display font-medium leading-none whitespace-nowrap select-none text-line ${className}`}
    >
      <Plane />
      <Sparkles />
      <Cloud />
      {LETTERS.map((l, i) => (
        <span
          key={i}
          onPointerDown={() => tap(i)}
          onAnimationEnd={() => setTapped((t) => (t === i ? null : t))}
          className={`footer-letter relative inline-block cursor-default ${wave ? "footer-wave" : ""} ${tapped === i ? "footer-hop" : ""}`}
          style={{
            ["--c" as string]: COLORS[i % COLORS.length],
            animationDelay: wave && tapped !== i ? `${i * 90}ms` : undefined,
            // The coin dot needs a little room so it clears the F's top bar
            marginLeft: l.dot === "coin" ? "0.07em" : undefined,
          }}
        >
          {l.ch}
          {l.dot && (
            <span className="absolute left-1/2 -translate-x-1/2 top-[0.06em] flex">
              {l.dot === "coin" ? (
                <svg viewBox="0 0 16 16" className="footer-coin w-[0.25em] h-[0.25em]">
                  <circle cx="8" cy="8" r="7" fill="#f6c88f" />
                </svg>
              ) : (
                <svg viewBox="0 0 18 18" className="footer-leaf w-[0.29em] h-[0.29em]">
                  <path d="M3 12C3 5 8 2.5 15 4C15.5 10.5 10 15 3 12Z" fill="#aee2c2" />
                </svg>
              )}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
