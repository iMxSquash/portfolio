"use client";

import { WallpaperGrid } from "@/components/os/desktop/WallpaperGrid";
import { useOSStore } from "@/stores/useOSStore";
import { useWallpaperStore } from "@/stores/useWallpaperStore";
import { SettingsGroup } from "../controls/SettingsGroup";

/**
 * Fond d'écran: reuses `useWallpaperStore` and `WallpaperGrid`, unchanged
 * between the desktop `SettingsView` and the iOS `SettingsMobile` (see
 * TODO-settings.md Phase 9) — reads `useOSStore`'s resolved mode itself to
 * switch between macOS and iOS wallpapers, so neither caller needs to pass
 * anything down. Stays in sync with the desktop's own context-menu picker.
 */
export function WallpaperPane() {
  const os = useOSStore((state) => state.mode);
  const selected = useWallpaperStore((state) => state.selected[os]);
  const setWallpaper = useWallpaperStore((state) => state.setWallpaper);

  return (
    <SettingsGroup srOnlyTitle="Fond d'écran">
      <div className="p-4">
        <WallpaperGrid
          os={os}
          selectedId={selected}
          imageSizes="140px"
          onSelect={(id) => setWallpaper(os, id)}
        />
      </div>
    </SettingsGroup>
  );
}
