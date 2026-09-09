import { create } from "zustand";
import type { BootStage } from "@/lib/boot";

type BootStore = {
  stage: BootStage;
  setStage: (stage: BootStage) => void;
};

/**
 * Deliberately not `persist`-backed (unlike useWallpaperStore/useThemeStore):
 * the "already seen this session" fact is read/written explicitly via
 * sessionStorage helpers (see src/lib/boot.ts) at controlled points (the
 * layout-effect correction, the unlock handler) rather than through
 * persist's own rehydration timing, which would be harder to reason about
 * for a value that must be correct before the first paint.
 */
export const useBootStore = create<BootStore>((set) => ({
  stage: "booting",
  setStage: (stage) => set({ stage }),
}));
