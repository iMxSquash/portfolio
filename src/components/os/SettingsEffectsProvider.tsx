"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Syncs the two Réglages Système settings that land directly on `<html>`
 * (same mechanism as `ThemeProvider.tsx`'s `.dark` class): the accent
 * color's `data-accent` attribute and the "increase contrast" class. Mounted
 * once near the app root — see the blocking `settings-init` script in
 * layout.tsx for the anti-FOUC first paint.
 */
export function SettingsEffectsProvider() {
  const accentColor = useSettingsStore((state) => state.appearance.accentColor);
  const increaseContrast = useSettingsStore((state) => state.accessibility.increaseContrast);

  useEffect(() => {
    const root = document.documentElement;
    // "Multicolore" is the default — no override, falls through to the base
    // `--system-blue` already declared in globals.css.
    if (accentColor === "multicolor") {
      root.removeAttribute("data-accent");
    } else {
      root.setAttribute("data-accent", accentColor);
    }
  }, [accentColor]);

  useEffect(() => {
    document.documentElement.classList.toggle("increase-contrast", increaseContrast);
  }, [increaseContrast]);

  return null;
}
