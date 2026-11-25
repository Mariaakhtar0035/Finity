import React from "react";
import Link from "next/link";

interface LogoProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  suffix?: string;
}

/** Serif wordmark with a small coin mark */
export function Logo({ href = "/", onClick, className = "", suffix }: LogoProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-ink ${className}`}
      aria-label="Finity home"
    >
      <svg width="26" height="26" viewBox="0 0 40 40" aria-hidden>
        <circle cx="21.5" cy="21.5" r="16" fill="#e2a55c" stroke="#141414" strokeWidth="2.4" />
        <circle cx="19" cy="19" r="16" fill="#f6c88f" stroke="#141414" strokeWidth="2.4" />
        <path d="M15 26V12.5h9M15 19h7" stroke="#141414" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </svg>
      <span className="font-display text-[26px] leading-none tracking-tight font-medium">Finity</span>
      {suffix && <span className="text-sm text-muted ml-1 mt-1">{suffix}</span>}
    </Link>
  );
}
