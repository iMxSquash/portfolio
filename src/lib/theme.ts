export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme-mode";

/** Single source of labels for the 3 theme modes — shared by every theme switcher (Control Center, Réglages Système > Apparence) so they can't drift out of sync with each other. */
export const THEME_MODE_OPTIONS: Array<{ mode: ThemeMode; label: string }> = [
  { mode: "light", label: "Clair" },
  { mode: "dark", label: "Sombre" },
  { mode: "system", label: "Système" },
];

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): "light" | "dark" {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }
  return mode;
}

export function applyResolvedTheme(
  resolved: "light" | "dark",
  target: HTMLElement = document.documentElement,
) {
  target.classList.toggle("dark", resolved === "dark");
}
