"use client";

import type { KeyboardEvent } from "react";
import { AppIcon } from "@/components/os/AppIcon";
import { focusListSibling } from "@/lib/arrow-key-nav";
import { findFirstImageIconId, getDesktopApps, launchApp, type AppDefinition } from "@/lib/apps";
import { getDesktopIconsBottomInset } from "@/lib/dock";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useWindowStore } from "@/stores/useWindowStore";

type DesktopIconsProps = {
  apps: AppDefinition[];
  selectedIds: string[];
  onSelect: (id: string) => void;
};

/**
 * Icons aligned in a column from the right edge (macOS convention), wrapping
 * into a new column to the left once the current one is full so nothing spills
 * past the bottom of the screen. The bottom of the column stops above the dock
 * (see `getDesktopIconsBottomInset`), like the real desktop grid. Single click
 * selects (highlight), double click opens. Deselecting on background click,
 * and multi-select via the drag marquee, are handled by the caller (see
 * MacOS.tsx / DesktopBackground.tsx) — `data-desktop-icon-id` is what the
 * marquee's hit-testing looks for.
 */
export function DesktopIcons({ apps, selectedIds, onSelect }: DesktopIconsProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const dockIconSize = useSettingsStore((state) => state.dock.iconSize);
  const desktopApps = getDesktopApps(apps);
  const firstImageIconId = findFirstImageIconId(desktopApps);

  if (desktopApps.length === 0) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    focusListSibling(event, event.currentTarget, "vertical", "[data-desktop-icon-id]");
  }

  return (
    // `pointer-events-none` on the column itself: its bounding box spans the
    // full right-edge strip (including empty gaps between icons), which would
    // otherwise swallow clicks/right-clicks meant for the desktop background
    // underneath. Only the icon buttons re-enable pointer events.
    <div
      className="pointer-events-none absolute top-(--menu-bar-height) right-0 bottom-0 flex flex-col flex-wrap-reverse content-start gap-1 p-4"
      style={{ paddingBottom: getDesktopIconsBottomInset(dockIconSize) }}
      onKeyDown={handleKeyDown}
    >
      {desktopApps.map((app) => (
        <button
          key={app.id}
          type="button"
          data-desktop-icon-id={app.id}
          onClick={() => onSelect(app.id)}
          onFocus={() => onSelect(app.id)}
          onDoubleClick={() => launchApp(app, openWindow)}
          className="pointer-events-auto flex w-20 flex-col items-center gap-1 rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="w-12">
            <AppIcon app={app} priority={app.id === firstImageIconId} />
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-center text-[12px] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.6)] ${
              selectedIds.includes(app.id) ? "bg-system-blue/60" : ""
            }`}
          >
            {app.name}
          </span>
        </button>
      ))}
    </div>
  );
}
