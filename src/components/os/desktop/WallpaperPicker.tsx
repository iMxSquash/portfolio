"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MENU_POPOVER_GLASS } from "@/lib/glass-presets";
import { useLiquidGlass } from "@/lib/use-liquid-glass";
import { useWallpaperStore } from "@/stores/useWallpaperStore";
import { WallpaperGrid } from "./WallpaperGrid";

type Point = { x: number; y: number };

/** Opened from DesktopContextMenu's "Changer le fond d'écran…" — picking a thumbnail sets it and closes. */
export function WallpaperPicker({ position, onClose }: { position: Point; onClose: () => void }) {
  const selected = useWallpaperStore((state) => state.selected.macos);
  const setWallpaper = useWallpaperStore((state) => state.setWallpaper);

  const menuRef = useRef<HTMLDivElement>(null);
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const [clamped, setClamped] = useState(position);
  useLiquidGlass(menuEl, MENU_POPOVER_GLASS);

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
      ref={(node) => {
        menuRef.current = node;
        setMenuEl(node);
      }}
      role="menu"
      aria-label="Changer le fond d'écran"
      className="fixed z-1001 w-64 p-3"
      style={{ top: clamped.y, left: clamped.x }}
    >
      <p className="mb-2 px-1 text-xs font-medium opacity-60">Fond d&apos;écran</p>
      <WallpaperGrid
        os="macos"
        selectedId={selected}
        imageSizes="80px"
        onSelect={(id) => {
          setWallpaper("macos", id);
          onClose();
        }}
      />
    </div>
  );
}
