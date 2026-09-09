import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WALLPAPER_STORAGE_KEY, getDefaultWallpaper } from "@/lib/wallpapers";

type WallpaperStore = {
  selected: Record<"macos" | "ios", string>;
  setWallpaper: (os: "macos" | "ios", id: string) => void;
};

export const useWallpaperStore = create<WallpaperStore>()(
  persist(
    (set) => ({
      selected: {
        macos: getDefaultWallpaper("macos").id,
        ios: getDefaultWallpaper("ios").id,
      },
      setWallpaper: (os, id) =>
        set((state) => ({ selected: { ...state.selected, [os]: id } })),
    }),
    { name: WALLPAPER_STORAGE_KEY },
  ),
);
