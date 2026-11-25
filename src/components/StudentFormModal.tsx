"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; pin?: string }) => void;
}

export function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
}: StudentFormModalProps) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<{ name?: string; pin?: string }>({});
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPin("");
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrors({ name: "Name is required" });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (pin && !/^\d{4}$/.test(pin)) {
      setErrors({ pin: "PIN must be exactly 4 digits" });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    onSubmit({ name: trimmed, pin: pin.trim() || undefined });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a student"
      description="New students start with 100 Spend, 40 Save and 50 Grow tokens."
    >
      <form onSubmit={handleSubmit} className={`space-y-5 ${shake ? "shake" : ""}`} noValidate>
        <div>
          <label htmlFor="student-name" className="label">Name</label>
          <input
            id="student-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            aria-invalid={!!errors.name}
            placeholder="e.g. Alex"
            autoFocus
          />
          {errors.name && <p className="text-negative text-sm mt-1.5">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="student-pin" className="label">PIN</label>
          <input
            id="student-pin"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="input num tracking-[0.3em]"
            aria-invalid={!!errors.pin}
            placeholder="1234"
          />
          {errors.pin ? (
            <p className="text-negative text-sm mt-1.5">{errors.pin}</p>
          ) : (
            <p className="text-muted text-sm mt-1.5">Optional, 4 digits. Defaults to 1234.</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            Add student
          </Button>
        </div>
      </form>
    </Modal>
  );
}
