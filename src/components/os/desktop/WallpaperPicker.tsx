"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { getWallpapersFor } from "@/lib/wallpapers";
import { useWallpaperStore } from "@/stores/useWallpaperStore";

type Point = { x: number; y: number };

/** Opened from DesktopContextMenu's "Changer le fond d'écran…" — picking a thumbnail sets it and closes. */
export function WallpaperPicker({ position, onClose }: { position: Point; onClose: () => void }) {
  const selected = useWallpaperStore((state) => state.selected.macos);
  const setWallpaper = useWallpaperStore((state) => state.setWallpaper);
  const wallpapers = getWallpapersFor("macos");

  const menuRef = useRef<HTMLDivElement>(null);
  const [clamped, setClamped] = useState(position);

  // Same edge-avoidance as DesktopContextMenu — this panel can open from a
  // menu item near the right/bottom edge and must stay fully on-screen.
  useLayoutEffect(() => {
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    setClamped({
      x: Math.max(8, Math.min(position.x, window.innerWidth - rect.width - 8)),
      y: Math.max(8, Math.min(position.y, window.innerHeight - rect.height - 8)),
    });
  }, [position]);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Changer le fond d'écran"
      className="liquid-glass fixed z-1001 w-64 rounded-lg p-3 shadow-glass-lg"
      style={{ top: clamped.y, left: clamped.x }}
    >
      <p className="mb-2 px-1 text-xs font-medium opacity-60">Fond d&apos;écran</p>
      <div className="grid grid-cols-3 gap-2">
        {wallpapers.map((wallpaper) => (
          <button
            key={wallpaper.id}
            type="button"
            onClick={() => {
              setWallpaper("macos", wallpaper.id);
              onClose();
            }}
            aria-label={wallpaper.label}
            aria-pressed={selected === wallpaper.id}
            className={`relative aspect-video overflow-hidden rounded-md ${
              selected === wallpaper.id ? "ring-2 ring-system-blue" : ""
            }`}
          >
            <Image src={wallpaper.src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
