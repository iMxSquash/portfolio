"use client";

import { WallpaperGrid } from "@/components/os/desktop/WallpaperGrid";
import { useWallpaperStore } from "@/stores/useWallpaperStore";
import { SettingsGroup } from "../controls/SettingsGroup";

/** Fond d'écran: reuses `useWallpaperStore` and `WallpaperGrid` — stays in sync with the desktop's own context-menu picker. Desktop-only app, so only "macos" wallpapers apply. */
export function WallpaperPane() {
  const selected = useWallpaperStore((state) => state.selected.macos);
  const setWallpaper = useWallpaperStore((state) => state.setWallpaper);

  return (
    <SettingsGroup srOnlyTitle="Fond d'écran">
      <div className="p-4">
        <WallpaperGrid
          os="macos"
          selectedId={selected}
          imageSizes="140px"
          onSelect={(id) => setWallpaper("macos", id)}
        />
      </div>
    </SettingsGroup>
  );
}
