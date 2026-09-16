"use client";

import { useState } from "react";
import { AppIcon } from "@/components/os/AppIcon";
import { launchApp, type AppDefinition } from "@/lib/apps";
import { getIOSDockApps } from "@/lib/ios";
import { IOS_DOCK_GLASS } from "@/lib/glass-presets";
import { useLiquidGlass } from "@/lib/use-liquid-glass";
import { useIOSAppStore } from "@/stores/useIOSAppStore";

type IOSDockProps = {
  apps: AppDefinition[];
  /**
   * Visually hidden (not unmounted) while an app is full screen. Staying
   * mounted keeps its `LiquidGlassEngine` alive — that engine is expensive
   * to build (see use-liquid-glass.ts) and every app open/close would
   * otherwise destroy and rebuild it for no visual change.
   */
  hidden?: boolean;
};

/**
 * Fixed 4-icon dock above the home indicator (see os-ios-ui skill): no
 * running-app indicator dots and no cursor magnification, unlike the macOS
 * dock — real iOS doesn't do either on a touch dock.
 */
export function IOSDock({ apps, hidden = false }: IOSDockProps) {
  const [dockEl, setDockEl] = useState<HTMLDivElement | null>(null);
  const openApp = useIOSAppStore((state) => state.openApp);
  // Static wrapper for the "host children" invariant (see use-liquid-glass.ts) —
  // the dock's app list never changes shape during the component's life, but
  // every glass host follows this pattern regardless (see Dock.tsx).
  useLiquidGlass(dockEl, IOS_DOCK_GLASS);

  const dockApps = getIOSDockApps(apps);
  if (dockApps.length === 0) return null;

  return (
    <div
      ref={setDockEl}
      inert={hidden}
      className={`fixed inset-x-4 bottom-0 z-1000 flex h-(--ios-dock-height) items-center justify-evenly px-2 [&>.ql-content]:w-full ${
        hidden ? "invisible" : ""
      }`}
      style={{ marginBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="flex w-full items-center justify-evenly">
        {dockApps.map((app) => (
          <button
            key={app.id}
            type="button"
            aria-label={app.name}
            onClick={() => launchApp(app, openApp)}
            className="block w-(--ios-dock-icon-size) [-webkit-touch-callout:none] select-none"
          >
            <AppIcon app={app} />
          </button>
        ))}
      </div>
    </div>
  );
}
