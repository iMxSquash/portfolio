"use client";

import { useEffect, useState } from "react";
import { resolveTheme } from "@/lib/theme";
import { useThemeStore } from "@/stores/useThemeStore";

/**
 * Resolves `useThemeStore`'s mode (light/dark/system) to a live boolean,
 * mirroring `ThemeProvider`'s own system-preference resolution. For
 * components that need a JS boolean rather than a CSS `dark:` variant — e.g.
 * `LiquidGlassConfig.tint`, a static value with no light/dark switching of
 * its own (see `SIDEBAR_CHROME_TINT_LIGHT/DARK` in glass-presets.ts).
 */
export function useIsDarkMode(): boolean {
  const mode = useThemeStore((state) => state.mode);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setIsDarkMode(resolveTheme(mode, media.matches) === "dark");
    update();
    if (mode !== "system") return;
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [mode]);

  return isDarkMode;
}
