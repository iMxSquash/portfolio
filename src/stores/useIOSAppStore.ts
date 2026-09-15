import { create } from "zustand";

type IOSAppStore = {
  /** The one app occupying the full screen, or `null` on the springboard. No position/size/zIndex — iOS has no floating windows (see os-ios-ui skill: single active app, no switcher in v1). */
  activeAppId: string | null;
  openApp: (appId: string) => void;
  closeApp: () => void;
};

export const useIOSAppStore = create<IOSAppStore>((set) => ({
  activeAppId: null,
  openApp: (appId) => set({ activeAppId: appId }),
  closeApp: () => set({ activeAppId: null }),
}));
