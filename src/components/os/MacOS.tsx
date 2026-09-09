"use client";

import Image from "next/image";
import { getDefaultWallpaper, getWallpaper } from "@/lib/wallpapers";
import { useWallpaperStore } from "@/stores/useWallpaperStore";

export function MacOS({ inert = false }: { inert?: boolean }) {
  const wallpaperId = useWallpaperStore((state) => state.selected.macos);
  const wallpaper = getWallpaper(wallpaperId) ?? getDefaultWallpaper("macos");

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
    </div>
  );
}
