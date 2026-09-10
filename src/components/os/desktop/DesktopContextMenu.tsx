"use client";

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
  return (
    <div
      role="menu"
      aria-label="Menu du bureau"
      className="liquid-glass fixed z-[1001] min-w-56 rounded-lg p-1 shadow-glass-lg"
      style={{ top: position.y, left: position.x }}
    >
      <MenuBarMenuItem label="Changer le fond d'écran…" onSelect={onSelectWallpaper} />
      <MenuBarMenuSeparator />
      <MenuBarMenuItem label="Nouvelle note" onSelect={onClose} />
    </div>
  );
}
