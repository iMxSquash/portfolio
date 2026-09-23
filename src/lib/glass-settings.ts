import { DEFAULT_CONFIG, MATERIAL_PRESETS, type LiquidGlassConfig } from "quick-liquid";
import type { AccessibilitySettings, GlassSettings } from "@/lib/settings";

/**
 * User Liquid Glass preferences layered on top of `glass-presets.ts`'s role
 * presets — the single integration point consumed by `useLiquidGlass`.
 * `glass-presets.ts` stays the only source of truth for a role's base
 * `LiquidGlassConfig`; this module only ever multiplies/overrides a copy of
 * it, never edits or duplicates a preset. Distinct from (and unrelated to)
 * `quick-liquid`'s own internal, unexported `resolveGlassConfig` helper.
 */

/**
 * "Teinté" style (macOS 26.1's Liquid Glass variant): raises a surface's tint
 * opacity so it reads as less see-through, the `glass.tintIntensity` slider
 * interpolating between the preset's own opacity (0, no change from
 * `"clear"`) and this ceiling (1, fully tinted). Skipped for a preset whose
 * `tintOpacity` is already 1 (the flat sidebar chrome, see
 * `SIDEBAR_CHROME_GLASS`) so the sidebar/content continuity isn't broken.
 */
const TINTED_STYLE_MAX_OPACITY = 0.45;

/** "Réduire la transparence": makes eligible surfaces read as nearly opaque, like the macOS accessibility setting of the same name. */
const REDUCED_TRANSPARENCY_TINT_OPACITY = 0.9;

function isAlreadyOpaque(tintOpacity: number | undefined): boolean {
  return tintOpacity === 1;
}

/**
 * A preset's own `blur`/`refractionStrength` when it sets one, otherwise the
 * value its `material` preset (or quick-liquid's own defaults) would
 * contribute — mirrors the merge quick-liquid's engine performs internally,
 * so scaling stays relative to what would actually render.
 */
function resolveBaseValue(
  preset: Partial<LiquidGlassConfig>,
  key: "blur" | "refractionStrength",
): number {
  const ownValue = preset[key];
  if (ownValue !== undefined) return ownValue;
  const materialValue = preset.material ? MATERIAL_PRESETS[preset.material]?.[key] : undefined;
  return materialValue ?? DEFAULT_CONFIG[key];
}

/**
 * Applies the user's `GlassSettings`/`AccessibilitySettings` on top of a role
 * preset from `glass-presets.ts`. Never touches `borderRadius`,
 * `specularStrength` (stays 0 everywhere, no exceptions — project decision)
 * or `tint` (theme-dependent, resolved by the caller).
 */
export function resolveGlassConfig(
  preset: Partial<LiquidGlassConfig>,
  glass: GlassSettings,
  accessibility: AccessibilitySettings,
): Partial<LiquidGlassConfig> {
  const config: Partial<LiquidGlassConfig> = { ...preset };
  const baseTintOpacity = preset.tintOpacity ?? DEFAULT_CONFIG.tintOpacity;

  config.blur = resolveBaseValue(preset, "blur") * glass.blurScale;
  config.refractionStrength =
    resolveBaseValue(preset, "refractionStrength") * glass.refractionScale;

  if (glass.style === "tinted" && !isAlreadyOpaque(baseTintOpacity)) {
    config.tintOpacity =
      baseTintOpacity + (TINTED_STYLE_MAX_OPACITY - baseTintOpacity) * glass.tintIntensity;
  }

  // Off only ever clears aberration on the presets that already have it — never adds it.
  if (!glass.chromaticAberration) {
    config.chromaticAberration = 0;
  }

  if (!glass.dynamicLighting) {
    config.dynamicLighting = false;
    config.cursorTracking = false;
    config.hoverLighting = false;
  }

  config.quality = glass.quality;

  if (accessibility.reduceTransparency && !isAlreadyOpaque(baseTintOpacity)) {
    config.tintOpacity = REDUCED_TRANSPARENCY_TINT_OPACITY;
    config.refractionStrength = 0;
    config.chromaticAberration = 0;
  }

  if (accessibility.reduceMotion) {
    config.parallax = false;
    config.inertia = false;
  }

  return config;
}
