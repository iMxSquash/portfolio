"use client";

import Image from "next/image";
import { getWallpapersFor } from "@/lib/wallpapers";
import { useWallpaperStore } from "@/stores/useWallpaperStore";

type Point = { x: number; y: number };

/** Opened from DesktopContextMenu's "Changer le fond d'écran…" — picking a thumbnail sets it and closes. */
export function WallpaperPicker({ position, onClose }: { position: Point; onClose: () => void }) {
  const selected = useWallpaperStore((state) => state.selected.macos);
  const setWallpaper = useWallpaperStore((state) => state.setWallpaper);
  const wallpapers = getWallpapersFor("macos");

  return (
    <div
      role="menu"
      aria-label="Changer le fond d'écran"
      className="liquid-glass fixed z-[1001] w-64 rounded-lg p-3 shadow-glass-lg"
      style={{ top: position.y, left: position.x }}
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
