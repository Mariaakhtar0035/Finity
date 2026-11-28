/*
 * The student's character: how it looks, and the accessories they can buy
 * with Spend tokens. Plain data so the store can use it; drawing lives in
 * components/room/RoomArt.
 */

export type HairStyle = "short" | "curly" | "bun" | "long" | "ponytail" | "braids";

export interface AvatarLook {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  shirt: string;
  /** Accessory being worn, if any */
  accessory?: string | null;
}

export const SKIN_TONES = ["#fbe0cb", "#f5d2b3", "#e8b48f", "#c68a63", "#8d5a3b", "#5e3b26"];

export const HAIR_STYLES: { id: HairStyle; name: string }[] = [
  { id: "short", name: "Short" },
  { id: "curly", name: "Curly" },
  { id: "bun", name: "Bun" },
  { id: "long", name: "Long" },
  { id: "ponytail", name: "Ponytail" },
  { id: "braids", name: "Braids" },
];

export const HAIR_COLORS = ["#141414", "#4a3128", "#7a4a2a", "#b85c3a", "#c98d3c", "#e8c97a"];

export const SHIRT_COLORS = ["#f6c88f", "#b6c1f5", "#aee2c2", "#d6c6f4", "#f2b0cf", "#f4e297", "#a9d9ef", "#e5cfae"];

export interface Accessory {
  id: string;
  name: string;
  cost: number;
}

export const ACCESSORIES: Accessory[] = [
  { id: "acc-glasses", name: "Round glasses", cost: 20 },
  { id: "acc-bow", name: "Hair bow", cost: 20 },
  { id: "acc-cap", name: "Baseball cap", cost: 30 },
  { id: "acc-headphones", name: "Headphones", cost: 40 },
  { id: "acc-crown", name: "Gold crown", cost: 75 },
];

export function getAccessory(id: string | null | undefined): Accessory | undefined {
  return id ? ACCESSORIES.find((a) => a.id === id) : undefined;
}

function hashId(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** The look a student has before they make their own (same as the old auto-generated one) */
export function defaultLook(studentId: string): AvatarLook {
  const h = hashId(studentId);
  const oldSkins = ["#f5d2b3", "#e8b48f", "#c68a63", "#8d5a3b"];
  const oldHair = ["#4a3128", "#141414", "#7a4a2a", "#c98d3c"];
  const oldStyles: HairStyle[] = ["short", "bun", "curly"];
  return {
    skin: oldSkins[h % oldSkins.length],
    hairColor: oldHair[(h >> 3) % oldHair.length],
    hair: oldStyles[(h >> 6) % oldStyles.length],
    shirt: SHIRT_COLORS[h % SHIRT_COLORS.length],
    accessory: null,
  };
}

/** A student's look: what they picked, filled in with their default */
export function lookOf(student: { id: string; look?: Partial<AvatarLook> }): AvatarLook {
  return { ...defaultLook(student.id), ...student.look };
}

/** A random look, for "Surprise me" (keeps the accessory) */
export function randomLook(current: AvatarLook): AvatarLook {
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
  return {
    ...current,
    skin: pick(SKIN_TONES),
    hair: pick(HAIR_STYLES).id,
    hairColor: pick(HAIR_COLORS),
    shirt: pick(SHIRT_COLORS),
  };
}

/** Only accept values from the lists above */
export function cleanLook(partial: Partial<AvatarLook>): Partial<AvatarLook> {
  const out: Partial<AvatarLook> = {};
  if (partial.skin && SKIN_TONES.includes(partial.skin)) out.skin = partial.skin;
  if (partial.hair && HAIR_STYLES.some((s) => s.id === partial.hair)) out.hair = partial.hair;
  if (partial.hairColor && HAIR_COLORS.includes(partial.hairColor)) out.hairColor = partial.hairColor;
  if (partial.shirt && SHIRT_COLORS.includes(partial.shirt)) out.shirt = partial.shirt;
  return out;
}
