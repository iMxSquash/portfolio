import { create } from "zustand";

type IOSAppStore = {
  /** The one app occupying the full screen, or `null` on the springboard. No position/size/zIndex — iOS has no floating windows (see os-ios-ui skill). */
  activeAppId: string | null;
  /** Recently opened apps, most-recent-first, deduped — backs the app switcher. Survives `closeApp` (going home doesn't forget an app, same as real iOS). */
  recentAppIds: string[];
  isSwitcherOpen: boolean;
  openApp: (appId: string) => void;
  closeApp: () => void;
  openSwitcher: () => void;
  closeSwitcher: () => void;
  /** Switcher card tap: activates `appId` and dismisses the switcher in one step. */
  switchToApp: (appId: string) => void;
  /** Switcher card swiped away: forgets `appId`: it no longer appears in the switcher (matches real iOS "quitting" an app from the switcher). */
  removeFromRecents: (appId: string) => void;
};

export const useIOSAppStore = create<IOSAppStore>((set) => ({
  activeAppId: null,
  recentAppIds: [],
  isSwitcherOpen: false,

  openApp: (appId) =>
    set((state) => ({
      activeAppId: appId,
      recentAppIds: [appId, ...state.recentAppIds.filter((id) => id !== appId)],
    })),

  closeApp: () => set({ activeAppId: null }),

  openSwitcher: () => set({ isSwitcherOpen: true }),
  closeSwitcher: () => set({ isSwitcherOpen: false }),

  switchToApp: (appId) =>
    set((state) => ({
      activeAppId: appId,
      recentAppIds: [appId, ...state.recentAppIds.filter((id) => id !== appId)],
      isSwitcherOpen: false,
    })),

  removeFromRecents: (appId) =>
    set((state) => ({
      recentAppIds: state.recentAppIds.filter((id) => id !== appId),
      activeAppId: state.activeAppId === appId ? null : state.activeAppId,
    })),
}));
