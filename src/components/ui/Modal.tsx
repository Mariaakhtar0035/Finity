"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  /** Optional illustration shown above the title */
  illustration?: React.ReactNode;
}

export function Modal({ isOpen, onClose, children, title, description, illustration }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-[fade-up_0.2s_ease-out_both]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-md bg-surface rounded-t-4xl sm:rounded-4xl shadow-lift max-h-[92vh] overflow-y-auto animate-pop-in"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>

        <div className="px-6 sm:px-8 pt-8 pb-6 sm:pb-8">
          {illustration && <div className="flex justify-center mb-4">{illustration}</div>}
          {title && (
            <h2 className={`font-display text-[26px] leading-tight tracking-tight text-ink pr-8 ${illustration ? "text-center pr-0" : ""}`}>
              {title}
            </h2>
          )}
          {description && (
            <p className={`text-muted mt-2 ${illustration ? "text-center" : ""}`}>{description}</p>
          )}
          <div className={title || description ? "mt-6" : ""}>{children}</div>
        </div>
      </div>
    </div>
  );
}
