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
} as const satisfies Partial<LiquidGlassConfig>;

/** Compact full-width bar (window title bar, Trash header row): flat chrome, no lens, square corners. */
export const TITLE_BAR_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "thin",
  refractionStrength: 0,
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
export const DOCK_BORDER_RADIUS = 30;

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
  material: "thick",
  chromaticAberration: 0.25,
};

/**
 * Finder sidebar: full-height chrome carrying the traffic lights, verified
 * against a real macOS Finder screenshot to be flat window chrome with no
 * lens (see portfolio CLAUDE.md — do not generalize this exception to other
 * sidebars). Goes more opaque than a normal `regular` surface and uses a
 * high blur elevation to stay legible over the file grid.
 */
export const FINDER_SIDEBAR_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "regular",
  refractionStrength: 0,
  blur: 32,
  tintOpacity: 0.2,
  borderRadius: 0,
};

/**
 * Notes sidebar: an ordinary actionable nav surface, not the Finder
 * exception above — refraction stays on at the preset default, aberration
 * stays 0 (Dock + Spotlight already spend that budget). Denser tint than
 * the base `regular` default to stay legible over the scrolling note list.
 */
export const NOTES_SIDEBAR_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "regular",
  tintOpacity: 0.16,
  borderRadius: 0,
};

/** Finder toolbar clusters (back/forward group, view-mode toggle group): actionable pill controls. */
export const FINDER_TOOLBAR_CLUSTER_GLASS: Partial<LiquidGlassConfig> = {
  ...GLASS_DEFAULTS,
  material: "thin",
  borderRadius: 8,
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
