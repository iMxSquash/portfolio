import { create } from "zustand";

type DockIconStore = {
  refs: Record<string, HTMLElement | null>;
  /** The dock (Phase 3) calls this from each icon's ref callback so windows know where to minimize to. */
  registerIconRef: (appId: string, el: HTMLElement | null) => void;
  /** Current on-screen rect of an app's dock icon, or null if it has none registered (e.g. dock not built yet). */
  getIconRect: (appId: string) => DOMRect | null;
};

export const useDockIconStore = create<DockIconStore>((set, get) => ({
  refs: {},
  registerIconRef: (appId, el) => set((state) => ({ refs: { ...state.refs, [appId]: el } })),
  getIconRect: (appId) => get().refs[appId]?.getBoundingClientRect() ?? null,
}));
