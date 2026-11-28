/*
 * "My room": things students buy with Spend tokens to make a room their own.
 * Purely cosmetic.
 *
 * The room is drawn as a little isometric diorama. Positions use floor tiles:
 *   - floor things sit at (x, y) on the floor grid, measured from the back corner
 *   - wall things hang on the left or right wall: x tiles along it, y px above the floor
 * Rugs lie flat on the floor under everything else. The artwork lives in
 * components/room/RoomArt; this file is plain data and geometry so the store can use it.
 */

export type RoomCategory = "furniture" | "decor" | "pets" | "finishes" | "rooms";
export type RoomItemKind = "item" | "wallpaper" | "flooring" | "style";
export type RoomPlacement = "floor" | "rug" | "wall";
export type WallSide = "left" | "right";

export interface RoomItem {
  /** Always starts with "room-" so it can't clash with reward ids */
  id: string;
  name: string;
  kind: RoomItemKind;
  category: RoomCategory;
  cost: number;
  /** Every student starts with this */
  starter?: boolean;
  /** Where a placeable item goes */
  place?: RoomPlacement;
  /** Floor and rug things: size on the floor in tiles, [along x, along y] */
  footprint?: [number, number];
  /** Wall things: width and height in px */
  wallSize?: [number, number];
  /** The most a student can own (pets are one of a kind) */
  max?: number;
  /** The avatar can sit on it */
  seat?: boolean;
}

export interface PlacedRoomItem {
  uid: string;
  itemId: string;
  x: number;
  y: number;
  wall?: WallSide;
  flip?: boolean;
}

export interface RoomPos {
  x: number;
  y: number;
  wall?: WallSide;
}

/*
 * Prices are pitched against what students earn: a finished mission puts about
 * 30–80 tokens into Spend, so most things cost one or two missions, and the
 * biggest goals (the cat, a new room) take roughly 4–8 weeks of saving.
 */
export const ROOM_ITEMS: RoomItem[] = [
  // Furniture
  { id: "room-cozy-bed", name: "Cozy bed", kind: "item", category: "furniture", cost: 0, starter: true, max: 1, place: "floor", footprint: [1.4, 2.2], seat: true },
  { id: "room-lavender-rug", name: "Lavender rug", kind: "item", category: "furniture", cost: 0, starter: true, max: 1, place: "rug", footprint: [2.6, 2.6] },
  { id: "room-toy-chest", name: "Toy chest", kind: "item", category: "furniture", cost: 30, place: "floor", footprint: [0.9, 1.3] },
  { id: "room-mint-rug", name: "Mint stripe rug", kind: "item", category: "furniture", cost: 40, place: "rug", footprint: [2.2, 3] },
  { id: "room-bookcase", name: "Bookcase", kind: "item", category: "furniture", cost: 45, place: "floor", footprint: [0.7, 1.6] },
  { id: "room-study-desk", name: "Study desk", kind: "item", category: "furniture", cost: 50, place: "floor", footprint: [1, 1.8] },
  { id: "room-bean-bag", name: "Bean bag", kind: "item", category: "furniture", cost: 60, place: "floor", footprint: [1.2, 1.2], seat: true },
  { id: "room-couch", name: "Comfy couch", kind: "item", category: "furniture", cost: 85, place: "floor", footprint: [1.1, 2.4], seat: true },

  // Decor
  { id: "room-sunny-window", name: "Sunny window", kind: "item", category: "decor", cost: 0, starter: true, max: 1, place: "wall", wallSize: [102, 82] },
  { id: "room-save-poster", name: "“Save!” poster", kind: "item", category: "decor", cost: 25, place: "wall", wallSize: [57, 73] },
  { id: "room-cactus", name: "Happy cactus", kind: "item", category: "decor", cost: 25, place: "floor", footprint: [0.7, 0.7] },
  { id: "room-rocket-poster", name: "Rocket poster", kind: "item", category: "decor", cost: 30, place: "wall", wallSize: [57, 73] },
  { id: "room-monstera", name: "Monstera plant", kind: "item", category: "decor", cost: 30, place: "floor", footprint: [0.8, 0.8] },
  { id: "room-wall-clock", name: "Wall clock", kind: "item", category: "decor", cost: 35, place: "wall", wallSize: [50, 50] },
  { id: "room-bookshelf", name: "Wall shelf", kind: "item", category: "decor", cost: 40, place: "wall", wallSize: [81, 37] },
  { id: "room-cozy-lamp", name: "Cozy lamp", kind: "item", category: "decor", cost: 45, place: "floor", footprint: [0.6, 0.6] },
  { id: "room-string-lights", name: "String lights", kind: "item", category: "decor", cost: 55, place: "wall", wallSize: [150, 34] },
  { id: "room-starry-window", name: "Starry night window", kind: "item", category: "decor", cost: 60, place: "wall", wallSize: [102, 82] },

  // Pets
  { id: "room-fishbowl", name: "Goldfish bowl", kind: "item", category: "pets", cost: 70, place: "floor", footprint: [0.7, 0.7], max: 1 },
  { id: "room-cat", name: "Sunny the cat", kind: "item", category: "pets", cost: 120, place: "floor", footprint: [0.8, 0.8], max: 1 },

  // Walls and floors
  { id: "room-paper-cream", name: "Cream dots", kind: "wallpaper", category: "finishes", cost: 0, starter: true },
  { id: "room-floor-honey-wood", name: "Honey wood floor", kind: "flooring", category: "finishes", cost: 0, starter: true },
  { id: "room-paper-mint-stripes", name: "Mint stripes", kind: "wallpaper", category: "finishes", cost: 30 },
  { id: "room-floor-mint-carpet", name: "Mint carpet", kind: "flooring", category: "finishes", cost: 30 },
  { id: "room-paper-peach-check", name: "Peach check", kind: "wallpaper", category: "finishes", cost: 30 },
  { id: "room-paper-lavender-stars", name: "Lavender stars", kind: "wallpaper", category: "finishes", cost: 35 },
  { id: "room-floor-checker", name: "Checker tiles", kind: "flooring", category: "finishes", cost: 35 },
  { id: "room-floor-lavender-tiles", name: "Lavender tiles", kind: "flooring", category: "finishes", cost: 35 },
  { id: "room-paper-sky-clouds", name: "Sky clouds", kind: "wallpaper", category: "finishes", cost: 40 },

  // Rooms
  { id: "room-style-classic", name: "Classic room", kind: "style", category: "rooms", cost: 0, starter: true },
  { id: "room-style-treehouse", name: "Treehouse", kind: "style", category: "rooms", cost: 150 },
  { id: "room-style-loft", name: "Big loft", kind: "style", category: "rooms", cost: 200 },
];

/** Room shapes: how many tiles across the floor is, and how tall the walls are (px) */
export const ROOM_STYLES: Record<string, { size: number; wallHeight: number; blurb: string }> = {
  "room-style-classic": { size: 7, wallHeight: 170, blurb: "Your first room" },
  "room-style-treehouse": { size: 8, wallHeight: 176, blurb: "Up in the leaves, a bit roomier" },
  "room-style-loft": { size: 9, wallHeight: 200, blurb: "The biggest room, lots of space" },
};

export const DEFAULT_STYLE = "room-style-classic";
export const DEFAULT_WALLPAPER = "room-paper-cream";
export const DEFAULT_FLOORING = "room-floor-honey-wood";

export function getRoomItem(id: string | undefined): RoomItem | undefined {
  return id ? ROOM_ITEMS.find((i) => i.id === id) : undefined;
}

export function isRoomItemId(id: string | undefined): boolean {
  return !!id && id.startsWith("room-");
}

export function roomGeometry(styleId: string) {
  return ROOM_STYLES[styleId] ?? ROOM_STYLES[DEFAULT_STYLE];
}

/** Floor size in tiles, swapped when the item is turned */
export function footprintOf(item: RoomItem, flip = false): [number, number] {
  const [a, b] = item.footprint ?? [1, 1];
  return flip ? [b, a] : [a, b];
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Keep a position inside the room for this item */
export function clampPos(item: RoomItem, pos: RoomPos, styleId: string, flip = false): RoomPos {
  const g = roomGeometry(styleId);
  if (item.place === "wall") {
    const [w, h] = item.wallSize ?? [60, 60];
    const half = w / 64;
    return {
      wall: pos.wall ?? "left",
      x: clamp(pos.x, half + 0.15, g.size - half - 0.15),
      y: clamp(pos.y, h / 2 + 14, g.wallHeight - h / 2 - 10),
    };
  }
  const [a, b] = footprintOf(item, flip);
  return { x: clamp(pos.x, a / 2, g.size - a / 2), y: clamp(pos.y, b / 2, g.size - b / 2) };
}

/** Gap between two floor rectangles (negative when they overlap) */
function floorGap(ax: number, ay: number, [aw, ad]: [number, number], bx: number, by: number, [bw, bd]: [number, number]) {
  return Math.max(Math.abs(ax - bx) - (aw + bw) / 2, Math.abs(ay - by) - (ad + bd) / 2);
}

/**
 * A good free spot for something new: away from what's already there,
 * and otherwise close to `prefer` (the middle of the floor by default).
 */
export function findSpot(
  item: Pick<RoomItem, "place" | "footprint" | "wallSize">,
  items: PlacedRoomItem[],
  styleId: string,
  prefer?: { x: number; y: number },
): RoomPos {
  const g = roomGeometry(styleId);
  const N = g.size;
  const others = items
    .map((p) => ({ p, item: getRoomItem(p.itemId) }))
    .filter((o): o is { p: PlacedRoomItem; item: RoomItem } => !!o.item && o.item.place === item.place);

  if (item.place === "wall") {
    const [w, h] = item.wallSize ?? [60, 60];
    const half = w / 64;
    let best: RoomPos = { wall: "left", x: N / 2, y: g.wallHeight * 0.55 };
    let bestScore = -Infinity;
    for (const wall of ["left", "right"] as const) {
      for (let x = half + 0.3; x <= N - half - 0.3; x += 0.25) {
        for (const yf of [0.56, 0.42, 0.7]) {
          const y = clamp(g.wallHeight * yf, h / 2 + 14, g.wallHeight - h / 2 - 10);
          let gap = 4;
          for (const o of others) {
            if (o.p.wall !== wall) continue;
            const [ow, oh] = o.item.wallSize ?? [60, 60];
            const gx = Math.abs(x - o.p.x) * 32 - (w + ow) / 2;
            const gy = Math.abs(y - o.p.y) - (h + oh) / 2;
            gap = Math.min(gap, Math.max(gx, gy) / 32);
          }
          const score = Math.min(gap, 1) * 10 - Math.abs(yf - 0.56) * 4 - Math.abs(x - N / 2) * 0.2 + (wall === "left" ? 0.05 : 0);
          if (score > bestScore) {
            bestScore = score;
            best = { wall, x, y };
          }
        }
      }
    }
    return best;
  }

  const fp = item.footprint ?? [1, 1];
  const target = prefer ?? { x: N / 2, y: N / 2 };
  let best: RoomPos = { x: clamp(target.x, fp[0] / 2, N - fp[0] / 2), y: clamp(target.y, fp[1] / 2, N - fp[1] / 2) };
  let bestScore = -Infinity;
  for (let x = fp[0] / 2; x <= N - fp[0] / 2 + 1e-9; x += 0.25) {
    for (let y = fp[1] / 2; y <= N - fp[1] / 2 + 1e-9; y += 0.25) {
      let gap = 3;
      for (const o of others) gap = Math.min(gap, floorGap(x, y, fp, o.p.x, o.p.y, footprintOf(o.item, o.p.flip)));
      const score = Math.min(gap, item.place === "rug" ? 0 : 0.6) * 10 - Math.hypot(x - target.x, y - target.y);
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
  }
  return best;
}

/** How many of each placeable item are owned but not in the room */
export function itemsInStorage(owned: Record<string, number>, items: PlacedRoomItem[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, n] of Object.entries(owned)) {
    const item = getRoomItem(id);
    if (!item || item.kind !== "item") continue;
    const left = n - items.filter((p) => p.itemId === id).length;
    if (left > 0) out[id] = left;
  }
  return out;
}
