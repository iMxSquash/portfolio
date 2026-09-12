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
  /** Clears focus without closing anything — clicking the desktop background falls back to "Finder" in the menu bar. */
  blurAll: () => void;
  minimizeWindow: (appId: string) => void;
  toggleMaximize: (appId: string, maximizedBounds: Bounds) => void;
  /** Commits a position/size change — call only once, at the end of a drag/resize gesture. */
  setBounds: (appId: string, bounds: Partial<Bounds>) => void;
  setInteracting: (isInteracting: boolean) => void;
};

const WINDOW_BOUNDS_STORAGE_KEY = "window-bounds";

/** Finds the next window that should receive focus when `excludeAppId` stops being focusable — the topmost (highest zIndex) among the remaining, non-minimized windows. */
function findNextFocusCandidate(
  windows: Record<string, WindowState>,
  excludeAppId: string,
): string | null {
  let candidate: WindowState | null = null;
  for (const win of Object.values(windows)) {
    if (win.appId === excludeAppId || win.isMinimized) continue;
    if (!candidate || win.zIndex > candidate.zIndex) candidate = win;
  }
  return candidate?.appId ?? null;
}

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

          if (existing) {
            // Already focused and not minimized: nothing to bring forward, don't burn a z-index.
            if (state.focusedAppId === appId && !existing.isMinimized) return state;
            const zIndex = state.nextZIndex;
            return {
              windows: { ...state.windows, [appId]: { ...existing, isMinimized: false, zIndex } },
              nextZIndex: zIndex + 1,
              focusedAppId: appId,
            };
          }

          const zIndex = state.nextZIndex;

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
            focusedAppId:
              state.focusedAppId === appId
                ? findNextFocusCandidate(windows, appId)
                : state.focusedAppId,
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

      blurAll: () => set({ focusedAppId: null }),

      minimizeWindow: (appId) =>
        set((state) => {
          const win = state.windows[appId];
          if (!win) return state;
          const windows = { ...state.windows, [appId]: { ...win, isMinimized: true } };
          return {
            windows,
            focusedAppId:
              state.focusedAppId === appId
                ? findNextFocusCandidate(windows, appId)
                : state.focusedAppId,
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
