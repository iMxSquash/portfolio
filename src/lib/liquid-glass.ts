/**
 * Liquid Glass material — single source of truth for default parameters.
 *
 * These constants seed both the CSS custom properties consumed by the
 * `liquid-glass` Tailwind utilities (see `globals.css`) and the initial
 * state of `useLiquidGlassStore`. Never hardcode a glass value in a
 * component — read it from the store instead, which falls back to these
 * defaults and can later be overridden per-user (persisted to
 * localStorage via the store, see `src/stores/useLiquidGlassStore.ts`).
 *
 * The scale (radius, shadows, rim border) stays a static Tailwind design
 * token in `globals.css` — only the physical material knobs (tint,
 * saturation, brightness, blur elevation) are meant to be user-tunable.
 */

export type LiquidGlassParams = {
  /** Tint color channels, light mode, e.g. "255 255 255" */
  tint: string;
  /** Tint alpha, light mode, e.g. "12%" */
  tintAlpha: string;
  /** Tint color channels, dark mode */
  tintDark: string;
  /** Tint alpha, dark mode */
  tintAlphaDark: string;
  /** backdrop-filter saturate() */
  saturate: string;
  /** backdrop-filter brightness() */
  brightness: string;
  /** Blur elevation scale, subtle -> modal */
  blurSm: string;
  blur: string;
  blurLg: string;
  blurXl: string;
  /** Blur used by the high-transparency `clear` variant */
  blurClear: string;
};

/**
 * Default values. Keep in sync with the `:root` fallback declared in
 * `globals.css` (needed for a correct first paint before hydration).
 */
export const DEFAULT_LIQUID_GLASS: LiquidGlassParams = {
  tint: "255 255 255",
  tintAlpha: "12%",
  tintDark: "0 0 0",
  tintAlphaDark: "40%",
  saturate: "180%",
  brightness: "1.1",
  blurSm: "8px",
  blur: "16px",
  blurLg: "24px",
  blurXl: "40px",
  blurClear: "3px",
};

/** Maps each param to the CSS custom property it drives (declared in the `@theme` block of globals.css). */
export const LIQUID_GLASS_CSS_VARS: Record<keyof LiquidGlassParams, string> = {
  tint: "--glass-tint",
  tintAlpha: "--glass-tint-alpha",
  tintDark: "--glass-tint-dark",
  tintAlphaDark: "--glass-tint-alpha-dark",
  saturate: "--glass-saturate",
  brightness: "--glass-brightness",
  blurSm: "--blur-glass-sm",
  blur: "--blur-glass",
  blurLg: "--blur-glass-lg",
  blurXl: "--blur-glass-xl",
  blurClear: "--blur-glass-clear",
};

/** localStorage key used by the persisted `useLiquidGlassStore`. */
export const LIQUID_GLASS_STORAGE_KEY = "liquid-glass-params";

/** Writes params as CSS custom properties on the given element (defaults to `<html>`). */
export function applyLiquidGlassParams(
  params: LiquidGlassParams,
  target: HTMLElement = document.documentElement,
) {
  for (const key of Object.keys(params) as Array<keyof LiquidGlassParams>) {
    target.style.setProperty(LIQUID_GLASS_CSS_VARS[key], params[key]);
  }
}
