import { ImageResponse } from "next/og";

export const alt = "Finity — Money lessons kids actually remember";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#141414";

function Coin({ face, edge, size: d, glyph }: { face: string; edge: string; size: number; glyph: string }) {
  return (
    <div style={{ position: "relative", width: d + 10, height: d + 10, display: "flex" }}>
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 10,
          width: d,
          height: d,
          borderRadius: 9999,
          background: edge,
          border: `5px solid ${INK}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: d,
          height: d,
          borderRadius: 9999,
          background: face,
          border: `5px solid ${INK}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: d * 0.42,
          fontWeight: 700,
          color: INK,
        }}
      >
        {glyph}
      </div>
    </div>
  );
}

/** Fetch a Google Font subset for the text we render; null if offline */
async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

const HEADLINE = "Money lessons kids actually remember";
const BRAND = "Finity";

export default async function OpengraphImage() {
  const serif = await loadFont("Fraunces", 500, HEADLINE + BRAND);
  const serifFamily = serif ? "Fraunces" : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f3f2ee",
          padding: "72px 80px",
          color: INK,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Coin face="#f6c88f" edge="#e2a55c" size={48} glyph="F" />
            <div style={{ fontSize: 48, fontFamily: serifFamily, letterSpacing: -1 }}>{BRAND}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 80, lineHeight: 1.02, letterSpacing: -2.5, fontFamily: serifFamily }}>
              {HEADLINE}
            </div>
            <div style={{ fontSize: 30, color: "#6c6a65", marginTop: 28, lineHeight: 1.3 }}>
              A classroom economy where students earn, save and grow.
            </div>
          </div>
        </div>

        <div style={{ flex: 1, position: "relative", display: "flex" }}>
          <div style={{ position: "absolute", right: 0, top: 30, display: "flex" }}>
            <Coin face="#aee2c2" edge="#5fbf88" size={190} glyph="" />
          </div>
          <div style={{ position: "absolute", left: 20, top: 200, display: "flex" }}>
            <Coin face="#b6c1f5" edge="#7f90e3" size={150} glyph="" />
          </div>
          <div style={{ position: "absolute", right: 20, bottom: 10, display: "flex" }}>
            <Coin face="#f6c88f" edge="#e2a55c" size={120} glyph="" />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serif ? [{ name: "Fraunces", data: serif, weight: 500, style: "normal" }] : undefined,
    },
  );
}
