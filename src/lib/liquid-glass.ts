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

/** Lens shape for the SVG refraction chain — see `liquid-glass-refraction.ts`. */
export type LiquidGlassRefractionMode = "diagonal" | "symmetric";

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
  /**
   * Dark-mode backdrop-filter saturate()/brightness() — distinct from the
   * light-mode pair above. Real macOS in dark mode *dims* the backdrop it
   * blurs (a gray material, not a bright one); the light-mode values stay
   * tuned for the opposite direction, so a single shared pair can't serve
   * both without one of the two modes looking wrong.
   */
  saturateDark: string;
  brightnessDark: string;
  /** Blur elevation scale, subtle -> modal */
  blurSm: string;
  blur: string;
  blurLg: string;
  blurXl: string;
  /** Blur used by the high-transparency `clear` variant */
  blurClear: string;
  /** CSS blur inside the SVG refraction chain — distinct from `blurClear`, displacement does most of the frosting there. */
  blurRefract: string;
  /**
   * SVG refraction tuning (Chromium only; every other engine keeps the plain
   * blur+saturate fallback above). Applied per-element by
   * `useLiquidGlassRefraction`, not pushed to `:root` like the rest of this
   * object — see `LIQUID_GLASS_CSS_VARS` and `liquid-glass-refraction.ts`.
   */
  refractScale: number;
  /** Per-channel scale spread driving the chromatic-aberration fringes; 0 disables it. */
  refractAberration: number;
  refractMode: LiquidGlassRefractionMode;
  /** Tint alpha specifically for refracting surfaces — lower than the base `tintAlpha` so the displacement reads clearly instead of being muddied by a denser tint. Also per-element, not `:root`. */
  refractTintAlpha: string;
};

/**
 * Default values. Keep in sync with the `:root` fallback declared in
 * `globals.css` (needed for a correct first paint before hydration).
 */
export const DEFAULT_LIQUID_GLASS: LiquidGlassParams = {
  tint: "255 255 255",
  tintAlpha: "12%",
  // A clean gray, not black: verified against a real macOS Finder screenshot
  // (sidebar sampled at ~rgb(23,31,33)) — the dark material tints its own
  // gray onto the backdrop, it doesn't just darken it toward black.
  tintDark: "38 40 42",
  tintAlphaDark: "52%",
  saturate: "180%",
  brightness: "1.1",
  saturateDark: "140%",
  brightnessDark: "0.9",
  blurSm: "8px",
  blur: "16px",
  blurLg: "24px",
  blurXl: "40px",
  blurClear: "3px",
  blurRefract: "3px",
  refractScale: -140,
  refractAberration: 14,
  refractMode: "diagonal",
  refractTintAlpha: "4%",
};

/**
 * Maps each `:root`-driven param to the CSS custom property it drives
 * (declared in the `@theme` block of globals.css). The four `refract*`
 * knobs are deliberately absent — they're consumed directly as JS options /
 * per-element style overrides by refracting components, never pushed
 * globally (see `LiquidGlassParams`).
 */
export const LIQUID_GLASS_CSS_VARS: Partial<Record<keyof LiquidGlassParams, string>> = {
  tint: "--glass-tint",
  tintAlpha: "--glass-tint-alpha",
  tintDark: "--glass-tint-dark",
  tintAlphaDark: "--glass-tint-alpha-dark",
  saturate: "--glass-saturate",
  brightness: "--glass-brightness",
  saturateDark: "--glass-saturate-dark",
  brightnessDark: "--glass-brightness-dark",
  blurSm: "--blur-glass-sm",
  blur: "--blur-glass",
  blurLg: "--blur-glass-lg",
  blurXl: "--blur-glass-xl",
  blurClear: "--blur-glass-clear",
  blurRefract: "--glass-blur-refract",
};

/** localStorage key used by the persisted `useLiquidGlassStore`. */
export const LIQUID_GLASS_STORAGE_KEY = "liquid-glass-params";

/**
 * Finder's sidebar (per apple-design skill: Materials — Color) is a large
 * navigation surface, so it goes more opaque than the base `liquid-glass`
 * default to stay legible over the file grid, and uses the `xl` blur
 * elevation (real macOS shows a fully smooth gradient, no visible wallpaper
 * structure through it) plus a very subtle `--glass-edge-bleed` so the
 * blurred backdrop reads slightly denser near the sidebar's edges/top third
 * than at its center — verified against a real Finder screenshot, not
 * guessed. See `glass-edge-bleed` in globals.css for the mechanism.
 */
export const FINDER_SIDEBAR_MATERIAL: Record<string, string> = {
  "--glass-tint": "246 246 248",
  "--glass-tint-alpha": "58%",
  "--glass-tint-alpha-dark": "54%",
  "--blur-glass": "var(--blur-glass-xl)",
  "--glass-edge-bleed": "8%",
};

/** Writes params as CSS custom properties on the given element (defaults to `<html>`). */
export function applyLiquidGlassParams(
  params: LiquidGlassParams,
  target: HTMLElement = document.documentElement,
) {
  for (const key of Object.keys(params) as Array<keyof LiquidGlassParams>) {
    const cssVar = LIQUID_GLASS_CSS_VARS[key];
    if (!cssVar) continue;
    target.style.setProperty(cssVar, String(params[key]));
  }
}
