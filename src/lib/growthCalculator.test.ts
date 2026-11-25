import { describe, expect, it } from "vitest";
import {
  calculateGrowth,
  computeWhatIfGrow,
  generateHistoryFromCurrent,
  getGrowthPercentage,
  getProjections,
} from "@/lib/growthCalculator";

describe("compound growth", () => {
  it("compounds 2% per week", () => {
    expect(calculateGrowth(100, 0)).toBe(100);
    expect(calculateGrowth(100, 1)).toBe(102);
    expect(calculateGrowth(100, 52)).toBe(Math.floor(100 * 1.02 ** 52));
  });

  it("projects one month, six months and one year", () => {
    const p = getProjections(100);
    expect(p.oneMonth).toBe(calculateGrowth(100, 4));
    expect(p.sixMonths).toBe(calculateGrowth(100, 26));
    expect(p.oneYear).toBe(calculateGrowth(100, 52));
    expect(p.oneMonth).toBeLessThan(p.sixMonths);
    expect(p.sixMonths).toBeLessThan(p.oneYear);
  });

  it("reports growth percentage safely for zero", () => {
    expect(getGrowthPercentage(0, 50)).toBe(0);
    expect(getGrowthPercentage(100, 180)).toBe(80);
  });
});

describe("generated history", () => {
  it("has the requested length and ends at current balances", () => {
    const h = generateHistoryFromCurrent(150, 60, 90, 12);
    expect(h).toHaveLength(12);
    expect(h.at(-1)).toEqual({ week: 12, spendBalance: 150, saveBalance: 60, growBalance: 90 });
  });

  it("never goes negative", () => {
    for (const e of generateHistoryFromCurrent(40, 10, 20, 16)) {
      expect(Math.min(e.spendBalance, e.saveBalance, e.growBalance)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("'if I grew everything' simulation", () => {
  it("returns one value per week", () => {
    const h = generateHistoryFromCurrent(150, 60, 90, 10);
    expect(computeWhatIfGrow(h)).toHaveLength(10);
  });

  it("beats keeping everything in Spend when earnings are steady", () => {
    const h = Array.from({ length: 10 }, (_, i) => ({
      week: i + 1,
      spendBalance: (i + 1) * 10,
      saveBalance: 0,
      growBalance: 0,
    }));
    const whatIf = computeWhatIfGrow(h);
    expect(whatIf.at(-1)!).toBeGreaterThan(h.at(-1)!.spendBalance);
  });
});
