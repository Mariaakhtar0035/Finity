import type { BalanceHistoryEntry } from "@/types";

export const WEEKLY_RATE = 0.02; // 2% weekly growth

export function calculateGrowth(principal: number, weeks: number): number {
  return Math.floor(principal * Math.pow(1 + WEEKLY_RATE, weeks));
}

export interface GrowthProjection {
  oneMonth: number;
  sixMonths: number;
  oneYear: number;
}

export function getProjections(currentGrow: number): GrowthProjection {
  return {
    oneMonth: calculateGrowth(currentGrow, 4),
    sixMonths: calculateGrowth(currentGrow, 26),
    oneYear: calculateGrowth(currentGrow, 52),
  };
}

export function getGrowthPercentage(principal: number, future: number): number {
  if (principal === 0) return 0;
  return Math.floor(((future - principal) / principal) * 100);
}

/**
 * Generates a plausible weekly history that ends exactly at current balances.
 * Used when a student has no balanceHistory: Spend wobbles with a couple of
 * purchase dips, Save rises steadily and Grow accelerates like compounding.
 */
export function generateHistoryFromCurrent(
  spendTokens: number,
  saveTokens: number,
  growTokens: number,
  weeks = 16
): BalanceHistoryEntry[] {
  if (spendTokens === 0 && saveTokens === 0 && growTokens === 0) {
    return Array.from({ length: weeks }, (_, i) => ({
      week: i + 1,
      spendBalance: 0,
      saveBalance: 0,
      growBalance: 0,
    }));
  }
  // Each balance climbs smoothly toward today's value. Spend wobbles and dips
  // around "purchase" weeks; Save rises steadily; Grow accelerates (compounding).
  const entries: BalanceHistoryEntry[] = [];
  const dipWeeks = new Set([Math.round(weeks * 0.4), Math.round(weeks * 0.75)]);
  for (let w = 1; w <= weeks; w++) {
    const t = w / weeks;
    const wobble = 1 + 0.1 * Math.sin(w * 1.3);
    const dip = dipWeeks.has(w) ? 0.85 : 1;
    entries.push({
      week: w,
      spendBalance: Math.max(0, Math.round(spendTokens * t * wobble * dip)),
      saveBalance: Math.max(0, Math.round(saveTokens * t)),
      growBalance: Math.max(0, Math.round(growTokens * Math.pow(t, 1.25))),
    });
  }
  // Ensure final week matches current balances
  entries[entries.length - 1] = {
    week: weeks,
    spendBalance: spendTokens,
    saveBalance: saveTokens,
    growBalance: growTokens,
  };
  return entries;
}

/**
 * Computes "If I Grew Everything" scenario from history.
 * For each week: infer earnings = max(0, total[i] - total[i-1] - grow[i-1]*0.02).
 * Simulate: whatIfGrow[0] = earnings[0], whatIfGrow[i] = whatIfGrow[i-1]*1.02 + earnings[i].
 * Returns array aligned with history weeks.
 */
export function computeWhatIfGrow(
  history: BalanceHistoryEntry[]
): number[] {
  if (history.length === 0) return [];
  const result: number[] = [];
  let whatIf = 0;
  let prevTotal = 0;
  let prevGrow = 0;
  for (let i = 0; i < history.length; i++) {
    const h = history[i];
    const total = h.spendBalance + h.saveBalance + h.growBalance;
    const growthOnPrev = prevGrow * WEEKLY_RATE;
    const earnings = Math.max(0, total - prevTotal - growthOnPrev);
    whatIf = whatIf * (1 + WEEKLY_RATE) + earnings;
    result.push(Math.floor(whatIf));
    prevTotal = total;
    prevGrow = h.growBalance;
  }
  return result;
}
