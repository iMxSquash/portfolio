"use client";

import { useState } from "react";
import Image from "next/image";
import { getDefaultWallpaper, getWallpaper } from "@/lib/wallpapers";
import { useAppsStore } from "@/stores/useAppsStore";
import { useWallpaperStore } from "@/stores/useWallpaperStore";
import { DesktopBackground } from "./desktop/DesktopBackground";
import { DesktopIcons } from "./desktop/DesktopIcons";
import { Dock } from "./dock/Dock";
import { MenuBar } from "./menu-bar/MenuBar";
import { Spotlight } from "./spotlight/Spotlight";
import { WindowManager } from "./window/WindowManager";

export function MacOS({ inert = false }: { inert?: boolean }) {
  const wallpaperId = useWallpaperStore((state) => state.selected.macos);
  const wallpaper = getWallpaper(wallpaperId) ?? getDefaultWallpaper("macos");
  const [selectedDesktopIconIds, setSelectedDesktopIconIds] = useState<string[]>([]);
  const apps = useAppsStore((state) => state.apps);

  return (
    <div className="relative h-dvh w-full overflow-hidden" inert={inert}>
      <Image
        src={wallpaper.src}
        alt=""
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="pointer-events-none object-cover select-none [-webkit-user-drag:none]"
      />
      {/* Sits behind icons/windows/chrome (z-index:auto, painted in DOM order) so it
          never intercepts clicks meant for them. Click deselects, drag marquee-selects,
          right-click opens the desktop context menu. */}
      <DesktopBackground onSelectionChange={setSelectedDesktopIconIds} />
      {/* Hidden while locked/booting (`inert` mirrors bootStage !== "done", see OS.tsx) — the
          lock screen is meant to cover everything, not just block interaction with it. */}
      {inert ? null : <MenuBar apps={apps} />}
      <DesktopIcons
        apps={apps}
        selectedIds={selectedDesktopIconIds}
        onSelect={(id) => setSelectedDesktopIconIds([id])}
      />
      <WindowManager apps={apps} />
      {/* Same reasoning as the menu bar above: the lock/boot screen must cover it, not just block it. */}
      {inert ? null : <Dock apps={apps} />}
      <Spotlight apps={apps} disabled={inert} />
    </div>
  );
}
