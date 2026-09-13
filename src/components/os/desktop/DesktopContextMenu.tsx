"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MenuBarMenuItem, MenuBarMenuSeparator } from "@/components/os/menu-bar/MenuBarButton";
import { MENU_POPOVER_GLASS } from "@/lib/glass-presets";
import { useLiquidGlass } from "@/lib/use-liquid-glass";

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
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const [clamped, setClamped] = useState(position);
  useLiquidGlass(menuEl, MENU_POPOVER_GLASS);

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
      ref={(node) => {
        menuRef.current = node;
        setMenuEl(node);
      }}
      role="menu"
      aria-label="Menu du bureau"
      className="fixed z-1001 min-w-56 p-1"
      style={{ top: clamped.y, left: clamped.x }}
    >
      <MenuBarMenuItem label="Changer le fond d'écran…" onSelect={onSelectWallpaper} />
      <MenuBarMenuSeparator />
      <MenuBarMenuItem label="Nouvelle note" onSelect={onClose} />
    </div>
  );
}
