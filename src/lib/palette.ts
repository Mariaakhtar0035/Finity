import type { MissionBandColor } from "@/types";

/**
 * Mission categories keep their original keys (stored in data) but map to
 * the pastel accent palette.
 */
export const BAND_PALETTE: Record<MissionBandColor, { label: string; fill: string; soft: string }> = {
  green: { label: "Mint", fill: "#aee2c2", soft: "#e4f5ea" },
  darkBlue: { label: "Periwinkle", fill: "#b6c1f5", soft: "#e9ecfc" },
  lightBlue: { label: "Sky", fill: "#a9d9ef", soft: "#e5f3fa" },
  red: { label: "Pink", fill: "#f2b0cf", soft: "#fce9f2" },
  yellow: { label: "Butter", fill: "#f4e297", soft: "#fbf6dc" },
  orange: { label: "Peach", fill: "#f6c88f", soft: "#fcefdc" },
  brown: { label: "Sand", fill: "#e5cfae", soft: "#f6efe4" },
  purple: { label: "Lavender", fill: "#d6c6f4", soft: "#f2ecfc" },
};

const BAND_KEYS = Object.keys(BAND_PALETTE) as MissionBandColor[];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function bandFor(id: string, band?: MissionBandColor) {
  const key = band && band in BAND_PALETTE ? band : BAND_KEYS[hash(id) % BAND_KEYS.length];
  return BAND_PALETTE[key];
}

/** Soft background tint for a reward's emoji tile */
export function rewardTint(id: string): string {
  return BAND_PALETTE[BAND_KEYS[hash(id) % BAND_KEYS.length]].soft;
}
