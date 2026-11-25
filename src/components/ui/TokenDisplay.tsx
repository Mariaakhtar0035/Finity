import React from "react";
import { Coin, TOKEN_META, TokenType } from "./Coin";

interface TokenDisplayProps {
  amount: number;
  type: TokenType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  /** When true, stack coin on top of amount, both centered */
  centered?: boolean;
  className?: string;
}

const SIZES = {
  sm: { coin: 24, text: "text-base font-medium" },
  md: { coin: 32, text: "text-2xl" },
  lg: { coin: 44, text: "text-4xl" },
};

/** Coin + amount (+ optional label) */
export function TokenDisplay({
  amount,
  type,
  size = "md",
  showLabel = true,
  centered = false,
  className = "",
}: TokenDisplayProps) {
  const config = SIZES[size];
  const isLarge = size !== "sm";

  return (
    <div
      className={`flex ${centered ? "flex-col items-center text-center gap-2" : "items-center gap-2.5"} ${className}`}
      title={`${TOKEN_META[type].label} tokens`}
    >
      <Coin type={type} size={config.coin} />
      <div className="flex flex-col leading-none">
        <span className={`num text-ink ${config.text} ${isLarge ? "font-display tracking-tight" : ""}`}>
          {amount}
        </span>
        {showLabel && (
          <span className="text-xs text-muted mt-1">{TOKEN_META[type].label}</span>
        )}
      </div>
    </div>
  );
}
