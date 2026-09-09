import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeDefaultBounds, type Bounds, type Position, type Size } from "@/lib/window";

export type WindowState = {
  appId: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  /** Bounds to restore to when un-maximizing. */
  prevBounds?: Bounds;
};

type WindowStore = {
  windows: Record<string, WindowState>;
  /** Last known position/size per app, kept after close so reopening restores it. Persisted. */
  lastBounds: Record<string, Bounds>;
  nextZIndex: number;
  focusedAppId: string | null;
  /** True while a drag/resize is in progress — lets iframe windows disable pointer-events. */
  isInteracting: boolean;
  /** Opens `appId`: focuses it if already open, restores it if minimized, else creates it. */
  openWindow: (appId: string, defaultSize: Size) => void;
  closeWindow: (appId: string) => void;
  focusWindow: (appId: string) => void;
  minimizeWindow: (appId: string) => void;
  toggleMaximize: (appId: string, maximizedBounds: Bounds) => void;
  /** Commits a position/size change — call only once, at the end of a drag/resize gesture. */
  setBounds: (appId: string, bounds: Partial<Bounds>) => void;
  setInteracting: (isInteracting: boolean) => void;
};

const WINDOW_BOUNDS_STORAGE_KEY = "window-bounds";

export const useWindowStore = create<WindowStore>()(
  persist(
    (set) => ({
      windows: {},
      lastBounds: {},
      nextZIndex: 1,
      focusedAppId: null,
      isInteracting: false,

      openWindow: (appId, defaultSize) =>
        set((state) => {
          const existing = state.windows[appId];
          const zIndex = state.nextZIndex;

          if (existing) {
            return {
              windows: { ...state.windows, [appId]: { ...existing, isMinimized: false, zIndex } },
              nextZIndex: zIndex + 1,
              focusedAppId: appId,
            };
          }

          const bounds =
            state.lastBounds[appId] ??
            computeDefaultBounds(defaultSize, Object.keys(state.windows).length, {
              width: window.innerWidth,
              height: window.innerHeight,
            });

          return {
            windows: {
              ...state.windows,
              [appId]: {
                appId,
                position: bounds.position,
                size: bounds.size,
                isMinimized: false,
                isMaximized: false,
                zIndex,
              },
            },
            nextZIndex: zIndex + 1,
            focusedAppId: appId,
          };
        }),

      closeWindow: (appId) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win) return state;

          const windows = { ...state.windows };
          delete windows[appId];
          const bounds = win.isMaximized
            ? (win.prevBounds ?? { position: win.position, size: win.size })
            : { position: win.position, size: win.size };

          return {
            windows,
            lastBounds: { ...state.lastBounds, [appId]: bounds },
            focusedAppId: state.focusedAppId === appId ? null : state.focusedAppId,
          };
        }),

      focusWindow: (appId) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win || state.focusedAppId === appId) return state;
          return {
            windows: { ...state.windows, [appId]: { ...win, zIndex: state.nextZIndex } },
            nextZIndex: state.nextZIndex + 1,
            focusedAppId: appId,
          };
        }),

      minimizeWindow: (appId) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win) return state;
          return {
            windows: { ...state.windows, [appId]: { ...win, isMinimized: true } },
            focusedAppId: state.focusedAppId === appId ? null : state.focusedAppId,
          };
        }),

      toggleMaximize: (appId, maximizedBounds) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win) return state;

          if (win.isMaximized) {
            const restored = win.prevBounds ?? { position: win.position, size: win.size };
            return {
              windows: {
                ...state.windows,
                [appId]: {
                  ...win,
                  isMaximized: false,
                  position: restored.position,
                  size: restored.size,
                  prevBounds: undefined,
                },
              },
            };
          }

          return {
            windows: {
              ...state.windows,
              [appId]: {
                ...win,
                isMaximized: true,
                prevBounds: { position: win.position, size: win.size },
                position: maximizedBounds.position,
                size: maximizedBounds.size,
              },
            },
          };
        }),

      setBounds: (appId, bounds) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win) return state;
          return {
            windows: {
              ...state.windows,
              [appId]: {
                ...win,
                position: bounds.position ?? win.position,
                size: bounds.size ?? win.size,
              },
            },
          };
        }),

      setInteracting: (isInteracting) => set({ isInteracting }),
    }),
    {
      name: WINDOW_BOUNDS_STORAGE_KEY,
      partialize: (state) => ({ lastBounds: state.lastBounds }),
    },
  ),
);
