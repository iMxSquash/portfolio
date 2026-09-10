"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useWindowStore } from "@/stores/useWindowStore";
import { DesktopContextMenu } from "./DesktopContextMenu";
import { WallpaperPicker } from "./WallpaperPicker";

/** Below this, a press+release reads as a plain click (deselect), not a marquee drag. */
const DRAG_THRESHOLD_PX = 4;

type Point = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type MenuState = { position: Point; view: "menu" | "wallpaper" };

type DesktopBackgroundProps = {
  onSelectionChange: (ids: string[]) => void;
};

function rectsIntersect(a: DOMRect, b: Rect): boolean {
  return (
    a.left < b.x + b.width &&
    a.left + a.width > b.x &&
    a.top < b.y + b.height &&
    a.top + a.height > b.y
  );
}

/**
 * The desktop's empty background: plain click deselects everything and
 * defocuses windows (see MacOS.tsx), drag opens a marquee selecting every
 * icon it touches, right-click opens the desktop context menu.
 */
export function DesktopBackground({ onSelectionChange }: DesktopBackgroundProps) {
  const blurAll = useWindowStore((state) => state.blurAll);
  const dragRef = useRef<{ start: Point; pointerId: number; dragging: boolean } | null>(null);
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);

  useEffect(() => {
    if (!menu) return;

    function handlePointerDown(event: PointerEvent) {
      if ((event.target as Element).closest('[role="menu"]')) return;
      setMenu(null);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menu]);

  function iconsWithinRect(rect: Rect): string[] {
    const icons = document.querySelectorAll<HTMLElement>("[data-desktop-icon-id]");
    const ids: string[] = [];
    icons.forEach((el) => {
      if (rectsIntersect(el.getBoundingClientRect(), rect)) {
        const id = el.dataset.desktopIconId;
        if (id) ids.push(id);
      }
    });
    return ids;
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      start: { x: event.clientX, y: event.clientY },
      pointerId: event.pointerId,
      dragging: false,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.start.x;
    const dy = event.clientY - drag.start.y;
    if (!drag.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    drag.dragging = true;
    const rect: Rect = {
      x: Math.min(drag.start.x, event.clientX),
      y: Math.min(drag.start.y, event.clientY),
      width: Math.abs(dx),
      height: Math.abs(dy),
    };
    setMarquee(rect);
    onSelectionChange(iconsWithinRect(rect));
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag.dragging) {
      onSelectionChange([]);
      blurAll();
    }
    dragRef.current = null;
    setMarquee(null);
  }

  function handleContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    setMenu({ position: { x: event.clientX, y: event.clientY }, view: "menu" });
  }

  return (
    <>
      <div
        role="presentation"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        className="absolute inset-0 touch-none cursor-default"
      />

      {marquee ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-40 rounded-[2px] border border-blue-400 bg-blue-400/20"
          style={{ left: marquee.x, top: marquee.y, width: marquee.width, height: marquee.height }}
        />
      ) : null}

      {menu?.view === "menu" ? (
        <DesktopContextMenu
          position={menu.position}
          onSelectWallpaper={() => setMenu({ position: menu.position, view: "wallpaper" })}
          onClose={() => setMenu(null)}
        />
      ) : null}

      {menu?.view === "wallpaper" ? (
        <WallpaperPicker position={menu.position} onClose={() => setMenu(null)} />
      ) : null}
    </>
  );
}
