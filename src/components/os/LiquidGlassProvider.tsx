"use client";

import { useEffect } from "react";
import { applyLiquidGlassParams } from "@/lib/liquid-glass";
import { useLiquidGlassStore } from "@/stores/useLiquidGlassStore";

/**
 * Syncs `useLiquidGlassStore` (defaults + any user override persisted in
 * localStorage) to the CSS custom properties consumed by the
 * `liquid-glass` Tailwind utilities. Mount once near the app root.
 */
export function LiquidGlassProvider() {
  const params = useLiquidGlassStore((state) => state.params);

  useEffect(() => {
    applyLiquidGlassParams(params);
  }, [params]);

  return null;
}
