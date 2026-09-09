"use client";

import { useEffect, useState } from "react";
import {
  MOBILE_MAX_WIDTH_QUERY,
  POINTER_COARSE_QUERY,
  resolveOSModeFromMediaQueries,
  type OSMode,
} from "@/lib/device";
import { useBootStore } from "@/stores/useBootStore";
import { useOSStore } from "@/stores/useOSStore";
import { BootScreen } from "./BootScreen";
import { MacOS } from "./MacOS";
import { IOS } from "./IOS";

export function OS({ initialMode }: { initialMode: OSMode }) {
  const [mode, setMode] = useState<OSMode>(initialMode);
  const setStoreMode = useOSStore((state) => state.setMode);
  const bootStage = useBootStore((state) => state.stage);

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

  if (mode === "ios") {
    return <IOS />;
  }

  return (
    <>
      <MacOS inert={bootStage !== "done"} />
      <BootScreen />
    </>
  );
}
