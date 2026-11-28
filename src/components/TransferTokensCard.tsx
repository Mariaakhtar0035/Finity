"use client";

import React, { useState } from "react";
import { ArrowDown, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coin, TOKEN_META } from "@/components/ui/Coin";
import { Callout } from "@/components/ui/Feedback";
import { GROW_LOCK_WEEKS, getGrowAvailable, getGrowLocks, getStudent, transferTokens, type TokenBucket } from "@/lib/store";

const BUCKETS: TokenBucket[] = ["spend", "save", "grow"];

interface TransferTokensCardProps {
  studentId: string;
  studentName?: string;
  spendTokens: number;
  saveTokens: number;
  growTokens: number;
  onTransfer: () => void;
  /** Inside a popup: no card frame or heading (the popup has its own title) */
  bare?: boolean;
}

const TRANSFER_INSIGHT_FALLBACK =
  "Putting tokens in Grow is like planting seeds: wait, and you get more. Putting them in Spend is like picking fruit: you get to enjoy it now.";

function BucketPicker({
  label,
  value,
  options,
  balances,
  onChange,
}: {
  label: string;
  value: TokenBucket;
  options: TokenBucket[];
  balances: Record<TokenBucket, number>;
  onChange: (b: TokenBucket) => void;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={label}>
        {BUCKETS.map((b) => {
          const enabled = options.includes(b);
          const active = value === b;
          return (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!enabled}
              onClick={() => onChange(b)}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition-all disabled:opacity-30 ${
                active ? "border-ink bg-surface ring-1 ring-ink" : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <Coin type={b} size={24} />
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-tight">{TOKEN_META[b].label}</span>
                <span className="block text-xs text-muted num">{balances[b]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TransferTokensCard({
  studentId,
  studentName = "Student",
  spendTokens,
  saveTokens,
  growTokens,
  onTransfer,
  bare = false,
}: TransferTokensCardProps) {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState<TokenBucket>("spend");
  const [to, setTo] = useState<TokenBucket>("grow");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transferExplanation, setTransferExplanation] = useState<string | null>(null);
  const [loadingTransferExplanation, setLoadingTransferExplanation] = useState(false);

  const balances = { spend: spendTokens, save: saveTokens, grow: growTokens };
  const student = getStudent(studentId);
  const growAvailable = student ? getGrowAvailable(student) : growTokens;
  const nextUnlock = student ? getGrowLocks(student)[0] : undefined;
  const maxAmount = from === "grow" ? growAvailable : balances[from];
  const canTransfer = from !== to && maxAmount > 0;

  const handleExplainTransfer = () => {
    setTransferExplanation(null);
    setLoadingTransferExplanation(true);
    fetch("/api/gemini/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "TRANSFER_INSIGHT", studentName, context: {} }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => setTransferExplanation(data.explanation ?? TRANSFER_INSIGHT_FALLBACK))
      .catch(() => setTransferExplanation(TRANSFER_INSIGHT_FALLBACK))
      .finally(() => setLoadingTransferExplanation(false));
  };

  const handleTransfer = () => {
    setError(null);
    setSuccess(null);
    const num = parseInt(amount, 10);
    if (isNaN(num) || num <= 0) {
      setError("Type how many tokens to move.");
      return;
    }
    if (num > maxAmount) {
      setError(
        from === "grow" && growAvailable < growTokens
          ? `Only ${maxAmount} Grow tokens can move right now. New ones have to stay for ${GROW_LOCK_WEEKS} weeks.`
          : `You only have ${maxAmount} ${TOKEN_META[from].label} tokens.`,
      );
      return;
    }
    const result = transferTokens(studentId, num, from, to);
    if (result) {
      setAmount("");
      setSuccess(`Moved ${num} tokens from ${TOKEN_META[from].label} to ${TOKEN_META[to].label}.`);
      onTransfer();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError("That didn't work. Try again.");
    }
  };

  return (
    <Card className={bare ? "p-0! border-0! shadow-none! bg-transparent!" : "p-6 md:p-8"}>
      {!bare && <h2 className="font-display text-2xl tracking-tight">Move tokens</h2>}
      <p className="text-muted mt-1 text-[15px]">
        Move tokens from one place to another. Tokens you put in Grow have to stay for {GROW_LOCK_WEEKS} weeks.{" "}
        <button
          type="button"
          onClick={handleExplainTransfer}
          className="text-ink underline underline-offset-4 decoration-line-strong hover:decoration-ink"
        >
          Why move tokens?
        </button>
      </p>

      {(loadingTransferExplanation || transferExplanation) && (
        <Callout loading={loadingTransferExplanation} className="mt-4">
          {transferExplanation}
        </Callout>
      )}

      <div className="mt-6 space-y-3">
        <BucketPicker
          label="From"
          value={from}
          options={BUCKETS}
          balances={balances}
          onChange={(b) => {
            setFrom(b);
            if (to === b) setTo(BUCKETS.find((x) => x !== b)!);
          }}
        />
        {from === "grow" && growAvailable < growTokens && (
          <p className="flex items-start gap-2 text-sm text-ink-soft bg-paper rounded-2xl px-3.5 py-2.5">
            <Lock className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <span className="num">{growAvailable}</span> of <span className="num">{growTokens}</span> can move now.
              {nextUnlock && (
                <>
                  {" "}
                  <span className="num">{nextUnlock.amount}</span> more unlock in week <span className="num">{nextUnlock.untilWeek}</span>.
                </>
              )}
            </span>
          </p>
        )}
        <div className="flex justify-center" aria-hidden>
          <span className="w-8 h-8 rounded-full bg-paper flex items-center justify-center">
            <ArrowDown className="w-4 h-4 text-muted" />
          </span>
        </div>
        <BucketPicker
          label="To"
          value={to}
          options={BUCKETS.filter((b) => b !== from)}
          balances={balances}
          onChange={setTo}
        />

        <div className="pt-2">
          <label htmlFor="transfer-amount" className="label">
            Amount
          </label>
          <div className="flex gap-2">
            <input
              id="transfer-amount"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxAmount}
              placeholder={`Up to ${maxAmount}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input num"
            />
            <Button
              variant="secondary"
              onClick={() => setAmount(String(maxAmount))}
              disabled={maxAmount === 0}
              className="h-auto! shrink-0"
            >
              Max
            </Button>
          </div>
        </div>

        <Button onClick={handleTransfer} disabled={!canTransfer || !amount} fullWidth size="lg" className="mt-2">
          Move tokens
        </Button>

        {error && <p className="text-sm text-negative">{error}</p>}
        {success && <p className="text-sm text-positive">{success}</p>}
      </div>
    </Card>
  );
}
