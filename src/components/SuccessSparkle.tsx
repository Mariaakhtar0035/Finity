"use client";

import { Confetti } from "@/components/ui/Feedback";

interface SuccessSparkleProps {
  show: boolean;
  onComplete?: () => void;
  /** Kept for API compatibility; confetti always runs ~1.9s */
  duration?: number;
}

/** Celebration burst used after purchases, requests and approvals */
export function SuccessSparkle({ show, onComplete }: SuccessSparkleProps) {
  return <Confetti show={show} onDone={onComplete} />;
}
