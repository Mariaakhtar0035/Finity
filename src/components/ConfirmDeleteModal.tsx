"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  onConfirm: () => void;
  confirmLabel?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  title,
  message = "This cannot be undone.",
  onConfirm,
  confirmLabel = "Remove",
}: ConfirmDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={message}>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} fullWidth>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
