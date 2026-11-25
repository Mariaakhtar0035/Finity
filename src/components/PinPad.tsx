"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PinPadProps {
  /** Resolve true when the PIN is correct. Throwing shows a generic error. */
  verify: (pin: string) => Promise<boolean>;
  onSuccess: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];


export function PinPad({ verify, onSuccess }: PinPadProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const push = useCallback((d: string) => {
    setPin((p) => (p.length < 4 ? p + d : p));
    setError("");
  }, []);
  const pop = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError("");
  }, []);

  const submit = useCallback(async () => {
    if (pin.length !== 4 || loading) return;
    setLoading(true);
    setError("");
    try {
      const ok = await verify(pin);
      if (ok) {
        onSuccess();
        return;
      }
      setError("That PIN didn't match. Try again.");
    } catch {
      setError("Something went wrong. Try again.");
    }
    setPin("");
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setLoading(false);
  }, [pin, loading, verify, onSuccess]);

  // Physical keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (loading) return;
      if (e.key >= "0" && e.key <= "9") {
        push(e.key);
        e.preventDefault();
      } else if (e.key === "Backspace") {
        pop();
        e.preventDefault();
      } else if (e.key === "Enter") {
        submit();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [push, pop, submit, loading]);

  const keyClass =
    "h-16 rounded-full text-2xl font-display num text-ink bg-paper hover:bg-paper-deep active:scale-95 transition-all disabled:opacity-40";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* PIN dots */}
      <div className={`flex justify-center gap-4 ${shake ? "shake" : ""}`} aria-live="polite" aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              pin[i] ? "bg-ink border-ink scale-110" : error ? "border-negative" : "border-line-strong"
            }`}
          />
        ))}
      </div>

      <p className={`text-center text-sm mt-4 h-5 ${error ? "text-negative" : "text-transparent"}`} role="alert">
        {error || " "}
      </p>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => push(k)} disabled={loading} className={keyClass}>
            {k}
          </button>
        ))}
        <span />
        <button type="button" onClick={() => push("0")} disabled={loading} className={keyClass}>
          0
        </button>
        <button
          type="button"
          onClick={pop}
          disabled={loading || pin.length === 0}
          className="h-16 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper transition-colors disabled:opacity-30"
          aria-label="Delete last digit"
        >
          <Delete className="w-6 h-6" strokeWidth={1.75} />
        </button>
      </div>

      <Button type="submit" size="lg" fullWidth className="mt-6" disabled={loading || pin.length !== 4}>
        {loading ? "Checking…" : "Continue"}
      </Button>
    </form>
  );
}
