"use client";

import { useEffect, useRef } from "react";
import {
  attachLiquidGlassRefraction,
  type LiquidGlassRefractionController,
  type LiquidGlassRefractionOptions,
} from "./liquid-glass-refraction";

/**
 * React binding for `attachLiquidGlassRefraction`. Attaches once per mount
 * (creating/destroying the SVG filter is expensive — see the skill's
 * performance budget), then pushes scale/aberration/mode changes through
 * the controller's `update()` instead of re-attaching.
 *
 * Takes the DOM node itself (from `useState` + a callback ref), not a plain
 * `useRef` object — some callers (e.g. Dock) render `null` until their
 * content exists, and a plain ref's `.current` becoming non-null later
 * doesn't re-run an effect keyed on the stable ref object. Keying on the
 * element value itself re-attaches exactly when the node actually mounts.
 *
 * `rebuildKey` forces a rebuild on demand for changes the controller can't
 * detect on its own — a border-radius change (e.g. Spotlight's pill ↔ card
 * shape) doesn't fire the internal ResizeObserver, since the element's
 * width/height haven't moved.
 */
export function useLiquidGlassRefraction(
  el: HTMLElement | null,
  { scale, aberration, mode }: LiquidGlassRefractionOptions,
  rebuildKey?: unknown,
) {
  const controllerRef = useRef<LiquidGlassRefractionController | null>(null);

  useEffect(() => {
    if (!el) return;
    controllerRef.current = attachLiquidGlassRefraction(el, { scale, aberration, mode });
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- attach once per mount; param changes go through .update() below
  }, [el]);

  useEffect(() => {
    controllerRef.current?.update({ scale, aberration, mode });
  }, [scale, aberration, mode]);

  useEffect(() => {
    // rebuildKey is an opaque trigger, not a value the rebuild itself reads.
    controllerRef.current?.update();
  }, [rebuildKey]);
}
