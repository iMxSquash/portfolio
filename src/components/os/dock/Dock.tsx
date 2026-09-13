"use client";

import { useState } from "react";
import { useMotionValue } from "framer-motion";
import { getApp, getDockApps, TRASH_APP_ID, type AppDefinition } from "@/lib/apps";
import { DOCK_HEIGHT, DOCK_PADDING_Y } from "@/lib/dock";
import { DOCK_GLASS } from "@/lib/glass-presets";
import { useLiquidGlass } from "@/lib/use-liquid-glass";
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
  const [dockEl, setDockEl] = useState<HTMLDivElement | null>(null);
  // The dock must let magnified icons pop out above the glass like real
  // macOS (its inner layers each clip themselves independently, so this
  // doesn't break their rendering) — see the `overflow` option's own doc
  // comment in `use-liquid-glass.ts` for why this can't go through `config`.
  useLiquidGlass(dockEl, DOCK_GLASS, { overflow: "visible" });

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
      style={{ height: DOCK_HEIGHT }}
      className="fixed bottom-(--dock-margin-bottom-max) left-1/2 z-[1000] -translate-x-1/2"
    >
      {/*
        Stable wrapper the host's children-reparenting invariant requires
        (see the hook's own doc comment in use-liquid-glass.ts) — icons
        opening/minimizing change this list's shape, so it can't be a direct
        child of the glass host itself. Also carries the flex layout the
        reparented content layer doesn't provide on its own.
      */}
      <div
        onMouseMove={(event) => mouseX.set(event.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{ paddingBlock: DOCK_PADDING_Y }}
        className="flex h-full items-end gap-2 px-3"
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
    </div>
  );
}
