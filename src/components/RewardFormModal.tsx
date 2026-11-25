"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Reward } from "@/types";
import { REWARD_ICONS, REWARD_ICON_KEYS, RewardIcon } from "@/components/RewardIcon";


interface RewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: Reward | null;
  onSubmit: (data: { title: string; description: string; cost: number; icon: string; soldOut?: boolean }) => void;
}

export function RewardFormModal({
  isOpen,
  onClose,
  reward,
  onSubmit,
}: RewardFormModalProps) {
  const isEdit = !!reward;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(50);
  const [icon, setIcon] = useState("gift");
  const [soldOut, setSoldOut] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string; cost?: string }>({});
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(reward?.title ?? "");
      setDescription(reward?.description ?? "");
      setCost(reward?.cost ?? 50);
      setIcon(reward?.icon ?? "gift");
      setSoldOut(reward?.soldOut ?? false);
      setErrors({});
    }
  }, [isOpen, reward]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; description?: string; cost?: string } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    const costNum = Number(cost);
    if (Number.isNaN(costNum) || costNum < 1) newErrors.cost = "Enter a cost of 1 or more";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      cost: costNum,
      icon: icon || "gift",
      soldOut,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit reward" : "New reward"}>
      <form onSubmit={handleSubmit} className={`space-y-5 ${shake ? "shake" : ""}`} noValidate>
        <div>
          <label htmlFor="reward-title" className="label">Title</label>
          <input
            id="reward-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            aria-invalid={!!errors.title}
            placeholder="e.g. Homework pass"
          />
          {errors.title && <p className="text-negative text-sm mt-1.5">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="reward-description" className="label">Description</label>
          <textarea
            id="reward-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input resize-none"
            aria-invalid={!!errors.description}
            placeholder="What does this reward do?"
          />
          {errors.description && <p className="text-negative text-sm mt-1.5">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="reward-cost" className="label">Price in Spend tokens</label>
          <input
            id="reward-cost"
            type="number"
            min={1}
            value={cost}
            onChange={(e) => setCost(Number(e.target.value) || 0)}
            className="input num"
            aria-invalid={!!errors.cost}
          />
          {errors.cost && <p className="text-negative text-sm mt-1.5">{errors.cost}</p>}
        </div>

        <div>
          <p className="label">Icon</p>
          <div className="flex flex-wrap gap-2">
            {REWARD_ICON_KEYS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setIcon(opt)}
                aria-pressed={icon === opt}
                aria-label={REWARD_ICONS[opt].label}
                title={REWARD_ICONS[opt].label}
                className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                  icon === opt ? "border-ink bg-paper ring-1 ring-ink" : "border-line text-ink-soft hover:border-line-strong"
                }`}
              >
                <RewardIcon icon={opt} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-2xl border border-line px-4 py-3 cursor-pointer">
          <span>
            <span className="block font-medium text-[15px]">Sold out</span>
            <span className="block text-sm text-muted">Students can&apos;t buy it while this is on.</span>
          </span>
          <input
            type="checkbox"
            checked={soldOut}
            onChange={(e) => setSoldOut(e.target.checked)}
            className="w-5 h-5 accent-ink"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {isEdit ? "Save changes" : "Add reward"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
