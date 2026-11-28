import React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";

/** An "i" whose dot is replaced by a small illustration */
function DottedI({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      ı
      <span className="absolute left-1/2 -translate-x-1/2 top-[0.06em] flex" aria-hidden>
        {children}
      </span>
    </span>
  );
}

/**
 * "Finity" set in the serif, with the first i dotted by a coin (Spend)
 * and the second by a leaf (Grow). Sized with the surrounding font size.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-medium tracking-tight leading-none whitespace-nowrap ${className}`} aria-label="Finity">
      <span aria-hidden>
        F
        <DottedI>
          <svg viewBox="0 0 16 16" className="w-[0.25em] h-[0.25em]">
            <circle cx="8" cy="8" r="7" fill="#f6c88f" />
          </svg>
        </DottedI>
        n
        <DottedI>
          <svg viewBox="0 0 18 18" className="w-[0.29em] h-[0.29em]">
            <path d="M3 12C3 5 8 2.5 15 4C15.5 10.5 10 15 3 12Z" fill="#aee2c2" />
          </svg>
        </DottedI>
        ty
      </span>
    </span>
  );
}

interface LogoProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  suffix?: string;
}

/** The sprout-F mark next to the Finity wordmark */
export function Logo({ href = "/", onClick, className = "", suffix }: LogoProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 text-ink ${className}`}
      aria-label="Finity home"
    >
      <LogoMark size={34} />
      <Wordmark className="text-[26px]" />
      {suffix && <span className="text-sm text-muted ml-1 mt-1">{suffix}</span>}
    </Link>
  );
}
