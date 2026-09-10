"use client";

import { useState } from "react";
import Image from "next/image";
import { SYSTEM_APPS } from "@/lib/apps";
import { getDefaultWallpaper, getWallpaper } from "@/lib/wallpapers";
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
      {inert ? null : <MenuBar apps={SYSTEM_APPS} />}
      <DesktopIcons
        apps={SYSTEM_APPS}
        selectedIds={selectedDesktopIconIds}
        onSelect={(id) => setSelectedDesktopIconIds([id])}
      />
      <WindowManager apps={SYSTEM_APPS} />
      <Dock apps={SYSTEM_APPS} />
      <Spotlight apps={SYSTEM_APPS} disabled={inert} />
    </div>
  );
}
