import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { DISPLAY_NAME } from "@/lib/boot";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Stylized "bureau" screenshot for link previews: the real production
 * wallpaper (see `src/lib/wallpapers.ts`), pre-cropped to `size` at
 * `public/img/og/bureau.png` (the full-res original is too large to
 * base64-embed here — Satori's XML parser has a hard buffer limit), with a
 * mock menu bar + dock overlay. Built with `next/og` rather than a live
 * browser screenshot so it stays static-generatable at build time (see
 * seo-geo-boost skill, "image OG la plus rentable pour le partage").
 */
export default async function OpengraphImage() {
  const wallpaperBuffer = await readFile(join(process.cwd(), "public/img/og/bureau.png"));
  const wallpaperSrc = `data:image/png;base64,${wallpaperBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      <img
        src={wallpaperSrc}
        alt=""
        width={size.width}
        height={size.height}
        style={{ position: "absolute", inset: 0, objectFit: "cover" }}
      />

      {/* Menu bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 34,
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          background: "rgba(20, 20, 22, 0.55)",
          color: "white",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {DISPLAY_NAME}
      </div>

      {/* Title card */}
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 150,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          color: "white",
          maxWidth: 820,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1.5, display: "flex" }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 30, opacity: 0.85, display: "flex" }}>{SITE_TAGLINE}</div>
      </div>

      {/* Dock */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 16,
          padding: "12px 20px",
          borderRadius: 24,
          background: "rgba(255, 255, 255, 0.18)",
        }}
      >
        {DOCK_ICON_COLORS.map((color) => (
          <div
            key={color}
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: color,
              display: "flex",
            }}
          />
        ))}
      </div>
    </div>,
    { ...size },
  );
}

const DOCK_ICON_COLORS = ["#3478f6", "#ff9f0a", "#30d158", "#ff453a", "#a855f7"];
