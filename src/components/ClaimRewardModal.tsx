"use client";

import React, { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Coin, TOKEN_META, TokenType } from "@/components/ui/Coin";
import { Callout } from "@/components/ui/Feedback";
import { CoinStackDoodle } from "@/components/ui/Doodles";
import { PendingReward } from "@/types";
import { getRecommendedSplit } from "@/lib/store";

interface ClaimRewardModalProps {
  pendingReward: PendingReward;
  studentName?: string;
  onClaim: (spendAmount: number, saveAmount: number, growAmount: number) => void;
  onClose: () => void;
}

const SPEND_VS_GROW_FALLBACK =
  "Spend is for things you want now. Save is for something bigger. Grow gets a little bigger every week, so it helps to put some there.";

export function ClaimRewardModal({
  pendingReward,
  studentName = "Student",
  onClaim,
  onClose,
}: ClaimRewardModalProps) {
  const total = pendingReward.totalAmount;
  const recommended = getRecommendedSplit(total);
  const [split, setSplit] = useState<Record<TokenType, number>>({
    spend: recommended.spend,
    save: recommended.save,
    grow: recommended.grow,
  });
  const [splitExplanation, setSplitExplanation] = useState<string | null>(null);
  const [loadingSplitExplanation, setLoadingSplitExplanation] = useState(false);

  useEffect(() => {
    setSplit({ spend: recommended.spend, save: recommended.save, grow: recommended.grow });
  }, [pendingReward.id, recommended.spend, recommended.save, recommended.grow]);

  const allocated = split.spend + split.save + split.grow;
  const remaining = total - allocated;
  const isRecommended =
    split.spend === recommended.spend && split.save === recommended.save && split.grow === recommended.grow;

  const setAmount = (type: TokenType, value: number) => {
    const others = allocated - split[type];
    const clamped = Math.max(0, Math.min(Math.round(value) || 0, total - others));
    setSplit((s) => ({ ...s, [type]: clamped }));
  };

  const handleExplainSplit = () => {
    setSplitExplanation(null);
    setLoadingSplitExplanation(true);
    fetch("/api/gemini/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "SPEND_VS_GROW",
        studentName,
        context: {
          totalReward: total,
          spendAmount: split.spend,
          saveAmount: split.save,
          growAmount: split.grow,
        },
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => setSplitExplanation(data.explanation ?? SPEND_VS_GROW_FALLBACK))
      .catch(() => setSplitExplanation(SPEND_VS_GROW_FALLBACK))
      .finally(() => setLoadingSplitExplanation(false));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      illustration={<CoinStackDoodle className="w-24 h-auto" />}
      title={`${total} tokens earned`}
      description={
        <>
          for <span className="text-ink">{pendingReward.missionTitle}</span>. Where should they go?
        </>
      }
    >
      <div className="space-y-2">
        {(["spend", "save", "grow"] as TokenType[]).map((type) => (
          <div key={type} className="flex items-center gap-3 rounded-2xl border border-line p-3">
            <Coin type={type} size={36} />
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-tight">{TOKEN_META[type].label}</p>
              <p className="text-xs text-muted">{TOKEN_META[type].short}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAmount(type, split[type] - 1)}
                disabled={split[type] === 0}
                className="w-8 h-8 rounded-full bg-paper flex items-center justify-center hover:bg-paper-deep disabled:opacity-30"
                aria-label={`Less ${TOKEN_META[type].label}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={total}
                value={split[type]}
                onChange={(e) => setAmount(type, parseInt(e.target.value, 10))}
                className="w-14 text-center font-display text-xl num bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                aria-label={`${TOKEN_META[type].label} tokens`}
              />
              <button
                type="button"
                onClick={() => setAmount(type, split[type] + 1)}
                disabled={remaining === 0}
                className="w-8 h-8 rounded-full bg-paper flex items-center justify-center hover:bg-paper-deep disabled:opacity-30"
                aria-label={`More ${TOKEN_META[type].label}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className={remaining === 0 ? "text-muted" : "text-negative"}>
          {remaining === 0 ? "Every token has a place" : `${remaining} more to place`}
        </span>
        {!isRecommended ? (
          <button
            type="button"
            onClick={() => setSplit({ spend: recommended.spend, save: recommended.save, grow: recommended.grow })}
            className="underline underline-offset-4 decoration-line-strong hover:decoration-ink"
          >
            Use the suggested amounts
          </button>
        ) : (
          <button
            type="button"
            onClick={handleExplainSplit}
            className="underline underline-offset-4 decoration-line-strong hover:decoration-ink"
          >
            Why these amounts?
          </button>
        )}
      </div>

      {(loadingSplitExplanation || splitExplanation) && (
        <Callout loading={loadingSplitExplanation} className="mt-4">
          {splitExplanation}
        </Callout>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Later
        </Button>
        <Button onClick={() => onClaim(split.spend, split.save, split.grow)} disabled={remaining !== 0} fullWidth>
          Collect tokens
        </Button>
      </div>
    </Modal>
  );
}
