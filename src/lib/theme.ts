export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme-mode";

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
