export type Wallpaper = {
  id: string;
  label: string;
  os: "macos" | "ios";
  src: string;
};

/** Single source of truth for wallpapers. Add new entries here as assets are added. */
export const WALLPAPERS: Wallpaper[] = [
  {
    id: "bonjour-green-dark",
    label: "Bonjour (green, dark)",
    os: "macos",
    src: "/img/wallpapers/macos/bonjour-green-dark.png",
  },
  {
    id: "black",
    label: "Black",
    os: "ios",
    src: "/img/wallpapers/ios/black.png",
  },
];

export const WALLPAPER_STORAGE_KEY = "wallpaper-selection";

export function getWallpapersFor(os: "macos" | "ios"): Wallpaper[] {
  return WALLPAPERS.filter((wallpaper) => wallpaper.os === os);
}

export function getWallpaper(id: string): Wallpaper | undefined {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id);
}

export function getDefaultWallpaper(os: "macos" | "ios"): Wallpaper {
  const wallpaper = getWallpapersFor(os)[0];
  if (!wallpaper) {
    throw new Error(`No wallpaper registered for OS mode "${os}"`);
  }
  return wallpaper;
}
