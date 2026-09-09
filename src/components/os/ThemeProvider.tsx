"use client";

import { useEffect } from "react";
import { applyResolvedTheme, resolveTheme } from "@/lib/theme";
import { useThemeStore } from "@/stores/useThemeStore";

/**
 * Syncs `useThemeStore` (mode: light/dark/system) to the `.dark` class on
 * `<html>`, which drives Tailwind's class-based `dark:` variant (see
 * globals.css). Also reacts live to OS-level theme changes while in
 * `"system"` mode. Mounted once near the app root — see the blocking
 * inline script in layout.tsx for the anti-FOUC first paint.
 */
export function ThemeProvider() {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => applyResolvedTheme(resolveTheme(mode, media.matches));
    apply();

    if (mode !== "system") {
      return;
    }
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode]);

  return null;
}
