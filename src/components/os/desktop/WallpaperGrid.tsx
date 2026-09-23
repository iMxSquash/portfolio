"use client";

import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { getWallpapersFor, type Wallpaper } from "@/lib/wallpapers";

type WallpaperGridProps = {
  os: Wallpaper["os"];
  selectedId: string;
  onSelect: (id: string) => void;
  /** `sizes` attribute for the thumbnail `<Image>` — differs between the compact popover and the larger Settings grid. */
  imageSizes: string;
};

/**
 * 3-column wallpaper thumbnail grid: selection = accent ring + checkmark, so
 * it isn't conveyed by a color/highlight alone. Shared by the desktop
 * context-menu picker (`WallpaperPicker.tsx`) and the Réglages Système
 * "Fond d'écran" pane (`WallpaperPane.tsx`) rather than duplicated.
 */
export function WallpaperGrid({ os, selectedId, onSelect, imageSizes }: WallpaperGridProps) {
  const wallpapers = getWallpapersFor(os);

  return (
    <div className="grid grid-cols-3 gap-2">
      {wallpapers.map((wallpaper) => {
        const isSelected = wallpaper.id === selectedId;
        return (
          <button
            key={wallpaper.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={wallpaper.label}
            onClick={() => onSelect(wallpaper.id)}
            className={`focus-visible:outline-system-blue relative aspect-video overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isSelected ? "ring-2 ring-system-blue" : "ring-1 ring-black/10 dark:ring-white/15"
            }`}
          >
            <Image src={wallpaper.src} alt="" fill sizes={imageSizes} className="object-cover" />
            {isSelected ? (
              <span className="bg-system-blue absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full">
                <IconCheck size={12} stroke={3} className="text-white" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
