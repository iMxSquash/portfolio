import { create } from "zustand";
import type { OSMode } from "@/lib/device";

type OSStore = {
  mode: OSMode;
  setMode: (mode: OSMode) => void;
};

/**
 * Resolved OS mode (macos/ios), derived from the current device on every
 * session — deliberately NOT persisted. Persisting it would let a stale
 * mode leak across devices via localStorage/profile sync (e.g. an iPhone
 * session making a desktop browser boot into iOS mode).
 */
export const useOSStore = create<OSStore>((set) => ({
  mode: "macos",
  setMode: (mode) => set({ mode }),
}));
