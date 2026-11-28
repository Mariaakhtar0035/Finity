"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Mission, MissionBandColor, MISSION_BAND_COLORS } from "@/types";
import { BAND_PALETTE } from "@/lib/palette";

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission?: Mission | null;
  onSubmit: (data: { title: string; description: string; baseReward: number; bandColor?: MissionBandColor }) => void;
}

export function MissionFormModal({
  isOpen,
  onClose,
  mission,
  onSubmit,
}: MissionFormModalProps) {
  const isEdit = !!mission;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [baseReward, setBaseReward] = useState(100);
  const [bandColor, setBandColor] = useState<MissionBandColor | "">("");
  const [errors, setErrors] = useState<{ title?: string; description?: string; baseReward?: string }>({});
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(mission?.title ?? "");
      setDescription(mission?.description ?? "");
      setBaseReward(mission?.baseReward ?? 100);
      setBandColor(mission?.bandColor ?? "");
      setErrors({});
    }
  }, [isOpen, mission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; description?: string; baseReward?: string } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    const reward = Number(baseReward);
    if (Number.isNaN(reward) || reward < 1) newErrors.baseReward = "Enter a reward of 1 or more";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      baseReward: reward,
      bandColor: bandColor || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit mission" : "New mission"}>
      <form onSubmit={handleSubmit} className={`space-y-5 ${shake ? "shake" : ""}`} noValidate>
        <div>
          <label htmlFor="mission-title" className="label">Title</label>
          <input
            id="mission-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            aria-invalid={!!errors.title}
            placeholder="e.g. Organize the classroom library"
          />
          {errors.title && <p className="text-negative text-sm mt-1.5">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="mission-description" className="label">Description</label>
          <textarea
            id="mission-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input resize-none"
            aria-invalid={!!errors.description}
            placeholder="A short, friendly description"
          />
          {errors.description && <p className="text-negative text-sm mt-1.5">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="mission-reward" className="label">Base reward</label>
          <input
            id="mission-reward"
            type="number"
            min={1}
            value={baseReward}
            onChange={(e) => setBaseReward(Number(e.target.value) || 0)}
            className="input num"
            aria-invalid={!!errors.baseReward}
          />
          {errors.baseReward ? (
            <p className="text-negative text-sm mt-1.5">{errors.baseReward}</p>
          ) : (
            <p className="text-muted text-sm mt-1.5">Drops automatically as more students request it.</p>
          )}
        </div>

        <div>
          <p className="label">Colour</p>
          <div className="flex flex-wrap gap-2">
            {MISSION_BAND_COLORS.map((color) => {
              const active = bandColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBandColor(active ? "" : color)}
                  className={`w-9 h-9 rounded-full border-2 border-ink transition-transform hover:scale-110 ${
                    active ? "ring-2 ring-offset-2 ring-ink" : ""
                  }`}
                  style={{ background: BAND_PALETTE[color].fill }}
                  aria-label={BAND_PALETTE[color].label}
                  aria-pressed={active}
                />
              );
            })}
          </div>
          <p className="text-muted text-sm mt-1.5">Optional. We&apos;ll pick one if you leave it blank.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {isEdit ? "Save changes" : "Add mission"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
