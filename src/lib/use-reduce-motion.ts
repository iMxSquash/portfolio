"use client";

import { useMediaQuery } from "@/lib/use-media-query";
import { useSettingsStore } from "@/stores/useSettingsStore";

const PREFERS_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether animations should be reduced: the OS's own `prefers-reduced-motion`
 * preference, or the "Réduire les animations" accessibility setting
 * (`useSettingsStore`) — either one is enough.
 *
 * Every call site that needs this reads it through here rather than
 * framer-motion's own `useReducedMotion()`: that hook only reads the OS
 * preference once at mount and never consults `MotionConfig`'s
 * `reducedMotion` context, so wrapping the app in `<MotionConfig>` (see
 * `OS.tsx`) has no effect on it at all — the in-app setting would silently
 * do nothing.
 */
export function useReduceMotion(): boolean {
  const prefersReducedMotion = useMediaQuery(PREFERS_REDUCED_MOTION_QUERY);
  const settingReduceMotion = useSettingsStore((state) => state.accessibility.reduceMotion);
  return prefersReducedMotion || settingReduceMotion;
}
