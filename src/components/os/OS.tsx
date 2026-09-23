"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { mergeAppRegistry, type AppDefinition } from "@/lib/apps";
import {
  MOBILE_MAX_WIDTH_QUERY,
  POINTER_COARSE_QUERY,
  resolveOSModeFromMediaQueries,
  type OSMode,
} from "@/lib/device";
import { useAppsStore } from "@/stores/useAppsStore";
import { useBootStore } from "@/stores/useBootStore";
import { useOSStore } from "@/stores/useOSStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { BootScreen } from "./BootScreen";
import { IframeAppChannelListener } from "./iframe-app-channel/IframeAppChannelListener";
import { MacOS } from "./MacOS";
import { IOS } from "./IOS";

export function OS({
  initialMode,
  initialProjectApps,
}: {
  initialMode: OSMode;
  initialProjectApps: AppDefinition[];
}) {
  const [mode, setMode] = useState<OSMode>(initialMode);
  const setStoreMode = useOSStore((state) => state.setMode);
  const bootStage = useBootStore((state) => state.stage);
  const setApps = useAppsStore((state) => state.setApps);
  const reduceMotion = useSettingsStore((state) => state.accessibility.reduceMotion);

  // Hydrates the store once with the full registry (system apps + Supabase
  // projects) — see useAppsStore. Stays a store (not local state passed as a
  // prop) because Finder needs the registry too and isn't a direct child of
  // OS/MacOS/IOS — see FinderView.tsx.
  useEffect(() => {
    setApps(mergeAppRegistry(initialProjectApps));
  }, [initialProjectApps, setApps]);

  useEffect(() => {
    const pointerCoarse = window.matchMedia(POINTER_COARSE_QUERY);
    const isNarrow = window.matchMedia(MOBILE_MAX_WIDTH_QUERY);

    const recompute = () => {
      const next = resolveOSModeFromMediaQueries({
        pointerCoarse: pointerCoarse.matches,
        isNarrow: isNarrow.matches,
      });
      setMode(next);
      setStoreMode(next);
    };

    setStoreMode(initialMode);
    recompute();

    pointerCoarse.addEventListener("change", recompute);
    isNarrow.addEventListener("change", recompute);
    return () => {
      pointerCoarse.removeEventListener("change", recompute);
      isNarrow.removeEventListener("change", recompute);
    };
  }, [initialMode, setStoreMode]);

  return (
    // "Réduire les animations" (Accessibilité pane): forces every existing
    // `useReducedMotion()` call in the tree to report true, with no change
    // needed at any of those call sites (see os-window-manager skill).
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <IframeAppChannelListener />
      {mode === "ios" ? (
        <>
          <IOS inert={bootStage !== "done"} />
          <BootScreen mode="ios" />
        </>
      ) : (
        <>
          <MacOS inert={bootStage !== "done"} />
          <BootScreen mode="macos" />
        </>
      )}
    </MotionConfig>
  );
}
