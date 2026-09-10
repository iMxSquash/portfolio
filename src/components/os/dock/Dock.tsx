"use client";

import { useState, type CSSProperties } from "react";
import { useMotionValue } from "framer-motion";
import { getApp, getDockApps, TRASH_APP_ID, type AppDefinition } from "@/lib/apps";
import { useLiquidGlassRefraction } from "@/lib/use-liquid-glass-refraction";
import { useLiquidGlassStore } from "@/stores/useLiquidGlassStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { DockIcon } from "./DockIcon";

type DockProps = {
  apps: AppDefinition[];
};

/**
 * Centered bottom dock: pinned apps, a separator, then minimized windows
 * that aren't pinned, then the Trash (always last, see `TRASH_APP_ID`).
 * Renders nothing while the registry has nothing to show — Phase 4/5/7
 * populate `SYSTEM_APPS` and the Supabase-backed projects.
 */
export function Dock({ apps }: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const windows = useWindowStore((state) => state.windows);
  const glassParams = useLiquidGlassStore((state) => state.params);
  const [dockEl, setDockEl] = useState<HTMLDivElement | null>(null);
  useLiquidGlassRefraction(dockEl, {
    scale: glassParams.refractScale,
    aberration: glassParams.refractAberration,
    mode: glassParams.refractMode,
  });

  const pinnedApps = getDockApps(apps).filter((app) => app.id !== TRASH_APP_ID);
  const trashApp = getApp(apps, TRASH_APP_ID);
  const minimizedApps = Object.values(windows)
    .filter(
      (win) =>
        win.isMinimized &&
        win.appId !== TRASH_APP_ID &&
        !pinnedApps.some((app) => app.id === win.appId),
    )
    .map((win) => getApp(apps, win.appId))
    .filter((app): app is AppDefinition => app !== undefined);

  if (pinnedApps.length === 0 && minimizedApps.length === 0 && !trashApp) return null;

  return (
    <div
      ref={setDockEl}
      onMouseMove={(event) => mouseX.set(event.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      // Lower tint than the base `liquid-glass` default so the refraction
      // (when supported) reads clearly instead of being muddied — no-op on
      // engines that fall back to the plain CSS blur+saturate.
      style={{ "--glass-tint-alpha": glassParams.refractTintAlpha } as CSSProperties}
      className="liquid-glass glass-hairline fixed bottom-(--dock-margin-bottom-max) left-1/2 z-[1000] flex -translate-x-1/2 items-end gap-2 px-3 py-2"
    >
      {pinnedApps.map((app) => (
        <DockIcon key={app.id} app={app} mouseX={mouseX} isOpen={Boolean(windows[app.id])} />
      ))}

      {pinnedApps.length > 0 && (minimizedApps.length > 0 || trashApp) ? (
        <div className="mx-1 w-px self-stretch bg-black/10 dark:bg-white/10" aria-hidden="true" />
      ) : null}

      {minimizedApps.map((app) => (
        <DockIcon key={app.id} app={app} mouseX={mouseX} isOpen />
      ))}

      {trashApp ? (
        <DockIcon app={trashApp} mouseX={mouseX} isOpen={Boolean(windows[trashApp.id])} />
      ) : null}
    </div>
  );
}
