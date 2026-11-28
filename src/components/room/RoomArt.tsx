"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  clampPos,
  findSpot,
  footprintOf,
  getRoomItem,
  roomGeometry,
  type PlacedRoomItem,
  type RoomItem,
  type RoomPos,
  type WallSide,
} from "@/lib/roomCatalog";
import type { AvatarLook } from "@/lib/avatar";

/*
 * The room is a little isometric diorama in the Finity doodle style: thick ink
 * outlines and pastels, with every surface shaded by which way it faces (tops
 * lightest, right-facing sides darkest) so flat drawings read as solid things.
 *
 * Coordinates: a floor tile is 64×32 on screen. Floor point (x, y) in tiles, at
 * height z, lands at iso(x, y, z). The back corner of the room is (0, 0).
 */

const INK = "#141414";
const TW = 32; // half a tile's width
const TH = 16; // half a tile's height
const WALL_T = 0.22; // wall thickness, tiles
const SLAB = 18; // floor thickness, px

export const iso = (u: number, v: number, z = 0): [number, number] => [(u - v) * TW, (u + v) * TH - z];
const pts = (...p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const line = (...p: [number, number][]) => `M${p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}`;

/** Darken a #rrggbb colour (f < 1) */
function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.round(((n >> s) & 255) * f);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

/* ------------------------------------------------------------------
   Iso furniture: built from shaded boxes
------------------------------------------------------------------- */

type Box = [u0: number, u1: number, v0: number, v1: number, z0: number, z1: number];

interface IsoCtx {
  /** A solid box in the item's own coordinates (turned when the item is flipped) */
  box: (b: Box, color: string, key?: string | number) => React.ReactNode;
  /** A point in the item's own coordinates, on screen */
  pt: (u: number, v: number, z: number) => [number, number];
  flipped: boolean;
}

function makeCtx(flip: boolean): IsoCtx {
  const pt = (u: number, v: number, z: number) => (flip ? iso(v, u, z) : iso(u, v, z));
  const box = ([u0, u1, v0, v1, z0, z1]: Box, color: string, key?: string | number) => {
    const [a0, a1, b0, b1] = flip ? [v0, v1, u0, u1] : [u0, u1, v0, v1];
    return (
      <g key={key} stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        {/* +y face (faces down-left), +x face (faces down-right), then the top */}
        <polygon points={pts(iso(a0, b1, z0), iso(a1, b1, z0), iso(a1, b1, z1), iso(a0, b1, z1))} fill={shade(color, 0.9)} />
        <polygon points={pts(iso(a1, b0, z0), iso(a1, b1, z0), iso(a1, b1, z1), iso(a1, b0, z1))} fill={shade(color, 0.77)} />
        <polygon points={pts(iso(a0, b0, z1), iso(a1, b0, z1), iso(a1, b1, z1), iso(a0, b1, z1))} fill={color} />
      </g>
    );
  };
  return { box, pt, flipped: flip };
}

const WOOD = "#e8cfa6";
const WOOD_DARK = "#c99c68";

/** Furniture drawn in its own coordinates, centred on (0, 0), front facing +x */
const ISO_ART: Record<string, { height: number; draw: (c: IsoCtx) => React.ReactNode; seat?: [number, number, number] }> = {
  "room-cozy-bed": {
    height: 58,
    seat: [0.05, 0.35, 27],
    draw: (c) => {
      // Arched headboard: a curved top edge on its front and back faces
      const arch = (v: number) =>
        Array.from({ length: 13 }, (_, i) => {
          const u = -0.72 + (i / 12) * 1.44;
          return c.pt(u, v, 44 + 13 * Math.sqrt(Math.max(0, 1 - (u / 0.72) ** 2)));
        });
      const front = arch(-0.96);
      const back = arch(-1.1);
      const blanket = { u0: -0.7, u1: 0.71, v0: -0.28, v1: 1.09, top: 25.5, hem: 9 };
      const pink = "#f2b0cf";
      return (
        <>
          {c.box([-0.72, 0.72, -1.1, -0.96, 0, 44], WOOD_DARK, "head")}
          <polygon key="headTop" points={pts(...front, ...back.reverse())} fill={shade(WOOD_DARK, 1.08)} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <polygon key="headFace" points={pts(c.pt(-0.72, -0.96, 0), ...front, c.pt(0.72, -0.96, 0))} fill={shade(WOOD_DARK, 0.92)} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          {c.box([-0.7, 0.7, -0.96, 1.08, 0, 13], WOOD, "frame")}
          {c.box([-0.66, 0.66, -0.94, 1.02, 13, 25], "#fbf8f2", "mattress")}
          {/* puffy pillow: two rounded layers */}
          {[
            [25, "#e6e1d8"],
            [30.5, "#ffffff"],
          ].map(([z, fill]) => (
            <g key={`pillow${z}`} transform={`translate(0 ${-z})`}>
              <g transform={floorMatrix(c.flipped)}>
                <rect x="-0.48" y="-0.89" width="0.96" height="0.42" rx="0.14" fill={fill as string} stroke={INK} strokeWidth="2.5" {...NS} />
              </g>
            </g>
          ))}
          {/* blanket draped over the end of the mattress */}
          <g key="blanket" stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
            <polygon points={pts(c.pt(blanket.u0, blanket.v1, blanket.top), c.pt(blanket.u1, blanket.v1, blanket.top), c.pt(blanket.u1, blanket.v1, blanket.hem), c.pt(blanket.u0, blanket.v1, blanket.hem))} fill={shade(pink, 0.9)} />
            <polygon points={pts(c.pt(blanket.u1, blanket.v0, blanket.top), c.pt(blanket.u1, blanket.v1, blanket.top), c.pt(blanket.u1, blanket.v1, blanket.hem), c.pt(blanket.u1, blanket.v0, blanket.hem))} fill={shade(pink, 0.78)} />
            <polygon points={pts(c.pt(blanket.u0, blanket.v0, blanket.top), c.pt(blanket.u1, blanket.v0, blanket.top), c.pt(blanket.u1, blanket.v1, blanket.top), c.pt(blanket.u0, blanket.v1, blanket.top))} fill={pink} />
            {/* folded-back edge */}
            <polygon points={pts(c.pt(blanket.u0, blanket.v0, blanket.top + 0.5), c.pt(blanket.u1, blanket.v0, blanket.top + 0.5), c.pt(blanket.u1, blanket.v0 + 0.2, blanket.top + 0.5), c.pt(blanket.u0, blanket.v0 + 0.2, blanket.top + 0.5))} fill="#f9d5e5" strokeWidth="2" />
            {/* a few stitched dots */}
            {[0.35, 0.75].flatMap((v) =>
              [-0.35, 0, 0.35].map((u) => {
                const [x, y] = c.pt(u, v, blanket.top);
                return <circle key={`${u}${v}`} cx={x} cy={y} r="1.8" fill="#fff" stroke="none" />;
              }),
            )}
          </g>
        </>
      );
    },
  },
  "room-study-desk": {
    height: 50,
    draw: (c) => (
      <>
        {[-0.45, 0.38].flatMap((u) =>
          [-0.85, 0.79].map((v) => c.box([u, u + 0.07, v, v + 0.07, 0, 34], WOOD_DARK, `leg${u}${v}`)),
        )}
        {c.box([-0.46, 0.44, 0.28, 0.86, 0, 34], WOOD, "drawers")}
        <path key="seam" d={line(c.pt(0.44, 0.33, 17), c.pt(0.44, 0.81, 17))} stroke={INK} strokeWidth="2" fill="none" />
        {c.box([-0.5, 0.5, -0.9, 0.9, 34, 40], "#f0d9b5", "top")}
        {c.box([-0.3, 0.08, -0.62, -0.26, 40, 46], "#b6c1f5", "book1")}
        {c.box([-0.27, 0.05, -0.6, -0.3, 46, 50], "#f2b0cf", "book2")}
        {c.box([-0.12, 0.08, 0.42, 0.62, 40, 50], "#aee2c2", "mug")}
      </>
    ),
  },
  "room-bookcase": {
    height: 100,
    draw: (c) => {
      const shelves: [number, number][] = [
        [8, 34],
        [38, 64],
        [68, 92],
      ];
      const colors = ["#b6c1f5", "#f2b0cf", "#aee2c2", "#f6c88f", "#f4e297", "#d6c6f4"];
      const books: React.ReactNode[] = [];
      shelves.forEach(([z0, z1], si) => {
        let v = -0.7;
        let i = si * 2;
        while (v < 0.55) {
          const w = 0.09 + ((i * 7) % 4) * 0.025;
          const top = z1 - 3 - ((i * 5) % 3) * 4;
          books.push(
            <polygon
              key={`b${si}-${i}`}
              points={pts(c.pt(0.36, v, z0), c.pt(0.36, v + w, z0), c.pt(0.36, v + w, top), c.pt(0.36, v, top))}
              fill={colors[i % colors.length]}
              stroke={INK}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />,
          );
          v += w + 0.015;
          i++;
          if (si === 1 && v > 0.1) break;
        }
      });
      return (
        <>
          {c.box([-0.35, 0.35, -0.8, 0.8, 0, 100], WOOD, "case")}
          {shelves.map(([z0, z1]) => (
            <polygon
              key={`s${z0}`}
              points={pts(c.pt(0.355, -0.72, z0), c.pt(0.355, 0.72, z0), c.pt(0.355, 0.72, z1), c.pt(0.355, -0.72, z1))}
              fill="#8f6a44"
              stroke={INK}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ))}
          {books}
        </>
      );
    },
  },
  "room-toy-chest": {
    height: 40,
    draw: (c) => {
      const star = Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 ? 0.45 : 1;
        return c.pt(0.452, Math.cos(a) * 0.17 * r, 14 - Math.sin(a) * 8 * r);
      });
      return (
        <>
          {c.box([-0.45, 0.45, -0.65, 0.65, 0, 28], "#f6c88f", "chest")}
          {c.box([-0.48, 0.48, -0.68, 0.68, 28, 36], "#e9a96a", "lid")}
          <polygon key="star" points={pts(...star)} fill="#f4e297" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </>
      );
    },
  },
  "room-couch": {
    height: 50,
    seat: [0.12, 0.2, 27],
    draw: (c) => (
      <>
        {c.box([-0.55, -0.24, -1.2, 1.2, 0, 50], "#b6c1f5", "back")}
        {c.box([-0.55, 0.55, -1.2, -0.94, 0, 34], "#a9b5f2", "armL")}
        {c.box([-0.24, 0.55, -0.94, 0.94, 0, 18], "#a9b5f2", "base")}
        {c.box([-0.24, 0.52, -0.94, -0.01, 18, 27], "#ccd4fb", "c1")}
        {c.box([-0.24, 0.52, 0.01, 0.94, 18, 27], "#ccd4fb", "c2")}
        {c.box([-0.55, 0.55, 0.94, 1.2, 0, 34], "#a9b5f2", "armR")}
      </>
    ),
  },
};

/* ------------------------------------------------------------------
   Things that stand on the floor as flat cut-outs (plants, pets…)
   Drawn in their own art space; `anchor` is where they touch the floor.
------------------------------------------------------------------- */

const PLANT_POT = (
  <>
    <path d="M26 100h52l-7 42H33Z" fill="#e5cfae" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    <rect x="20" y="90" width="60" height="14" rx="5" fill="#d9b98c" stroke={INK} strokeWidth="4" />
  </>
);

const STAND_ART: Record<string, { art: React.ReactNode; anchor: [number, number]; scale: number; thumb: string; seat?: number }> = {
  "room-bean-bag": {
    anchor: [147, 389],
    scale: 0.56,
    thumb: "40 255 210 150",
    seat: 30,
    art: (
      <svg x="50" y="268" width="190" height="131" viewBox="0 0 160 110">
        <ellipse cx="82" cy="102" rx="70" ry="7" fill={INK} />
        <path d="M20 95C5 60 30 20 80 18C130 16 158 55 142 95Z" fill="#f2b0cf" stroke={INK} strokeWidth="5" />
        <path d="M45 40c10-10 25-14 40-13" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M60 95c4-20 16-34 34-40" stroke={INK} strokeWidth="3" fill="none" opacity="0.45" strokeLinecap="round" />
      </svg>
    ),
  },
  "room-monstera": {
    anchor: [548, 372],
    scale: 0.62,
    thumb: "490 230 112 155",
    art: (
      <svg x="500" y="240" width="92" height="138" viewBox="0 0 100 150">
        <ellipse cx="52" cy="143" rx="34" ry="6" fill={INK} />
        <g className="room-sway">
          <path d="M50 95C50 70 48 50 52 28" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M50 70C30 72 16 60 14 42C32 40 47 52 50 70Z" fill="#aee2c2" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M51 50C52 30 66 16 86 16C86 36 72 50 51 50Z" fill="#7fd0a1" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </g>
        {PLANT_POT}
      </svg>
    ),
  },
  "room-cactus": {
    anchor: [548, 372],
    scale: 0.55,
    thumb: "490 230 112 155",
    art: (
      <svg x="500" y="240" width="92" height="138" viewBox="0 0 100 150">
        <ellipse cx="52" cy="143" rx="34" ry="6" fill={INK} />
        <path d="M38 92V48c0-16 24-16 24 0v44Z" fill="#7fd0a1" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M38 70H28c-6 0-8-4-8-10V50c0-6 9-6 9 0v8h9" fill="#7fd0a1" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M62 62h9V52c0-6 9-6 9 0v8c0 6-2 10-8 10H62" fill="#7fd0a1" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="46" cy="60" r="1.8" fill={INK} />
        <circle cx="55" cy="60" r="1.8" fill={INK} />
        <path d="M46 67q4.5 4 9 0" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle className="room-sway" cx="50" cy="35" r="5" fill="#f2b0cf" stroke={INK} strokeWidth="2.5" />
        {PLANT_POT}
      </svg>
    ),
  },
  "room-cozy-lamp": {
    anchor: [433, 306],
    scale: 0.8,
    thumb: "385 170 100 160",
    art: (
      <svg x="405" y="190" width="56" height="125" viewBox="0 0 80 170">
        <circle className="room-glow" cx="40" cy="38" r="34" fill="#f4e297" opacity="0.35" />
        <ellipse cx="40" cy="162" rx="26" ry="6" fill={INK} />
        <path d="M40 60v95" stroke={INK} strokeWidth="5" />
        <ellipse cx="40" cy="155" rx="20" ry="6" fill="#d6c6f4" stroke={INK} strokeWidth="4" />
        <path d="M18 58h44l-9-38H27Z" fill="#f6c88f" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    ),
  },
  "room-fishbowl": {
    anchor: [348, 382],
    scale: 0.5,
    thumb: "290 282 116 116",
    art: (
      <svg x="300" y="292" width="96" height="96" viewBox="0 0 110 110">
        <ellipse cx="55" cy="103" rx="36" ry="5" fill={INK} />
        <path d="M30 26h50c22 12 26 52 6 70H24C4 78 8 38 30 26Z" fill="#e5f3fa" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M14 56c26-6 56-6 82 0v4c0 20-6 30-14 36H28c-8-6-14-16-14-36Z" fill="#a9d9ef" />
        <path d="M30 26h50" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <g className="room-swim">
          <path d="M48 70c8-10 22-10 28 0-6 10-20 10-28 0Z" fill="#f6c88f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M48 70l-9-7v14Z" fill="#f6c88f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="68" cy="68" r="2" fill={INK} />
        </g>
        <circle cx="84" cy="50" r="3" fill="none" stroke={INK} strokeWidth="2" />
        <circle cx="78" cy="40" r="2" fill="none" stroke={INK} strokeWidth="2" />
      </svg>
    ),
  },
  "room-cat": {
    anchor: [348, 382],
    scale: 0.55,
    thumb: "290 282 116 116",
    art: (
      <svg x="300" y="292" width="96" height="96" viewBox="0 0 110 110">
        <ellipse cx="55" cy="103" rx="38" ry="5" fill={INK} />
        <g className="room-tail">
          <path d="M82 90c18-2 22-22 8-26" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M82 90c18-2 22-22 8-26" stroke="#f4e297" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        <ellipse cx="55" cy="78" rx="30" ry="24" fill="#f4e297" stroke={INK} strokeWidth="4" />
        <path d="M33 30 30 8 48 22ZM77 30 80 8 62 22Z" fill="#f4e297" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="55" cy="40" r="24" fill="#f4e297" stroke={INK} strokeWidth="4" />
        <path d="M42 40q4-4 8 0M60 40q4-4 8 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M52 48l3 3 3-3Z" fill={INK} />
        <ellipse cx="40" cy="49" rx="5" ry="3" fill="#f2b0cf" />
        <ellipse cx="70" cy="49" rx="5" ry="3" fill="#f2b0cf" />
      </svg>
    ),
  },
};

/* ------------------------------------------------------------------
   Wall things: drawn flat in their own art space (`box`), then skewed
   onto whichever wall they hang on.
------------------------------------------------------------------- */

function PosterFrame({ children }: { children: React.ReactNode }) {
  return (
    <g transform="rotate(3 487 122)">
      <svg x="440" y="58" width="95" height="124" viewBox="0 0 100 130">
        <rect x="5" y="8" width="90" height="117" rx="6" fill="#fff" stroke={INK} strokeWidth="4" />
        <rect x="36" y="2" width="28" height="12" rx="2" fill="#f4e297" opacity="0.85" />
        {children}
      </svg>
    </g>
  );
}

const LIGHT_BULBS: [number, number, string][] = [
  [14, 11, "#f6c88f"],
  [34, 17, "#b6c1f5"],
  [55, 15, "#aee2c2"],
  [75, 8, "#f2b0cf"],
  [95, 15, "#f4e297"],
  [116, 17, "#b6c1f5"],
  [136, 11, "#f6c88f"],
];

const WALL_ART: Record<string, { art: React.ReactNode; box: [number, number, number, number] }> = {
  "room-sunny-window": {
    box: [55, 45, 170, 136],
    art: (
      <svg x="55" y="45" width="170" height="136" viewBox="0 0 150 120">
        <rect x="5" y="5" width="140" height="110" rx="10" fill="#a9d9ef" stroke={INK} strokeWidth="5" />
        <circle cx="108" cy="36" r="14" fill="#f4e297" stroke={INK} strokeWidth="3" />
        <path className="room-cloud" d="M22 88c0-8 9-12 15-8 3-8 16-8 18 1 7-1 10 7 4 9H24c-2 0-2-1-2-2Z" fill="#fff" stroke={INK} strokeWidth="3" />
        <path d="M75 5v110M5 60h140" stroke={INK} strokeWidth="4" />
      </svg>
    ),
  },
  "room-starry-window": {
    box: [55, 45, 170, 136],
    art: (
      <svg x="55" y="45" width="170" height="136" viewBox="0 0 150 120">
        <rect x="5" y="5" width="140" height="110" rx="10" fill="#4a4c6a" stroke={INK} strokeWidth="5" />
        <path d="M112 22a14 14 0 1 0 10 24 11 11 0 1 1-10-24Z" fill="#f4e297" stroke={INK} strokeWidth="2.5" />
        {[
          [28, 24],
          [52, 40],
          [34, 82],
          [96, 86],
          [124, 74],
          [60, 98],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 5}l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6Z`} fill="#fff" />
        ))}
        <path d="M75 5v110M5 60h140" stroke={INK} strokeWidth="4" />
      </svg>
    ),
  },
  "room-wall-clock": {
    box: [287, 55, 80, 80],
    art: (
      <svg x="287" y="55" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="42" cy="42" r="34" fill={INK} />
        <circle cx="40" cy="40" r="34" fill="#fff" stroke={INK} strokeWidth="5" />
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d="M40 12v6" stroke={INK} strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 40 40)`} />
        ))}
        <path d="M40 40l12 8" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path className="room-tick" d="M40 40V20" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="40" cy="40" r="3" fill={INK} />
      </svg>
    ),
  },
  "room-bookshelf": {
    box: [260, 160, 134, 62],
    art: (
      <g>
        <rect x="262" y="210" width="130" height="9" rx="2" fill="#d9b98c" stroke={INK} strokeWidth="3" />
        <g stroke={INK} strokeWidth="3">
          <rect x="275" y="170" width="15" height="40" rx="2" fill="#b6c1f5" />
          <rect x="292" y="176" width="13" height="34" rx="2" fill="#f2b0cf" />
          <rect x="307" y="166" width="17" height="44" rx="2" fill="#aee2c2" />
          <rect x="330" y="181" width="14" height="38" rx="2" fill="#f6c88f" transform="rotate(14 337 210)" />
        </g>
        <circle cx="372" cy="200" r="9" fill="#f4e297" stroke={INK} strokeWidth="3" />
      </g>
    ),
  },
  "room-save-poster": {
    box: [434, 52, 106, 136],
    art: (
      <PosterFrame>
        <g stroke={INK} strokeWidth="3">
          <path d="M30 92v6a20 7 0 0 0 40 0v-6Z" fill="#e2a55c" />
          <ellipse cx="50" cy="92" rx="20" ry="7" fill="#f6c88f" />
          <path d="M30 80v6a20 7 0 0 0 40 0v-6Z" fill="#e2a55c" />
          <ellipse cx="50" cy="80" rx="20" ry="7" fill="#f6c88f" />
          <path d="M30 68v6a20 7 0 0 0 40 0v-6Z" fill="#e2a55c" />
          <ellipse cx="50" cy="68" rx="20" ry="7" fill="#f6c88f" />
        </g>
        <text x="50" y="44" textAnchor="middle" fontFamily="var(--font-fraunces), Georgia, serif" fontSize="22" fill={INK}>
          Save!
        </text>
      </PosterFrame>
    ),
  },
  "room-rocket-poster": {
    box: [434, 52, 106, 136],
    art: (
      <PosterFrame>
        <rect x="11" y="14" width="78" height="105" rx="3" fill="#3f4160" />
        <circle cx="26" cy="32" r="2" fill="#fff" />
        <circle cx="74" cy="44" r="1.6" fill="#fff" />
        <circle cx="70" cy="100" r="2" fill="#fff" />
        <path d="M50 26c12 12 14 34 8 54H42c-6-20-4-42 8-54Z" fill="#b6c1f5" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="7" fill="#fff" stroke={INK} strokeWidth="3" />
        <path d="M42 70l-9 12 10-2M58 70l9 12-10-2" fill="#f2b0cf" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M45 82c0 8 2 14 5 18 3-4 5-10 5-18Z" fill="#f6c88f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </PosterFrame>
    ),
  },
  "room-string-lights": {
    box: [0, 0, 150, 34],
    art: (
      <g>
        <path d="M2 4C30 22 50 22 75 6C100 22 120 22 148 4" fill="none" stroke={INK} strokeWidth="2.5" />
        {LIGHT_BULBS.map(([x, y, c], i) => (
          <g key={i}>
            <circle className="room-twinkle" style={{ animationDelay: `${(i * 0.37) % 2.2}s` }} cx={x} cy={y + 9} r="9" fill={c} opacity="0.35" />
            <path d={`M${x} ${y}c-4 2.5-5 10 0 13 5-3 4-10.5 0-13Z`} fill={c} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          </g>
        ))}
      </g>
    ),
  },
};

/** Where a wall point sits on screen, and the skew that lays flat art onto that wall */
function wallTransform(wall: WallSide, s: number, h: number) {
  const X = wall === "left" ? -TW * s : TW * s;
  return `translate(${X} ${TH * s - h}) matrix(1 ${wall === "left" ? -0.5 : 0.5} 0 1 0 0)`;
}
/** Screen point → position on a wall */
function wallPosFromScreen(X: number, Y: number): { wall: WallSide; x: number; y: number } {
  const wall: WallSide = X < 0 ? "left" : "right";
  const s = Math.abs(X) / TW;
  return { wall, x: s, y: TH * s - Y };
}
/** Screen point → floor position */
const floorPosFromScreen = (X: number, Y: number) => ({ x: (X / TW + Y / TH) / 2, y: (Y / TH - X / TW) / 2 });

/* ------------------------------------------------------------------
   Rugs: drawn flat in floor tiles, centred on (0, 0)
------------------------------------------------------------------- */

const NS = { vectorEffect: "non-scaling-stroke" as const };
const RUG_ART: Record<string, React.ReactNode> = {
  "room-lavender-rug": (
    <>
      <circle r="1.3" fill="#d6c6f4" stroke={INK} strokeWidth="3" {...NS} />
      <circle r="1.02" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="5 6" opacity="0.45" {...NS} />
      <circle r="0.5" fill="#e6dcfa" />
    </>
  ),
  "room-mint-rug": (
    <>
      <rect x="-1.1" y="-1.5" width="2.2" height="3" rx="0.25" fill="#aee2c2" stroke={INK} strokeWidth="3" {...NS} />
      {[-1.05, -0.45, 0.15, 0.75].map((y) => (
        <rect key={y} x="-1.1" y={y} width="2.2" height="0.26" fill="#7fd0a1" />
      ))}
      <rect x="-1.1" y="-1.5" width="2.2" height="3" rx="0.25" fill="none" stroke={INK} strokeWidth="3" {...NS} />
    </>
  ),
};
const floorMatrix = (flip?: boolean) => (flip ? `matrix(${-TW} ${TH} ${TW} ${TH} 0 0)` : `matrix(${TW} ${TH} ${-TW} ${TH} 0 0)`);

/* ------------------------------------------------------------------
   Walls, floors and room styles
------------------------------------------------------------------- */

/** Wallpapers: a base colour and a repeating pattern, drawn flat in wall space */
const WALLPAPERS: Record<string, { bg: string; pattern: (id: string) => React.ReactNode }> = {
  "room-paper-cream": {
    bg: "#fbf6dc",
    pattern: (id) => (
      <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="11" cy="11" r="1.7" fill="#eadb9f" />
      </pattern>
    ),
  },
  "room-paper-mint-stripes": {
    bg: "#e8f6ed",
    pattern: (id) => (
      <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
        <rect width="13" height="28" fill="#cdecd9" />
      </pattern>
    ),
  },
  "room-paper-peach-check": {
    bg: "#fdf1e6",
    pattern: (id) => (
      <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
        <rect width="12" height="26" fill="#f9d9bf" opacity="0.6" />
        <rect width="26" height="12" fill="#f9d9bf" opacity="0.6" />
      </pattern>
    ),
  },
  "room-paper-lavender-stars": {
    bg: "#efe9fb",
    pattern: (id) => (
      <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
        {[
          [10, 10],
          [30, 30],
        ].map(([x, y]) => (
          <path key={x} d={`M${x} ${y - 5}l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6Z`} fill="#cdbdf1" />
        ))}
      </pattern>
    ),
  },
  "room-paper-sky-clouds": {
    bg: "#e2f0fb",
    pattern: (id) => (
      <pattern id={id} width="80" height="56" patternUnits="userSpaceOnUse">
        <path d="M8 22c0-6 7-9 11-6 2-6 12-6 14 1 5-1 8 5 3 7H10c-1.5 0-2-1-2-2Z" fill="#fff" />
        <path d="M48 50c0-5 6-7 9-5 2-5 10-5 11 1 4-1 6 4 2 5H50c-1 0-2-.5-2-1Z" fill="#fff" />
      </pattern>
    ),
  },
};

/** Floors, drawn flat in floor tiles over an N×N grid */
const FLOORINGS: Record<string, { edge: string; draw: (n: number) => React.ReactNode }> = {
  "room-floor-honey-wood": {
    edge: "#d9bf99",
    draw: (n) => (
      <>
        <rect width={n} height={n} fill="#ecd6b3" />
        <g stroke="#d3b88c" strokeWidth="1.6" {...NS}>
          {Array.from({ length: n * 2 - 1 }, (_, k) => (
            <path key={k} d={`M0 ${(k + 1) / 2}H${n}`} {...NS} />
          ))}
          {Array.from({ length: n * 2 }, (_, k) =>
            Array.from({ length: Math.ceil(n / 2) + 1 }, (_, m) => {
              const x = ((k * 1.3) % 2) + m * 2;
              return x > 0 && x < n ? <path key={`${k}-${m}`} d={`M${x} ${k / 2}v0.5`} {...NS} /> : null;
            }),
          )}
        </g>
      </>
    ),
  },
  "room-floor-mint-carpet": {
    edge: "#93cfab",
    draw: (n) => (
      <>
        <rect width={n} height={n} fill="#bce6cd" />
        {Array.from({ length: n * 3 }, (_, i) =>
          Array.from({ length: n * 3 }, (_, j) =>
            (i + j) % 2 ? null : <circle key={`${i}-${j}`} cx={(i + 0.5) / 3} cy={(j + 0.5) / 3} r="0.035" fill="#a3dab9" />,
          ),
        )}
      </>
    ),
  },
  "room-floor-checker": {
    edge: "#b9c3ef",
    draw: (n) => (
      <>
        <rect width={n} height={n} fill="#fbf6ec" />
        {Array.from({ length: n }, (_, i) =>
          Array.from({ length: n }, (_, j) => ((i + j) % 2 ? <rect key={`${i}-${j}`} x={i} y={j} width="1" height="1" fill="#d5dcfa" /> : null)),
        )}
      </>
    ),
  },
  "room-floor-lavender-tiles": {
    edge: "#c9bcef",
    draw: (n) => (
      <>
        <rect width={n} height={n} fill="#e9e1f9" />
        <g stroke="#cfc2f1" strokeWidth="2">
          {Array.from({ length: n - 1 }, (_, k) => (
            <path key={k} d={`M${k + 1} 0V${n}M0 ${k + 1}H${n}`} {...NS} />
          ))}
        </g>
      </>
    ),
  },
};

interface StyleLook {
  backdrop: [string, string];
  /** Wall caps and trim */
  trim: string;
  /** Extra details drawn over the walls */
  extras: (n: number, h: number) => React.ReactNode;
  /** Scenery around and under the room */
  scenery: (n: number, h: number) => React.ReactNode;
}

/** A pointed leaf with a midrib, pointing along `rot` degrees */
const Leaf = ({ x, y, r, c = "#9ed6a5", rot = 0 }: { x: number; y: number; r: number; c?: string; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M${-r} 0C${-r * 0.4} ${-r * 0.62} ${r * 0.5} ${-r * 0.6} ${r} 0C${r * 0.5} ${r * 0.6} ${-r * 0.4} ${r * 0.62} ${-r} 0Z`} fill={c} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    <path d={`M${-r * 0.8} 0Q0 ${-r * 0.08} ${r * 0.75} 0`} stroke={INK} strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
  </g>
);
/** A bunch of leaves around a point */
const LeafCluster = ({ x, y, r, seed }: { x: number; y: number; r: number; seed: number }) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = seed * 47 + i * 72;
      const rad = (a * Math.PI) / 180;
      return <Leaf key={i} x={x + Math.cos(rad) * r * 0.55} y={y + Math.sin(rad) * r * 0.4} r={r * (0.62 + ((seed + i) % 3) * 0.08)} c={(seed + i) % 2 ? "#8ccf98" : "#aee2b6"} rot={a} />;
    })}
  </g>
);

const Cloud = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 30c0-14 16-20 26-12 6-16 34-16 38 2 14-2 20 14 8 18H6c-4 0-6-3-6-8Z"
    fill="#fff"
    stroke={INK}
    strokeWidth="3"
  />
);

/** A soft shadow on the "table" under the diorama */
const GroundShadow = ({ n }: { n: number }) => (
  <ellipse cx="0" cy={TH * 2 * n + SLAB - 6} rx={TW * n * 1.02} ry={TH * n * 0.3} fill={INK} opacity="0.06" />
);

const STYLE_LOOKS: Record<string, StyleLook> = {
  "room-style-classic": {
    backdrop: ["#fbf4e4", "#ecdcbd"],
    trim: "#fffaf0",
    extras: (n, h) => (
      <>
        {(["left", "right"] as const).map((w) => (
          <g key={w} transform={wallTransform(w, 0, 0)}>
            <rect x={w === "left" ? -TW * n : 0} y={-11} width={TW * n} height="11" fill="#fffaf0" stroke={INK} strokeWidth="2" {...NS} />
            <rect x={w === "left" ? -TW * n : 0} y={-h} width={TW * n} height="7" fill="#fffaf0" stroke={INK} strokeWidth="2" {...NS} />
          </g>
        ))}
      </>
    ),
    scenery: (n) => <GroundShadow n={n} />,
  },
  "room-style-treehouse": {
    backdrop: ["#dff1d6", "#a9d79f"],
    trim: "#c08a55",
    extras: (n, h) => (
      <>
        {(["left", "right"] as const).map((w) => (
          <g key={w} transform={wallTransform(w, 0, 0)}>
            <rect x={w === "left" ? -TW * n : 0} y={-12} width={TW * n} height="12" fill="#b07c4a" stroke={INK} strokeWidth="2" {...NS} />
            <rect x={w === "left" ? -TW * n : 0} y={-h} width={TW * n} height="13" fill="#b07c4a" stroke={INK} strokeWidth="2" {...NS} />
            {[0.33, 0.66].map((f) => (
              <rect key={f} x={(w === "left" ? -1 : 1) * TW * n * f - 6} y={-h} width="12" height={h} fill="#c08a55" stroke={INK} strokeWidth="2" {...NS} />
            ))}
          </g>
        ))}
        {/* a branch growing in at the back corner */}
        <path d={`M-4 ${-h + 18}C-30 ${-h + 40} -60 ${-h + 46} -92 ${-h + 64}`} stroke={INK} strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d={`M-4 ${-h + 18}C-30 ${-h + 40} -60 ${-h + 46} -92 ${-h + 64}`} stroke="#a06e40" strokeWidth="7" fill="none" strokeLinecap="round" />
        <Leaf x={-96} y={-h + 70} r={13} rot={30} />
        <Leaf x={-58} y={-h + 56} r={10} c="#7fc98d" rot={-20} />
      </>
    ),
    scenery: (n, h) => {
      const [fx, fy] = iso(n, n, -SLAB);
      return (
        <>
          {/* the trunk the room sits on */}
          <path d={`M${fx - 44} ${fy - 30}C${fx - 40} ${fy + 60} ${fx - 70} ${fy + 160} ${fx - 90} ${fy + 400}H${fx + 90}C${fx + 70} ${fy + 160} ${fx + 40} ${fy + 60} ${fx + 44} ${fy - 30}Z`} fill="#a06e40" stroke={INK} strokeWidth="4" />
          <path d={`M${fx - 12} ${fy + 20}c4 40 0 80-8 140M${fx + 16} ${fy + 40}c2 30 4 60 10 110`} stroke="#7d5330" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* leaves all around */}
          {[
            [-TW * n - 70, -h + 10, 46],
            [-TW * n - 30, -h - 40, 38],
            [TW * n + 60, -h - 10, 50],
            [TW * n + 30, -h - 60, 34],
            [-TW * n - 90, TH * n + 60, 42],
            [TW * n + 80, TH * n + 50, 46],
            [0, -h - 70, 40],
          ].map(([x, y, r], i) => (
            <LeafCluster key={i} x={x} y={y} r={r} seed={i} />
          ))}
        </>
      );
    },
  },
  "room-style-loft": {
    backdrop: ["#eaf1fd", "#c3d4f6"],
    trim: "#f3ead9",
    extras: (n, h) => (
      <>
        {(["left", "right"] as const).map((w) => (
          <g key={w} transform={wallTransform(w, 0, 0)}>
            <rect x={w === "left" ? -TW * n : 0} y={-11} width={TW * n} height="11" fill="#fffaf0" stroke={INK} strokeWidth="2" {...NS} />
            <rect x={w === "left" ? -TW * n : 0} y={-h} width={TW * n} height="16" fill="#d9b98c" stroke={INK} strokeWidth="2" {...NS} />
            {[0.25, 0.5, 0.75].map((f) => (
              <rect key={f} x={(w === "left" ? -1 : 1) * TW * n * f - 7} y={-h} width="14" height={h} fill="#e5cba3" stroke={INK} strokeWidth="2" {...NS} />
            ))}
          </g>
        ))}
      </>
    ),
    scenery: (n, h) => (
      <>
        <GroundShadow n={n} />
        <Cloud x={-TW * n - 120} y={-h - 30} s={1.3} />
        <Cloud x={TW * n + 10} y={-h - 70} s={1.1} />
        <Cloud x={TW * n + 50} y={TH * n + 40} s={1.4} />
        <Cloud x={-TW * n - 140} y={TH * n + 70} s={1.2} />
      </>
    ),
  },
};

/* ------------------------------------------------------------------
   The student's avatar
------------------------------------------------------------------- */
type Mood = "idle" | "wave" | "cheer";

const FRINGE = "M28 50c-2-16 10-26 23-25 14 1 22 12 20 24-6-6-14-9-24-8-8 1-14 4-19 9Z";
const CURLS = "M27 52c-5-6-3-14 3-17-1-7 6-12 12-9 3-6 13-6 16 0 6-3 13 2 12 9 6 3 8 11 3 17-5-8-13-12-23-12s-18 4-23 12Z";
const OUTLINE = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };

/** Hair that sits behind the head */
function HairBack({ look }: { look: AvatarLook }) {
  const c = look.hairColor;
  switch (look.hair) {
    case "bun":
      return <circle cx="50" cy="25" r="9" fill={c} {...OUTLINE} />;
    case "long":
      return <path d="M27 52C25 30 37 24 50 24C63 24 75 30 73 52L75 80C69 84 63 82 62 76L62 62H38L38 76C37 82 31 84 25 80Z" fill={c} {...OUTLINE} />;
    case "ponytail":
      return <path d="M68 38C82 34 90 48 86 62C84 70 78 74 73 70C78 62 77 50 70 44Z" fill={c} {...OUTLINE} />;
    case "braids":
      return (
        <>
          {["M31 58C28 66 28 74 30 84", "M69 58C72 66 72 74 70 84"].map((d) => (
            <g key={d}>
              <path d={d} fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
              <path d={d} fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" />
            </g>
          ))}
          <circle cx="30" cy="85" r="3" fill="#f2b0cf" stroke={INK} strokeWidth="2" />
          <circle cx="70" cy="85" r="3" fill="#f2b0cf" stroke={INK} strokeWidth="2" />
        </>
      );
    default:
      return null;
  }
}

/** Things worn on the head, drawn last */
function Accessory({ id }: { id?: string | null }) {
  switch (id) {
    case "acc-glasses":
      return (
        <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
          <circle cx="42" cy="55" r="6.5" fill="#fff" fillOpacity="0.35" />
          <circle cx="58" cy="55" r="6.5" fill="#fff" fillOpacity="0.35" />
          <path d="M48.5 55h3M35.5 53.5l-6-2M64.5 53.5l6-2" fill="none" />
        </g>
      );
    case "acc-bow":
      return (
        <g {...OUTLINE} strokeWidth={2.5}>
          <path d="M66 32l-11-8v16Z M66 32l11-8v16Z" fill="#f2b0cf" />
          <circle cx="66" cy="32" r="3.5" fill="#f2b0cf" />
        </g>
      );
    case "acc-cap":
      return (
        <g {...OUTLINE}>
          <path d="M27 46C27 28 38 21 51 21C64 21 74 28 74 44C62 40 40 40 27 46Z" fill="#b6c1f5" />
          <path d="M26 46C34 41 66 40 78 44C70 49 34 50 26 46Z" fill="#8f9de8" />
          <circle cx="51" cy="21" r="2.5" fill="#8f9de8" />
        </g>
      );
    case "acc-headphones":
      return (
        <g>
          <path d="M26 54C26 24 74 24 74 54" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <path d="M26 54C26 24 74 24 74 54" fill="none" stroke="#aee2c2" strokeWidth="3" strokeLinecap="round" />
          <rect x="19" y="47" width="10" height="16" rx="4" fill="#aee2c2" {...OUTLINE} strokeWidth={2.5} />
          <rect x="71" y="47" width="10" height="16" rx="4" fill="#aee2c2" {...OUTLINE} strokeWidth={2.5} />
        </g>
      );
    case "acc-crown":
      return (
        <g {...OUTLINE} strokeWidth={2.5}>
          <path d="M35 32L37 15L44 23L50 11L56 23L63 15L65 32Z" fill="#f4e297" />
          <circle cx="50" cy="26" r="2.4" fill="#f2b0cf" />
          <circle cx="41" cy="27" r="1.8" fill="#b6c1f5" />
          <circle cx="59" cy="27" r="1.8" fill="#aee2c2" />
        </g>
      );
    default:
      return null;
  }
}

/** Head and face, centred on (50, 52) with radius 22 */
function Head({ look, mood }: { look: AvatarLook; mood: Mood }) {
  return (
    <>
      <HairBack look={look} />
      <circle cx="50" cy="52" r="22" fill={look.skin} stroke={INK} strokeWidth="3.5" />
      <path d={look.hair === "curly" ? CURLS : FRINGE} fill={look.hairColor} {...OUTLINE} />
      <g className="room-blink">
        <circle cx="42" cy="55" r="2.5" fill={INK} />
        <circle cx="58" cy="55" r="2.5" fill={INK} />
      </g>
      <ellipse cx="36" cy="62" rx="4" ry="2.6" fill="#f2b0cf" opacity="0.8" />
      <ellipse cx="64" cy="62" rx="4" ry="2.6" fill="#f2b0cf" opacity="0.8" />
      {mood === "cheer" ? (
        <path d="M43 62q7 8 14 0Z" fill="#7a3236" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      ) : (
        <path d="M44 63q6 5 12 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      )}
      <Accessory id={look.accessory} />
    </>
  );
}

/** Just the head, for picking hair and accessories */
export function AvatarHead({ look, className = "" }: { look: AvatarLook; className?: string }) {
  return (
    <svg viewBox="14 6 72 84" className={className} aria-hidden>
      <Head look={look} mood="idle" />
    </svg>
  );
}

const arm = (d: string, skin: string) => (
  <>
    <path d={d} fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    <path d={d} fill="none" stroke={skin} strokeWidth="4.5" strokeLinecap="round" />
  </>
);

/** A standing kid with their feet at (0, 0), about 105 tall */
function StandingFigure({ look, mood }: { look: AvatarLook; mood: Mood }) {
  const { skin, shirt } = look;
  return (
    <g className={mood === "cheer" ? "room-cheer" : undefined}>
      <ellipse cx="0" cy="-1" rx="17" ry="6" fill={INK} opacity="0.2" />
      <rect x="-11" y="-31" width="9" height="28" rx="4" fill="#4a4c6a" stroke={INK} strokeWidth="3" />
      <rect x="2" y="-31" width="9" height="28" rx="4" fill="#4a4c6a" stroke={INK} strokeWidth="3" />
      <ellipse cx="-7.5" cy="-3" rx="7" ry="4" fill={INK} />
      <ellipse cx="7.5" cy="-3" rx="7" ry="4" fill={INK} />
      <path d="M-16 -27c-2-20 4-36 16-36s18 16 16 36Z" fill={shirt} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {arm("M-12 -55c-6 8-8 17-6 25", skin)}
      {mood === "idle" ? (
        arm("M12 -55c6 8 8 17 6 25", skin)
      ) : (
        <g className="room-wave">
          {arm("M12 -56c8-4 12-12 12-22", skin)}
          <circle cx="24" cy="-80" r="5.5" fill={skin} stroke={INK} strokeWidth="3" />
        </g>
      )}
      <g transform="translate(0 -84) scale(0.8) translate(-50 -52)">
        <Head look={look} mood={mood} />
      </g>
    </g>
  );
}

/** The student's room character on its own, for places outside the room (waves by default) */
export function AvatarPicture({ look, mood = "wave", className = "" }: { look: AvatarLook; mood?: Mood; className?: string }) {
  return (
    <svg viewBox="-34 -124 68 128" className={className} aria-hidden>
      <StandingFigure look={look} mood={mood} />
    </svg>
  );
}

/** A kid sitting cross-legged, bottom at (0, 0) */
function SeatedFigure({ look, mood }: { look: AvatarLook; mood: Mood }) {
  const { skin, shirt } = look;
  return (
    <g className={mood === "cheer" ? "room-cheer" : undefined} transform="translate(-50 -136)">
      <path d="M18 128c0-12 14-16 32-16s32 4 32 16c0 6-6 8-14 8H32c-8 0-14-2-14-8Z" fill="#4a4c6a" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M29 121c-2-22 5-40 21-40s23 18 21 40Z" fill={shirt} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {arm("M33 92c-9 6-11 17-6 25", skin)}
      {mood === "idle" ? (
        arm("M67 92c9 6 11 17 6 25", skin)
      ) : (
        <g className="room-wave">
          {arm("M66 93c9-4 14-14 14-25", skin)}
          <circle cx="80" cy="64" r="6" fill={skin} stroke={INK} strokeWidth="3" />
        </g>
      )}
      <Head look={look} mood={mood} />
    </g>
  );
}

/** A speech bubble pointing down at (x, y) */
function SpeechBubble({ x, y, text }: { x: number; y: number; text: string }) {
  const w = Math.max(70, text.length * 7.4 + 26);
  return (
    <g className="animate-pop-in" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} pointerEvents="none">
      <rect x={x - w / 2} y={y - 40} width={w} height="30" rx="15" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <path d={`M${x - 7} ${y - 11.5}l7 9 7-9`} fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={`M${x - 6} ${y - 12}h12`} stroke="#fff" strokeWidth="3" />
      <text x={x} y={y - 20} textAnchor="middle" fontFamily="var(--font-jost), sans-serif" fontSize="14.5" fill={INK}>
        {text}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------
   Drawing one placed item
------------------------------------------------------------------- */

const AVATAR_SCALE = 0.8;
const SEATED_SCALE = 0.52;

/** The item's art at the origin (floor things: where it touches the floor; wall things: centred) */
function ItemArt({ itemId, flip = false }: { itemId: string; flip?: boolean }) {
  const def = getRoomItem(itemId);
  if (!def) return null;
  if (ISO_ART[itemId]) return <>{ISO_ART[itemId].draw(makeCtx(flip))}</>;
  if (RUG_ART[itemId]) return <g transform={floorMatrix(flip)}>{RUG_ART[itemId]}</g>;
  const stand = STAND_ART[itemId];
  if (stand) {
    const k = stand.scale;
    return <g transform={`scale(${flip ? -k : k} ${k}) translate(${-stand.anchor[0]} ${-stand.anchor[1]})`}>{stand.art}</g>;
  }
  const wall = WALL_ART[itemId];
  if (wall && def.wallSize) {
    const [bx, by, bw, bh] = wall.box;
    const [w, h] = def.wallSize;
    return <g transform={`translate(${-w / 2} ${-h / 2}) scale(${w / bw} ${h / bh}) translate(${-bx} ${-by})`}>{wall.art}</g>;
  }
  return null;
}

/** Where a seated avatar goes on a seat item, and how high */
function seatPoint(p: PlacedRoomItem): { x: number; y: number; z: number } | null {
  const iso3 = ISO_ART[p.itemId]?.seat;
  if (iso3) {
    const [u, v, z] = iso3;
    return p.flip ? { x: p.x + v, y: p.y + u, z } : { x: p.x + u, y: p.y + v, z };
  }
  const stand = STAND_ART[p.itemId]?.seat;
  if (stand) return { x: p.x, y: p.y, z: stand };
  return null;
}

/* ------------------------------------------------------------------
   The room
------------------------------------------------------------------- */

export interface RoomPerson {
  id: string;
  name: string;
  look: AvatarLook;
  /** The one the viewer controls: taps on the floor walk them there */
  you?: boolean;
  lines?: string[];
}

type Poke = { id: number; kind: "heart" | "bubble"; x: number; y: number };
type PersonState = { x: number; y: number; seat?: string; facing: 1 | -1; walking?: boolean };

interface RoomSceneProps {
  room: { items: PlacedRoomItem[]; style: string; wallpaper: string; flooring: string };
  /** Decorate mode: drag things around, tap to select */
  editing?: boolean;
  selectedUid?: string | null;
  onSelect?: (uid: string | null) => void;
  onMove?: (uid: string, pos: RoomPos) => void;
  /** Item the student is saving toward, shown faintly */
  ghostItemId?: string;
  people?: RoomPerson[];
  /** Change this number to make your avatar cheer (e.g. after a purchase) */
  celebrateKey?: number;
  /** A still picture: no interaction, no animation, framed tightly */
  still?: boolean;
  /** Tall, narrow screens: less space at the sides */
  narrow?: boolean;
  /** A still picture that keeps its little animations (new things still drop in) */
  animated?: boolean;
  className?: string;
}

export function RoomScene({
  room,
  editing = false,
  selectedUid = null,
  onSelect,
  onMove,
  ghostItemId,
  people = [],
  celebrateKey = 0,
  still = false,
  narrow = false,
  animated = false,
  className = "",
}: RoomSceneProps) {
  const uid = useId().replace(/:/g, "");
  const g = roomGeometry(room.style);
  const N = g.size;
  const H = g.wallHeight;
  const look = STYLE_LOOKS[room.style] ?? STYLE_LOOKS["room-style-classic"];
  const paper = WALLPAPERS[room.wallpaper] ?? WALLPAPERS["room-paper-cream"];
  const flooring = FLOORINGS[room.flooring] ?? FLOORINGS["room-floor-honey-wood"];
  const svgRef = useRef<SVGSVGElement>(null);

  const [lightsOn, setLightsOn] = useState(true);
  const [pokes, setPokes] = useState<Poke[]>([]);
  const [moods, setMoods] = useState<Record<string, { kind: Mood; line?: string }>>({});
  const moodTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const setMoodFor = (id: string, kind: Mood, line: string, ms: number) => {
    clearTimeout(moodTimers.current[id]);
    setMoods((m) => ({ ...m, [id]: { kind, line } }));
    moodTimers.current[id] = setTimeout(() => setMoods((m) => ({ ...m, [id]: { kind: "idle" } })), ms);
  };
  useEffect(() => {
    const timers = moodTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  // People: where they stand, and walking
  const you = people.find((p) => p.you);
  const [moved, setSpots] = useState<Record<string, PersonState>>({});
  /** Where someone stands before they've walked anywhere */
  const homeSpot = (p: RoomPerson): PersonState => {
    const prefer = p.you ? { x: N * 0.72, y: N * 0.58 } : { x: N * 0.4, y: N * 0.8 };
    const spot = findSpot({ place: "floor", footprint: [0.7, 0.7] }, room.items, room.style, prefer);
    return { x: spot.x, y: spot.y, facing: p.you ? 1 : -1 };
  };
  const homes = useMemo(
    () => Object.fromEntries(people.map((p) => [p.id, homeSpot(p)])),
    // Only where people start; later changes to the room don't move them
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [people.map((p) => p.id).join(","), room.style],
  );
  const spots: Record<string, PersonState> = { ...homes, ...moved };
  const walkFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(walkFrame.current), []);

  const walkTo = (target: { x: number; y: number }, seatUid?: string) => {
    if (!you) return;
    const from = spots[you.id];
    if (!from) return;
    const to = { x: Math.min(N - 0.3, Math.max(0.3, target.x)), y: Math.min(N - 0.3, Math.max(0.3, target.y)) };
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const dx = to.x - to.y - (from.x - from.y);
    const facing: 1 | -1 = dx === 0 ? from.facing : dx > 0 ? 1 : -1;
    cancelAnimationFrame(walkFrame.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || dist < 0.05) {
      setSpots((s) => ({ ...s, [you.id]: { ...to, facing, seat: seatUid } }));
      return;
    }
    const dur = Math.max(250, (dist / 3.4) * 1000);
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setSpots((s) => ({
        ...s,
        [you.id]: { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, facing, walking: k < 1, seat: k < 1 ? undefined : seatUid },
      }));
      if (k < 1) walkFrame.current = requestAnimationFrame(step);
    };
    walkFrame.current = requestAnimationFrame(step);
  };

  // Cheer when something new arrives in the room
  const firstCelebrate = useRef(true);
  useEffect(() => {
    if (firstCelebrate.current) {
      firstCelebrate.current = false;
      return;
    }
    if (you) setMoodFor(you.id, "cheer", "Yay! Love it!", 1800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrateKey]);

  // New things drop in with a little bounce
  const knownRef = useRef<Set<string> | null>(null);
  const popUntil = useRef(new Map<string, number>());
  const now = Date.now();
  if (!still || animated) {
    const ids = new Set(room.items.map((p) => p.uid));
    if (knownRef.current) for (const id of ids) if (!knownRef.current.has(id)) popUntil.current.set(id, now + 700);
    knownRef.current = ids;
  }
  const popping = (id: string) => (popUntil.current.get(id) ?? 0) > now;

  // Dragging
  const dragRef = useRef<{ uid: string; item: RoomItem; flip?: boolean; dx: number; dy: number; wall?: WallSide; moved: boolean; pointerId: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ uid: string; pos: RoomPos } | null>(null);

  const toSvg = (clientX: number, clientY: number): [number, number] => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return [0, 0];
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };

  const startDrag = (e: React.PointerEvent, p: PlacedRoomItem, item: RoomItem) => {
    e.stopPropagation();
    onSelect?.(p.uid);
    const [X, Y] = toSvg(e.clientX, e.clientY);
    if (item.place === "wall") {
      const w = wallPosFromScreen(X, Y);
      dragRef.current = { uid: p.uid, item, dx: p.x - w.x, dy: p.y - w.y, wall: p.wall, moved: false, pointerId: e.pointerId };
    } else {
      const f = floorPosFromScreen(X, Y);
      dragRef.current = { uid: p.uid, item, flip: p.flip, dx: p.x - f.x, dy: p.y - f.y, moved: false, pointerId: e.pointerId };
    }
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const [X, Y] = toSvg(e.clientX, e.clientY);
    let pos: RoomPos;
    if (d.item.place === "wall") {
      const w = wallPosFromScreen(X, Y);
      if (w.wall !== d.wall) {
        d.wall = w.wall;
        d.dx = 0;
      }
      pos = { wall: w.wall, x: w.x + d.dx, y: w.y + d.dy };
    } else {
      const f = floorPosFromScreen(X, Y);
      pos = { x: f.x + d.dx, y: f.y + d.dy };
    }
    pos = clampPos(d.item, pos, room.style, d.flip);
    pos = { ...pos, x: Math.round(pos.x * 8) / 8, y: d.item.place === "wall" ? Math.round(pos.y) : Math.round(pos.y * 8) / 8 };
    d.moved = true;
    setDragPos({ uid: d.uid, pos });
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    if (d.moved && dragPos?.uid === d.uid) onMove?.(d.uid, dragPos.pos);
    setDragPos(null);
  };

  const poke = (kind: Poke["kind"], x: number, y: number) => {
    const id = Date.now() + Math.random();
    setPokes((p) => [...p, { id, kind, x, y }]);
    setTimeout(() => setPokes((p) => p.filter((q) => q.id !== id)), 1300);
  };

  // Where everything is right now (with a drag in progress applied)
  const items = room.items
    .map((p) => (dragPos && dragPos.uid === p.uid ? { ...p, ...dragPos.pos } : p))
    .map((p) => ({ p, def: getRoomItem(p.itemId) }))
    .filter((o): o is { p: PlacedRoomItem; def: RoomItem } => !!o.def);

  const night = items.some((o) => o.p.itemId === "room-starry-window") && !items.some((o) => o.p.itemId === "room-sunny-window");
  const lights = items.filter((o) => o.p.itemId === "room-cozy-lamp" || o.p.itemId === "room-string-lights");

  /** Tapping a thing (not decorating) */
  const tapItem = (p: PlacedRoomItem, def: RoomItem) => {
    const [X, Y] = iso(p.x, p.y);
    if (p.itemId === "room-cat") return poke("heart", X, Y - 50);
    if (p.itemId === "room-fishbowl") return poke("bubble", X + 4, Y - 46);
    if (p.itemId === "room-cozy-lamp" || p.itemId === "room-string-lights") return setLightsOn((v) => !v);
    if (def.seat) return walkTo(seatPoint(p) ?? p, p.uid);
    if (def.place === "wall") return;
    const [a, b] = footprintOf(def, p.flip);
    walkTo({ x: p.x + a / 2 + 0.45, y: p.y + b / 2 + 0.45 });
  };

  const itemActionLabel = (p: PlacedRoomItem, def: RoomItem) => {
    if (p.itemId === "room-cat") return "Pet Sunny the cat";
    if (p.itemId === "room-fishbowl") return "Tap the goldfish bowl";
    if (p.itemId === "room-cozy-lamp" || p.itemId === "room-string-lights") return lightsOn ? "Turn the lights off" : "Turn the lights on";
    if (def.seat && you) return `Sit on the ${def.name.toLowerCase()}`;
    return null;
  };

  const renderPlaced = ({ p, def }: { p: PlacedRoomItem; def: RoomItem }) => {
    const selected = editing && p.uid === selectedUid;
    const action = !editing && !still ? itemActionLabel(p, def) : null;
    const isLight = p.itemId === "room-cozy-lamp" || p.itemId === "room-string-lights";
    const cls = [
      popping(p.uid) ? "room-pop" : "",
      isLight && !lightsOn ? "room-lamp-off" : "",
      action ? "room-clickable" : "",
      editing ? "room-editable" : "",
      dragPos?.uid === p.uid ? "room-dragging" : "",
    ]
      .filter(Boolean)
      .join(" ");

    let transform: string;
    let outline: React.ReactNode = null;
    if (def.place === "wall") {
      transform = wallTransform(p.wall ?? "left", p.x, p.y);
      if (editing && def.wallSize) {
        const [w, h] = def.wallSize;
        outline = (
          <rect x={-w / 2 - 5} y={-h / 2 - 5} width={w + 10} height={h + 10} rx="6" fill={selected ? "#e4e8fd" : "none"} fillOpacity="0.6" stroke="#5b6ee1" strokeWidth={selected ? 2.5 : 1.5} strokeDasharray="6 5" opacity={selected ? 1 : 0.55} />
        );
      }
    } else {
      const [X, Y] = iso(p.x, p.y);
      transform = `translate(${X} ${Y})`;
      if (editing) {
        const [a, b] = footprintOf(def, p.flip);
        outline = (
          <polygon
            points={pts(iso(-a / 2, -b / 2), iso(a / 2, -b / 2), iso(a / 2, b / 2), iso(-a / 2, b / 2))}
            fill={selected ? "#c9d0fa" : "none"}
            fillOpacity="0.55"
            stroke="#5b6ee1"
            strokeWidth={selected ? 2.5 : 1.5}
            strokeDasharray="6 5"
            opacity={selected ? 1 : 0.55}
          />
        );
      }
    }

    return (
      <g key={p.uid} transform={transform}>
        {outline}
        <g
          className={cls || undefined}
          {...(editing
            ? {
                role: "button",
                tabIndex: 0,
                "aria-label": `${def.name}${selected ? ", selected" : ""}. Drag to move`,
                "aria-pressed": selected,
                onPointerDown: (e: React.PointerEvent) => startDrag(e, p, def),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.(p.uid);
                  }
                },
                style: { touchAction: "none" },
              }
            : action
              ? {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": action,
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    tapItem(p, def);
                  },
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      tapItem(p, def);
                    }
                  },
                }
              : !still
                ? { onClick: (e: React.MouseEvent) => (e.stopPropagation(), tapItem(p, def)) }
                : {})}
        >
          <ItemArt itemId={p.itemId} flip={p.flip} />
        </g>
      </g>
    );
  };

  // People, drawn among the furniture by depth
  const personNodes = still || editing
    ? []
    : people.map((person) => {
        const s = spots[person.id];
        if (!s) return null;
        const seatItem = s.seat ? items.find((o) => o.p.uid === s.seat) : undefined;
        const seat = seatItem ? seatPoint(seatItem.p) : null;
        const x = seat ? seat.x : Math.min(N - 0.3, s.x);
        const y = seat ? seat.y : Math.min(N - 0.3, s.y);
        const [X, Y] = iso(x, y, seat?.z ?? 0);
        const mood = moods[person.id] ?? { kind: "idle" as Mood };
        const sayHi = () => {
          const lines = person.lines?.length ? person.lines : ["Hi there!"];
          setMoodFor(person.id, "wave", lines[Math.floor(Math.random() * lines.length)], 2400);
        };
        const node = (
          <g key={`person-${person.id}`} transform={`translate(${X} ${Y})`} className={editing ? "pointer-events-none" : undefined}>
            <g
              role="button"
              tabIndex={editing ? -1 : 0}
              aria-label={`${person.name}. Tap to say hi`}
              onClick={(e) => {
                e.stopPropagation();
                sayHi();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  sayHi();
                }
              }}
              className="room-clickable"
            >
              <g transform={`scale(${s.facing * (seat ? SEATED_SCALE : AVATAR_SCALE)} ${seat ? SEATED_SCALE : AVATAR_SCALE})`}>
                <g className={s.walking ? "room-walking" : undefined}>
                  {seat ? (
                    <SeatedFigure look={person.look} mood={mood.kind} />
                  ) : (
                    <StandingFigure look={person.look} mood={mood.kind} />
                  )}
                </g>
              </g>
            </g>
            {mood.line && <SpeechBubble key={mood.line + mood.kind} x={0} y={seat ? -68 : -90} text={mood.line} />}
          </g>
        );
        return { key: x + y + (seat ? 0.05 : 0.02), node };
      });

  const rugs = items.filter((o) => o.def.place === "rug").sort((a, b) => a.p.x + a.p.y - (b.p.x + b.p.y));
  const wallThings = items.filter((o) => o.def.place === "wall");
  const floorThings = [
    ...items.filter((o) => o.def.place === "floor").map((o) => ({ key: o.p.x + o.p.y, node: renderPlaced(o) })),
    ...personNodes.filter((n): n is { key: number; node: React.ReactElement } => !!n),
  ].sort((a, b) => a.key - b.key);

  // The goal, shown faintly in a free spot
  const ghostDef = still ? undefined : getRoomItem(ghostItemId);
  const ghost = ghostDef && ghostDef.kind === "item" ? { def: ghostDef, pos: findSpot(ghostDef, room.items, room.style) } : null;

  const ids = { paper: `${uid}-paper`, floorShade: `${uid}-fs`, bg: `${uid}-bg`, glow: `${uid}-glow`, clip: `${uid}-clip` };
  const pad = still ? { x: 10, top: 10, bottom: 8 } : { x: narrow ? 4 : 40, top: 90, bottom: 130 };
  const minX = -TW * N - TW * WALL_T - pad.x;
  const minY = -H - 10 - pad.top;
  const vbW = 2 * (TW * N + TW * WALL_T + pad.x);
  const vbH = TH * 2 * N + SLAB + 4 + pad.bottom - minY;

  const floorPoly = pts(iso(0, 0), iso(N, 0), iso(N, N), iso(0, N));
  const T = WALL_T;

  const onFloorDown = (e: React.PointerEvent) => {
    if (still) return;
    if (editing) {
      onSelect?.(null);
      return;
    }
    const [X, Y] = toSvg(e.clientX, e.clientY);
    walkTo(floorPosFromScreen(X, Y));
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      className={`room-svg ${still && !animated ? "room-static" : ""} ${className}`}
      style={{ overflow: "visible", touchAction: editing ? "none" : undefined }}
      role="img"
      aria-label="Room"
      onPointerMove={still ? undefined : onPointerMove}
      onPointerUp={still ? undefined : endDrag}
      onPointerCancel={still ? undefined : endDrag}
    >
      <defs>
        {paper.pattern(ids.paper)}
        <radialGradient id={ids.bg} cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor={look.backdrop[0]} />
          <stop offset="1" stopColor={look.backdrop[1]} />
        </radialGradient>
        <linearGradient id={ids.floorShade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#141414" stopOpacity="0.07" />
        </linearGradient>
        <radialGradient id={ids.glow}>
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* backdrop and scenery */}
      <rect
        x={-4000}
        y={-4000}
        width={8000}
        height={8000}
        fill={still ? look.backdrop[0] : `url(#${ids.bg})`}
        onPointerDown={editing ? () => onSelect?.(null) : undefined}
      />
      {!still && look.scenery(N, H)}

      {/* the floor slab, seen from the front */}
      <polygon points={pts(iso(-T, N, 0), iso(N, N, 0), iso(N, N, -SLAB), iso(-T, N, -SLAB))} fill={shade(flooring.edge, 0.92)} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <polygon points={pts(iso(N, -T, 0), iso(N, N, 0), iso(N, N, -SLAB), iso(N, -T, -SLAB))} fill={shade(flooring.edge, 0.78)} stroke={INK} strokeWidth="3" strokeLinejoin="round" />

      {/* floor */}
      <g onPointerDown={onFloorDown} style={{ cursor: !still && !editing && you ? "pointer" : undefined }}>
        <g transform={floorMatrix()}>{flooring.draw(N)}</g>
        <polygon points={floorPoly} fill={`url(#${ids.floorShade})`} />
        <polygon points={floorPoly} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </g>

      {/* walls */}
      {(["left", "right"] as const).map((w) => (
        <g key={w} transform={wallTransform(w, 0, 0)}>
          <rect x={w === "left" ? -TW * N : 0} y={-H} width={TW * N} height={H} fill={paper.bg} />
          <rect x={w === "left" ? -TW * N : 0} y={-H} width={TW * N} height={H} fill={`url(#${ids.paper})`} />
          {w === "left" && <rect x={-TW * N} y={-H} width={TW * N} height={H} fill="#141414" opacity="0.06" />}
        </g>
      ))}
      {look.extras(N, H)}
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round" fill={look.trim}>
        {/* wall tops and the cut ends, so the walls look solid */}
        <polygon points={pts(iso(-T, -T, H), iso(0, -T, H), iso(0, N, H), iso(-T, N, H))} />
        <polygon points={pts(iso(0, -T, H), iso(N, -T, H), iso(N, 0, H), iso(0, 0, H))} />
        <polygon points={pts(iso(-T, N, 0), iso(0, N, 0), iso(0, N, H), iso(-T, N, H))} fill={shade(look.trim, 0.86)} />
        <polygon points={pts(iso(N, -T, 0), iso(N, 0, 0), iso(N, 0, H), iso(N, -T, H))} fill={shade(look.trim, 0.74)} />
        <path d={line(iso(0, N, 0), iso(0, 0, 0), iso(N, 0, 0))} fill="none" />
        <path d={line(iso(0, 0, 0), iso(0, 0, H))} fill="none" strokeWidth="2.5" />
      </g>

      {/* things on the walls */}
      {wallThings.map(renderPlaced)}
      {ghost?.def.place === "wall" && (
        <g transform={wallTransform(ghost.pos.wall ?? "left", ghost.pos.x, ghost.pos.y)} opacity="0.3" className="room-static" pointerEvents="none" aria-hidden>
          <ItemArt itemId={ghost.def.id} />
        </g>
      )}

      {/* rugs, then everything standing on the floor, back to front */}
      {rugs.map(renderPlaced)}
      {ghost && ghost.def.place !== "wall" && (
        <g transform={`translate(${iso(ghost.pos.x, ghost.pos.y).join(" ")})`} opacity="0.3" className="room-static" pointerEvents="none" aria-hidden>
          <ItemArt itemId={ghost.def.id} />
        </g>
      )}
      {floorThings.map((t) => t.node)}

      {/* night: a dusky tint, then the lights glowing above it */}
      {night && (
        <g pointerEvents="none">
          <rect x={-4000} y={-4000} width={8000} height={8000} fill="#2b2d4a" opacity="0.36" />
          {lightsOn &&
            lights.map(({ p }) => {
              if (p.itemId === "room-cozy-lamp") {
                const [X, Y] = iso(p.x, p.y, 70);
                return <circle key={p.uid} cx={X} cy={Y} r="120" fill={`url(#${ids.glow})`} />;
              }
              const [X, Y] = (p.wall ?? "left") === "left" ? iso(0, p.x, p.y) : iso(p.x, 0, p.y);
              return <ellipse key={p.uid} cx={X} cy={Y + 10} rx="130" ry="70" fill={`url(#${ids.glow})`} />;
            })}
        </g>
      )}

      {/* hearts and bubbles */}
      {pokes.map((p) => (
        <g key={p.id} className="room-float" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} aria-hidden pointerEvents="none">
          {p.kind === "heart" ? (
            <path
              d={`M${p.x} ${p.y + 8}c-10-7-14-12-14-17 0-4 3-7 7-7 3 0 5 2 7 4 2-2 4-4 7-4 4 0 7 3 7 7 0 5-4 10-14 17Z`}
              fill="#f2b0cf"
              stroke={INK}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          ) : (
            <g fill="#e5f3fa" stroke={INK} strokeWidth="2">
              <circle cx={p.x} cy={p.y} r="5" />
              <circle cx={p.x + 9} cy={p.y - 10} r="3.5" />
              <circle cx={p.x - 4} cy={p.y - 18} r="2.5" />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------
   Thumbnails for the shop, goals and room previews
------------------------------------------------------------------- */

/** One item (or wallpaper, floor or room) on its own, for shop tiles and goal cards */
export function RoomThumb({ itemId, className = "" }: { itemId: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const def = getRoomItem(itemId);
  if (!def) return null;

  if (def.kind === "wallpaper") {
    const paper = WALLPAPERS[itemId];
    return (
      <svg viewBox="-4 -4 108 88" className={`room-static ${className}`} aria-hidden>
        <defs>{paper.pattern(`${uid}-p`)}</defs>
        <g transform="translate(14 22) matrix(1 -0.22 0 1 0 0)">
          <rect width="72" height="58" rx="4" fill={paper.bg} />
          <rect width="72" height="58" rx="4" fill={`url(#${uid}-p)`} stroke={INK} strokeWidth="3" />
        </g>
      </svg>
    );
  }
  if (def.kind === "flooring") {
    const f = FLOORINGS[itemId];
    const n = 2;
    return (
      <svg viewBox={`${-TW * n - 6} -6 ${TW * n * 2 + 12} ${TH * n * 2 + SLAB / 2 + 12}`} className={`room-static ${className}`} aria-hidden>
        <polygon points={pts(iso(0, n, 0), iso(n, n, 0), iso(n, n, -9), iso(0, n, -9))} fill={shade(f.edge, 0.92)} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points={pts(iso(n, 0, 0), iso(n, n, 0), iso(n, n, -9), iso(n, 0, -9))} fill={shade(f.edge, 0.78)} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <g transform={floorMatrix()}>{f.draw(n)}</g>
        <polygon points={pts(iso(0, 0), iso(n, 0), iso(n, n), iso(0, n))} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </svg>
    );
  }
  if (def.kind === "style") {
    return (
      <RoomScene
        still
        room={{ items: [], style: itemId, wallpaper: "room-paper-cream", flooring: "room-floor-honey-wood" }}
        className={className}
      />
    );
  }

  let viewBox: string;
  let content: React.ReactNode = <ItemArt itemId={itemId} />;
  if (ISO_ART[itemId] || RUG_ART[itemId]) {
    const [a, b] = def.footprint ?? [1, 1];
    const h = ISO_ART[itemId]?.height ?? 0;
    viewBox = `${-16 * (a + b) - 6} ${-8 * (a + b) - h - 6} ${32 * (a + b) + 12} ${16 * (a + b) + h + 12}`;
  } else if (STAND_ART[itemId]) {
    viewBox = STAND_ART[itemId].thumb;
    content = STAND_ART[itemId].art;
  } else {
    const [bx, by, bw, bh] = WALL_ART[itemId].box;
    viewBox = `${bx - 6} ${by - 6} ${bw + 12} ${bh + 12}`;
    content = WALL_ART[itemId].art;
  }
  return (
    <svg viewBox={viewBox} className={`room-static ${className}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
      {content}
    </svg>
  );
}
