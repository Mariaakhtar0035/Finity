"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { MrsPennyworthAvatar } from "@/components/MrsPennyworthAvatar";

/* ------------------------------------------------------------------
   Toast — black pill at the bottom of the screen
------------------------------------------------------------------- */
export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 inset-x-0 z-[90] flex justify-center px-4 pointer-events-none">
      <div
        role="status"
        className="pointer-events-auto inline-flex items-center gap-3 bg-ink text-white rounded-full pl-2 pr-5 py-2 shadow-lift animate-fade-up max-w-full"
      >
        <span className="w-7 h-7 rounded-full bg-mint text-ink flex items-center justify-center shrink-0">
          <Check className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <span className="text-[15px] truncate">{message}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Live indicator — "Live · Updated 3:04 PM"
------------------------------------------------------------------- */
export function LiveIndicator({
  refreshing,
  lastUpdate,
  onRefresh,
}: {
  refreshing?: boolean;
  lastUpdate: Date;
  onRefresh?: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-mint-deep live-ping" />
        <span className="relative w-2 h-2 rounded-full bg-mint-deep" />
      </span>
      <span>
        Live · {refreshing ? "Updating…" : `Updated ${lastUpdate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}`}
      </span>
      {onRefresh && (
        <button type="button" onClick={onRefresh} className="text-ink underline underline-offset-4 decoration-line-strong hover:decoration-ink ml-1">
          Refresh
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Confetti — short burst of pastel shapes for celebratory moments
------------------------------------------------------------------- */
const CONFETTI_COLORS = ["#f6c88f", "#b6c1f5", "#aee2c2", "#f2b0cf", "#d6c6f4", "#f4e297"];

export function Confetti({ show, onDone }: { show: boolean; onDone?: () => void }) {
  const [visible, setVisible] = useState(false);

  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        dx: `${(Math.random() - 0.5) * 160}px`,
        rot: `${(Math.random() - 0.5) * 720}deg`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: i % 3,
      })),
    // regenerate each time it's shown
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [show],
  );

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1900);
    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[110] pointer-events-none overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 border-2 border-ink"
          style={
            {
              left: `${p.left}%`,
              width: p.shape === 2 ? 14 : 10,
              height: p.shape === 2 ? 6 : 10,
              borderRadius: p.shape === 0 ? "999px" : "3px",
              background: p.color,
              animationDelay: `${p.delay}s`,
              "--dx": p.dx,
              "--rot": p.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Segmented control
------------------------------------------------------------------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`inline-flex p-1 rounded-full bg-paper border border-line ${className}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap inline-flex items-center gap-2 transition-all ${
              active ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------
   Callout — an explanation from Mrs. Pennyworth (AI) or a tip
------------------------------------------------------------------- */
export function Callout({
  children,
  loading,
  loadingText = "Mrs. Pennyworth is thinking",
  className = "",
}: {
  children?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-3 rounded-2xl bg-paper p-4 ${className}`}>
      <MrsPennyworthAvatar size="sm" state={loading ? "thinking" : "idle"} />
      <div className="text-[15px] leading-relaxed text-ink-soft pt-1.5 min-w-0">
        {loading ? <TypingDots label={loadingText} /> : children}
      </div>
    </div>
  );
}

export function TypingDots({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted">
      {label}
      <span className="inline-flex gap-1" aria-hidden>
        <span className="w-1.5 h-1.5 rounded-full bg-muted typing-dot" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted typing-dot" style={{ animationDelay: "0.15s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted typing-dot" style={{ animationDelay: "0.3s" }} />
      </span>
    </span>
  );
}
