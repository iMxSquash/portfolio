"use client";

import { AppIcon } from "@/components/os/AppIcon";
import { getDesktopApps, type AppDefinition } from "@/lib/apps";
import { useWindowStore } from "@/stores/useWindowStore";

type DesktopIconsProps = {
  apps: AppDefinition[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

/**
 * Icons aligned in a column from the right edge (macOS convention). Single
 * click selects (highlight), double click opens. Deselecting on background
 * click is handled by the caller (see MacOS.tsx).
 */
export function DesktopIcons({ apps, selectedId, onSelect }: DesktopIconsProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const desktopApps = getDesktopApps(apps);

  if (desktopApps.length === 0) return null;

  return (
    <div className="absolute top-(--menu-bar-height) right-0 bottom-0 flex flex-col items-end gap-1 p-4">
      {desktopApps.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={() => onSelect(app.id)}
          onDoubleClick={() => openWindow(app.id, app.defaultSize)}
          className="flex w-20 flex-col items-center gap-1 rounded p-1"
        >
          <span className="w-12">
            <AppIcon app={app} />
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-center text-[12px] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.6)] ${
              selectedId === app.id ? "bg-blue-500/60" : ""
            }`}
          >
            {app.name}
          </span>
        </button>
      ))}
    </div>
  );
}
