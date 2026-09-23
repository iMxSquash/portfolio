import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  type AccessibilitySettings,
  type AppearanceSettings,
  type DockSettings,
  type GlassSettings,
  type SettingsState,
  type SoundSettings,
} from "@/lib/settings";

type SettingsSection = keyof SettingsState;

type SettingsStore = SettingsState & {
  updateGlass: (partial: Partial<GlassSettings>) => void;
  updateAccessibility: (partial: Partial<AccessibilitySettings>) => void;
  updateDock: (partial: Partial<DockSettings>) => void;
  updateSound: (partial: Partial<SoundSettings>) => void;
  updateAppearance: (partial: Partial<AppearanceSettings>) => void;
  /** Resets one section to its default (e.g. the Liquid Glass pane's "Réinitialiser" button). */
  resetSection: (section: SettingsSection) => void;
  /** Resets everything (the General pane's "Réinitialiser tous les réglages" button). */
  resetAll: () => void;
};

/**
 * Persisted `useSettingsStore` (localStorage, like `useThemeStore` /
 * `useWallpaperStore`) — every OS surface reads its section from here rather
 * than a local copy. Theme and wallpaper stay in their own stores (see
 * `useThemeStore`/`useWallpaperStore`) so the Control Center and desktop
 * picker keep working unmodified.
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateGlass: (partial) => set((state) => ({ glass: { ...state.glass, ...partial } })),
      updateAccessibility: (partial) =>
        set((state) => ({ accessibility: { ...state.accessibility, ...partial } })),
      updateDock: (partial) => set((state) => ({ dock: { ...state.dock, ...partial } })),
      updateSound: (partial) => set((state) => ({ sound: { ...state.sound, ...partial } })),
      updateAppearance: (partial) =>
        set((state) => ({ appearance: { ...state.appearance, ...partial } })),

      // `section` is a `keyof SettingsState`, so `DEFAULT_SETTINGS[section]` is
      // always that section's own default shape — a per-section switch would
      // just repeat what the type already guarantees.
      resetSection: (section) => set({ [section]: DEFAULT_SETTINGS[section] }),

      resetAll: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: SETTINGS_VERSION,
      // No shape change since version 1 yet — a future bump adds real
      // per-version steps here instead of this passthrough.
      migrate: (persistedState) => persistedState as SettingsState,
      partialize: (state) => ({
        glass: state.glass,
        accessibility: state.accessibility,
        dock: state.dock,
        sound: state.sound,
        appearance: state.appearance,
      }),
    },
  ),
);
