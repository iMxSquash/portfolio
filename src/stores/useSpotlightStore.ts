import { create } from "zustand";

type SpotlightStore = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

/** Shared so both the ⌘Space shortcut and the menu-bar magnifier icon can open/close the same overlay (see Spotlight.tsx). */
export const useSpotlightStore = create<SpotlightStore>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  close: () => set({ open: false }),
}));
