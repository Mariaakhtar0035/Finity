import React from "react";
import { Coin, TokenType } from "./Coin";

interface TokenChipProps {
  amount: number;
  type?: TokenType;
  size?: "sm" | "md";
  className?: string;
}

/** Compact "amount + coin" pill used for prices and rewards */
export function TokenChip({ amount, type = "spend", size = "md", className = "" }: TokenChipProps) {
  const sm = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-paper font-medium num text-ink
        ${sm ? "h-7 pl-1 pr-2.5 text-sm" : "h-9 pl-1.5 pr-3.5 text-[15px]"} ${className}`}
    >
      <Coin type={type} size={sm ? 20 : 24} />
      {amount}
    </span>
  );
}
