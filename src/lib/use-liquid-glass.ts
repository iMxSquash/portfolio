"use client";

import { useEffect, useMemo, useRef } from "react";
import { LiquidGlassEngine, type LiquidGlassConfig } from "quick-liquid";
import { useShallow } from "zustand/react/shallow";
import { resolveGlassConfig } from "@/lib/glass-settings";
import { useReduceMotion } from "@/lib/use-reduce-motion";
import { useSettingsStore } from "@/stores/useSettingsStore";
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
 * Also threads the user's Réglages Système glass/accessibility preferences
 * (`useSettingsStore`) through `resolveGlassConfig` (see `glass-settings.ts`)
 * before the config ever reaches the engine: the one integration point
 * between `glass-presets.ts`'s role presets and the user's own settings, so
 * no consumer of this hook needs to know the settings layer exists.
 *
 * `LiquidGlassEngine`'s own constructor already applies the config passed to
 * it, so the mount effect below never needs a same-commit `setConfig` call
 * to "catch up". The sync effect below still unconditionally calls
 * `setConfig` on every dep change regardless: `setConfig` diffs against its
 * own previous config and no-ops immediately when nothing changed, so
 * calling it right after construction is harmless. A previous version tried
 * to skip that redundant call with an `isInitialMount` ref set by the mount
 * effect — but for a host that starts `null` (`useState` + callback ref,
 * required below since `el` is a value, not a stable ref object), the mount
 * and sync effects land in different commits: the sync effect runs once on
 * the `null`-host render and flips the ref to `false`, then the mount
 * effect runs on the next commit (once the node exists) and flips it back
 * to `true` without the sync effect running again in that same commit. The
 * next real config/appearance change then read a stale `true` and skipped
 * its `setConfig` call, silently swallowing the first update after every
 * mount (e.g. the first theme toggle, or Spotlight's first pill/card
 * morph) until a second change flipped the ref back to `false`.
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
  // Single shallow-compared selector rather than two separate subscriptions —
  // this hook mounts on every glass surface in the app (Dock, Spotlight,
  // every window, sidebar, menu, tooltip), so halving the subscription count
  // here is a real, cheap win.
  const { glass, accessibility } = useSettingsStore(
    useShallow((state) => ({ glass: state.glass, accessibility: state.accessibility })),
  );
  const reduceMotion = useReduceMotion();
  const resolvedConfig = useMemo(
    () => resolveGlassConfig(config, glass, { ...accessibility, reduceMotion }),
    [config, glass, accessibility, reduceMotion],
  );
  const engineRef = useRef<LiquidGlassEngine | null>(null);

  useEffect(() => {
    if (!el) return;
    const engine = new LiquidGlassEngine(el, { ...resolvedConfig, appearance });
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
    engineRef.current?.setConfig({ ...resolvedConfig, appearance });
  }, [resolvedConfig, appearance]);
}
