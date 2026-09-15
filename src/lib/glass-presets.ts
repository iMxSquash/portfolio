/**
 * Liquid Glass material presets — single source of truth for every glass
 * surface in the app, built from the apple-design skill's Component →
 * Config Mapping table (see
 * `.claude/skills/apple-design/references/web-liquid-glass.md`).
 *
 * Rendering is `quick-liquid`'s `LiquidGlassEngine` (see
 * `src/lib/use-liquid-glass.ts`) — never hardcode a bespoke
 * `LiquidGlassConfig` object inline in a component, add a role here
 * instead.
 */

import type { LiquidGlassConfig } from "quick-liquid";

/**
 * Shared base every preset spreads first, then overrides:
 * - `chromaticAberration` defaults to a non-zero value inside quick-liquid's
 *   own `DEFAULT_CONFIG` (0.18) — 0 here, and only the ~2 chromatic-
 *   aberration budget slots per viewport (Dock, Spotlight) opt back in.
 * - `specularStrength` (the bezel sheen / surface reflection) stays 0 on
 *   every preset, no exceptions — no surface reflection anywhere in the
 *   app, per project decision.
 */
const GLASS_DEFAULTS = {
  chromaticAberration: 0,
  specularStrength: 0,
  edgeHighlight: 0.1,
} as const satisfies Partial<LiquidGlassConfig>;

/** Compact full-width bar (window title bar, "standard" windowStyle apps): flat chrome, no lens, square corners. */
export const TITLE_BAR_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "thin",
  refractionStrength: 5,
  chromaticAberration: 5,
  borderRadius: 0,
};

/**
 * Inactive title bars go quieter than the focused tint — real macOS dims an
 * unfocused window's chrome without hiding the material entirely (see
 * apple-design skill: window chrome stays a layered, translucent surface
 * even when unfocused).
 */
export const TITLE_BAR_GLASS_INACTIVE: Partial<LiquidGlassConfig> = {
  ...TITLE_BAR_GLASS,
  tintOpacity: 0.025,
};

/**
 * Radius (px) the Dock renders at — a floating regular-glass control, picked
 * up off the desktop. Deliberately rounder than the (unused) legacy
 * `--radius-dock: 20px` Tailwind token in globals.css: quick-liquid's own
 * rendering is the visual reference now (see the migration's project
 * decision to fully adopt its look), not that pre-existing, never-consumed
 * value.
 */
export const DOCK_BORDER_RADIUS = 21;

/**
 * Dock: the canonical floating regular-glass control. One of the ~2
 * elements per viewport allowed real chromatic aberration (the old
 * hand-rolled system deliberately spent its aberration budget here too) —
 * `refractionStrength` stays at the `regular` preset default.
 */
export const DOCK_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "regular",
  borderRadius: DOCK_BORDER_RADIUS,
  dynamicLighting: true,
  chromaticAberration: 0.25,
};

/** Radii (px) Spotlight switches between as it morphs from an idle pill to a results card. */
export const SPOTLIGHT_PILL_RADIUS = 999;
export const SPOTLIGHT_CARD_RADIUS = 24;

/**
 * Spotlight: floats over the desktop and must stay legible with typed text,
 * so it errs more opaque than a generic card (`thick`). The other budget
 * partner for real chromatic aberration alongside the Dock.
 */
export const SPOTLIGHT_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "clear",
  refractionStrength: 35,
  chromaticAberration: 0.5,
  blur: 7.5,
  tint: "255, 255, 255",
  tintOpacity: 0.3,
  saturation: 1.2,
  borderRadius: SPOTLIGHT_PILL_RADIUS,
  dynamicLighting: true,
  edgeHighlight: 0.1,
  cursorTracking: true,
  bezelWidth: 10,
  edgeDistortion: 20,
};

/**
 * Full-height sidebar chrome for Finder and Notes: verified against a real
 * macOS Finder screenshot to be flat window chrome with no lens (see
 * portfolio CLAUDE.md); Notes' sidebar was aligned to the same flat-chrome
 * treatment as an explicit project decision rather than its own macOS
 * capture. Do not extend this preset to other sidebars without equivalent
 * verification. `tintOpacity: 1` makes the sidebar read as the exact same
 * flat material as the content pane it sits beside, rather than a glass
 * surface revealing the blurred desktop behind it.
 */
export const SIDEBAR_CHROME_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "regular",
  refractionStrength: 0,
  blur: 32,
  saturation: 1.1,
  tintOpacity: 1,
  borderRadius: 0,
  elevation: 0,
  edgeHighlight: 0,
};

/**
 * `tint` for `SIDEBAR_CHROME_GLASS`, matching `--window-canvas` in
 * globals.css exactly so the sidebar and the content pane read as one
 * continuous surface. `LiquidGlassConfig.tint` is a static value (no
 * light/dark switching of its own outside quick-liquid's built-in default),
 * so the caller picks one of these based on `useIsDarkMode()` — see
 * `FinderView.tsx` and `Notes.tsx`. Keep in sync with `--window-canvas` by
 * hand if that value ever changes.
 */
export const SIDEBAR_CHROME_TINT_LIGHT = "255, 255, 255";
export const SIDEBAR_CHROME_TINT_DARK = "30, 31, 32";

/** Finder toolbar clusters (back/forward group, view-mode toggle group): actionable pill controls. */
export const FINDER_TOOLBAR_CLUSTER_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "thin",
  borderRadius: 8,
  elevation: 0.1,
  edgeHighlight: 0,
};

/**
 * Menu bar dropdown panels (MenuBarButton's popover, DesktopContextMenu,
 * WallpaperPicker): compact, transient, closer to a control than a panel.
 */
export const MENU_POPOVER_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "thin",
  borderRadius: 8,
};

/** Dock icon tooltip label bubble. */
export const DOCK_TOOLTIP_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "thin",
  borderRadius: 6,
};
