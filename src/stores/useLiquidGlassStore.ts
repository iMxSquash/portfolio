import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LIQUID_GLASS,
  LIQUID_GLASS_STORAGE_KEY,
  type LiquidGlassParams,
} from "@/lib/liquid-glass";

type LiquidGlassStore = {
  params: LiquidGlassParams;
  setParam: <K extends keyof LiquidGlassParams>(key: K, value: LiquidGlassParams[K]) => void;
  setParams: (partial: Partial<LiquidGlassParams>) => void;
  resetParams: () => void;
};

/**
 * Reactive state for the Liquid Glass material, persisted to localStorage.
 * Defaults come from `DEFAULT_LIQUID_GLASS`; a future settings UI only
 * needs to call `setParam`/`setParams` — the persisted value then survives
 * reloads under the `liquid-glass-params` key.
 */
export const useLiquidGlassStore = create<LiquidGlassStore>()(
  persist(
    (set) => ({
      params: DEFAULT_LIQUID_GLASS,
      setParam: (key, value) => set((state) => ({ params: { ...state.params, [key]: value } })),
      setParams: (partial) => set((state) => ({ params: { ...state.params, ...partial } })),
      resetParams: () => set({ params: DEFAULT_LIQUID_GLASS }),
    }),
    {
      name: LIQUID_GLASS_STORAGE_KEY,
      // zustand's default merge shallow-replaces `params` wholesale with the
      // persisted object, so a visitor's older localStorage value (missing
      // fields like saturateDark/brightnessDark) would keep them `undefined`
      // forever — `applyLiquidGlassParams` writes that straight into CSS
      // custom properties, silently breaking every glass surface. Merging
      // against `DEFAULT_LIQUID_GLASS` here backfills any field the
      // persisted value doesn't have, on every load.
      merge: (persisted, current) => ({
        ...current,
        params: {
          ...DEFAULT_LIQUID_GLASS,
          ...(persisted as { params?: Partial<LiquidGlassParams> } | undefined)?.params,
        },
      }),
    },
  ),
);
