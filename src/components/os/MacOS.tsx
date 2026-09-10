"use client";

import { useState } from "react";
import Image from "next/image";
import { SYSTEM_APPS } from "@/lib/apps";
import { getDefaultWallpaper, getWallpaper } from "@/lib/wallpapers";
import { useWallpaperStore } from "@/stores/useWallpaperStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { DesktopIcons } from "./desktop/DesktopIcons";
import { Dock } from "./dock/Dock";
import { MenuBar } from "./menu-bar/MenuBar";
import { Spotlight } from "./spotlight/Spotlight";
import { WindowManager } from "./window/WindowManager";

export function MacOS({ inert = false }: { inert?: boolean }) {
  const wallpaperId = useWallpaperStore((state) => state.selected.macos);
  const wallpaper = getWallpaper(wallpaperId) ?? getDefaultWallpaper("macos");
  const blurAll = useWindowStore((state) => state.blurAll);
  const [selectedDesktopIconId, setSelectedDesktopIconId] = useState<string | null>(null);

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
      {/* Click-to-deselect surface: sits behind icons/windows/chrome (z-index:auto,
          painted in DOM order) so it never intercepts clicks meant for them. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => {
          setSelectedDesktopIconId(null);
          blurAll();
        }}
        className="absolute inset-0 cursor-default"
      />
      {/* Hidden while locked/booting (`inert` mirrors bootStage !== "done", see OS.tsx) — the
          lock screen is meant to cover everything, not just block interaction with it. */}
      {inert ? null : <MenuBar apps={SYSTEM_APPS} />}
      <DesktopIcons
        apps={SYSTEM_APPS}
        selectedId={selectedDesktopIconId}
        onSelect={setSelectedDesktopIconId}
      />
      <WindowManager apps={SYSTEM_APPS} />
      <Dock apps={SYSTEM_APPS} />
      <Spotlight apps={SYSTEM_APPS} disabled={inert} />
    </div>
  );
}
