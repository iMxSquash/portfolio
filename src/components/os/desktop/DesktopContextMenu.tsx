"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MenuBarMenuItem, MenuBarMenuSeparator } from "@/components/os/menu-bar/MenuBarButton";

type Point = { x: number; y: number };

type DesktopContextMenuProps = {
  position: Point;
  onSelectWallpaper: () => void;
  onClose: () => void;
};

/** Right-click desktop menu. "Nouvelle note" stays a fake item — Notes doesn't exist until Phase 4. */
export function DesktopContextMenu({
  position,
  onSelectWallpaper,
  onClose,
}: DesktopContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [clamped, setClamped] = useState(position);

  // Right-clicking near the bottom/right edge would otherwise render the menu
  // partially off-screen — measure the real rect once mounted and pull it
  // back inside the viewport, before the browser paints the first frame.
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
      aria-label="Menu du bureau"
      className="liquid-glass fixed z-1001 min-w-56 rounded-lg p-1 shadow-glass-lg"
      style={{ top: clamped.y, left: clamped.x }}
    >
      <MenuBarMenuItem label="Changer le fond d'écran…" onSelect={onSelectWallpaper} />
      <MenuBarMenuSeparator />
      <MenuBarMenuItem label="Nouvelle note" onSelect={onClose} />
    </div>
  );
}
