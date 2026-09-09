"use client";

import Image from "next/image";
import { getDefaultWallpaper, getWallpaper } from "@/lib/wallpapers";
import { useWallpaperStore } from "@/stores/useWallpaperStore";

export function IOS() {
  const wallpaperId = useWallpaperStore((state) => state.selected.ios);
  const wallpaper = getWallpaper(wallpaperId) ?? getDefaultWallpaper("ios");

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Image
        src={wallpaper.src}
        alt=""
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="pointer-events-none object-cover select-none [-webkit-user-drag:none]"
      />
    </div>
  );
}
