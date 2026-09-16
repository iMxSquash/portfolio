"use client";

import { useEffect, useRef } from "react";
import { LiquidGlassEngine, type LiquidGlassConfig } from "quick-liquid";
import { useThemeStore } from "@/stores/useThemeStore";

type UseLiquidGlassOptions = {
  /**
   * `LiquidGlassEngine.mount()` unconditionally forces `overflow: hidden` on
   * the host — not part of `LiquidGlassConfig`, so it can't be requested
   * through `config`. Pass `"visible"` here for a host whose content must
   * pop outside the glass bounds (e.g. the Dock's magnified icons). Applied
   * once, right after construction; `setConfig` never touches `overflow`
   * again afterwards, so there's nothing to re-apply on updates.
   */
  overflow?: "visible";
};

/**
 * React binding for quick-liquid's vanilla `LiquidGlassEngine`. Takes the
 * DOM node itself (from `useState` + a callback ref), not a plain `useRef`
 * object — some callers (e.g. Dock) render `null` until their content
 * exists, and a plain ref's `.current` becoming non-null later doesn't
 * re-run an effect keyed on the stable ref object. Keying on the element
 * value itself re-attaches exactly when the node actually mounts.
 *
 * The engine is constructed once per mount (building its SVG displacement
 * map is expensive) and kept in sync via `engine.setConfig()` afterwards —
 * `setConfig` diffs against the previous config and only rebuilds what
 * actually changed (e.g. a `borderRadius`-only change still triggers a full
 * geometry rebuild internally), so a caller that needs to react to a shape
 * change (Spotlight's pill ↔ card morph) just needs to pass a new `config`
 * object — no separate rebuild escape hatch required.
 *
 * Threads the app's manually-toggled dark mode (`useThemeStore`) into
 * `appearance`: quick-liquid's own dark-mode detection only looks at the OS
 * `prefers-color-scheme` media query, which doesn't know about this app's
 * `.dark` class override (see ThemeProvider.tsx). `"system"` mode maps to
 * `appearance: "auto"`, which is exactly that OS-level check, so it stays
 * reactive to system theme changes without any extra listener here.
 *
 * `LiquidGlassEngine`'s own constructor already applies the config passed to
 * it, so the mount effect below never needs a same-commit `setConfig` call
 * to "catch up" — the sync effect only exists for config/appearance changes
 * on subsequent renders, hence the `isInitialMount` guard.
 *
 * **Host children invariant**: on mount, the engine reparents whatever
 * direct children the host element has into its own internal content layer
 * — so the host itself must never gain or lose a direct child afterwards,
 * or React is handed a stale parent to insert/remove against. A host whose
 * content can change shape (children mounting/unmounting conditionally,
 * e.g. Spotlight's results panel or Dock's minimized-icons list) needs one
 * stable wrapper `<div>` one level down that itself is never added/removed
 * — see Dock.tsx / Spotlight.tsx for the two call sites that need this.
 *
 * A host that lays out its (unchanging) children with `flex flex-col
 * items-center` and needs that restored one level down, on `.ql-content`
 * itself (the reparenting above otherwise leaves it a plain block, see
 * LoginScreen.tsx/LockScreen.tsx/LockCornerGesture.tsx), can spread
 * `QL_CONTENT_FLEX_COL_CENTER` into its own className. Add the host's own
 * `gap-*` there too (e.g. `` `${QL_CONTENT_FLEX_COL_CENTER} [&>.ql-content]:gap-4` ``)
 * — a `gap` on the host itself no longer does anything once it has only one
 * child (`.ql-content`).
 */
export const QL_CONTENT_FLEX_COL_CENTER =
  "[&>.ql-content]:flex [&>.ql-content]:flex-col [&>.ql-content]:items-center";

export function useLiquidGlass(
  el: HTMLElement | null,
  config: Partial<LiquidGlassConfig>,
  { overflow }: UseLiquidGlassOptions = {},
) {
  const mode = useThemeStore((state) => state.mode);
  const appearance = mode === "system" ? "auto" : mode;
  const engineRef = useRef<LiquidGlassEngine | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!el) return;
    isInitialMount.current = true;
    const engine = new LiquidGlassEngine(el, { ...config, appearance });
    engineRef.current = engine;
    // Mutated via `engine.getElement()`, not the `el` parameter itself — hook
    // arguments are treated as immutable (see the lint rule this trips), and
    // this is the engine's own public accessor for its host, not an alias of
    // the parameter.
    if (overflow) engine.getElement().style.overflow = overflow;
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- attach once per mount; config/appearance changes go through setConfig below
  }, [el]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    engineRef.current?.setConfig({ ...config, appearance });
  }, [config, appearance]);
}
