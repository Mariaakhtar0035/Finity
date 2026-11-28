"use client";

import React, { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Coin, TOKEN_META } from "@/components/ui/Coin";
import { Segmented } from "@/components/ui/Feedback";
import { ActivityFeed } from "@/components/ActivityFeed";
import { adjustBalance, getActivity, removeStudent, setStudentPin, type TokenBucket } from "@/lib/store";
import type { Student } from "@/types";

interface ManageStudentModalProps {
  student: Student | null;
  onClose: () => void;
  onDone: (message: string) => void;
}

type Tab = "balances" | "pin" | "history";

/** Teacher tools for one student: adjust balances, reset PIN, view history, remove */
export function ManageStudentModal({ student, onClose, onDone }: ManageStudentModalProps) {
  const [tab, setTab] = useState<Tab>("balances");
  const [bucket, setBucket] = useState<TokenBucket>("spend");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTab("balances");
    setBucket("spend");
    setAmount("");
    setReason("");
    setPin("");
    setConfirmRemove(false);
    setError("");
  }, [student?.id]);

  if (!student) return null;

  const balances: Record<TokenBucket, number> = {
    spend: student.spendTokens,
    save: student.saveTokens,
    grow: student.growTokens,
  };

  const applyAdjustment = (sign: 1 | -1) => {
    const n = parseInt(amount, 10);
    if (!n || n < 1) {
      setError("Enter an amount of 1 or more.");
      return;
    }
    adjustBalance(student.id, bucket, sign * n, reason || (sign > 0 ? "Bonus from your teacher" : "Teacher adjustment"));
    onDone(`${sign > 0 ? "Added" : "Removed"} ${n} ${TOKEN_META[bucket].label} tokens ${sign > 0 ? "for" : "from"} ${student.name}.`);
    setAmount("");
    setReason("");
    setError("");
  };

  return (
    <Modal isOpen onClose={onClose} title={student.name} description={`${balances.spend + balances.save + balances.grow} tokens in total`}>
      <Segmented
        ariaLabel="Manage student"
        value={tab}
        onChange={(t) => {
          setTab(t);
          setError("");
        }}
        options={[
          { value: "balances", label: "Balances" },
          { value: "pin", label: "PIN" },
          { value: "history", label: "History" },
        ]}
        className="mb-6"
      />

      {tab === "balances" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Account">
            {(["spend", "save", "grow"] as TokenBucket[]).map((b) => (
              <button
                key={b}
                type="button"
                role="radio"
                aria-checked={bucket === b}
                onClick={() => setBucket(b)}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  bucket === b ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-strong"
                }`}
              >
                <Coin type={b} size={22} />
                <p className="font-display text-xl num mt-2">{balances[b]}</p>
                <p className="text-xs text-muted">{TOKEN_META[b].label}</p>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <div>
              <label htmlFor="adjust-amount" className="label">
                Amount
              </label>
              <input
                id="adjust-amount"
                type="number"
                inputMode="numeric"
                min={1}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="input num"
                placeholder="10"
              />
            </div>
            <div>
              <label htmlFor="adjust-reason" className="label">
                Reason <span className="text-muted font-normal">(optional)</span>
              </label>
              <input
                id="adjust-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 60))}
                className="input"
                placeholder="Great teamwork today"
              />
            </div>
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => applyAdjustment(-1)}>
              <Minus className="w-4 h-4" /> Remove
            </Button>
            <Button fullWidth onClick={() => applyAdjustment(1)}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          <p className="text-xs text-muted">Changes show up in the student&apos;s money activity.</p>
        </div>
      )}

      {tab === "pin" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!setStudentPin(student.id, pin)) {
              setError("PIN must be exactly 4 digits.");
              return;
            }
            onDone(`${student.name}'s PIN was updated.`);
            setPin("");
          }}
        >
          <div>
            <label htmlFor="new-pin" className="label">
              New PIN
            </label>
            <input
              id="new-pin"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="input num tracking-[0.4em]"
              placeholder="••••"
              aria-invalid={!!error}
            />
            <p className={`text-sm mt-1.5 ${error ? "text-negative" : "text-muted"}`}>
              {error || "Share the new PIN with the student privately."}
            </p>
          </div>
          <Button type="submit" fullWidth disabled={pin.length !== 4}>
            Update PIN
          </Button>
        </form>
      )}

      {tab === "history" && (
        <div className="max-h-[340px] overflow-y-auto -mx-1 px-1">
          <ActivityFeed entries={getActivity(student.id)} emptyText="No money activity yet." />
        </div>
      )}

      <div className="mt-8 pt-5 border-t border-line">
        {confirmRemove ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">Remove {student.name} and all their data?</p>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const name = student.name;
                  removeStudent(student.id);
                  onDone(`${name} was removed from the class.`);
                  onClose();
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmRemove(true)} className="text-sm text-negative hover:underline underline-offset-4">
            Remove student from class
          </button>
        )}
      </div>
    </Modal>
  );
}
