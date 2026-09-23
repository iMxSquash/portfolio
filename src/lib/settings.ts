import { DOCK_ICON_MAGNIFIED_SIZE, DOCK_ICON_REST_SIZE } from "@/lib/dock";

/**
 * "Réglages Système" data model — persisted in `useSettingsStore` and applied
 * across the OS through a handful of well-defined integration points (see
 * `resolveGlassConfig` in `glass-settings.ts`, `Dock.tsx`, `sounds.ts`,
 * `OS.tsx`, `ThemeProvider.tsx`). `glass-presets.ts` stays the only source of
 * truth for the base `LiquidGlassConfig` per role — these are user-controlled
 * modifiers layered on top, never a duplicate config.
 */

export type GlassStyle = "clear" | "tinted";
export type GlassQuality = "high" | "medium" | "low";

export type GlassSettings = {
  style: GlassStyle;
  /**
   * How far `style: "tinted"` pushes a surface's tint opacity toward opaque,
   * from 0 (no change from `"clear"`) to 1 (`TINTED_STYLE_MAX_OPACITY`, see
   * `resolveGlassConfig`). Ignored when `style` is `"clear"`.
   */
  tintIntensity: number;
  /** Multiplies every surface's base `blur` (see `resolveGlassConfig`). */
  blurScale: number;
  /** Multiplies every surface's base `refractionStrength`. */
  refractionScale: number;
  /** Off only ever removes aberration from the few presets that already have it (Dock, Spotlight) — never adds it elsewhere. */
  chromaticAberration: boolean;
  dynamicLighting: boolean;
  quality: GlassQuality;
};

export type AccessibilitySettings = {
  reduceTransparency: boolean;
  reduceMotion: boolean;
  increaseContrast: boolean;
};

export type DockSettings = {
  iconSize: number;
  magnification: boolean;
  magnifiedSize: number;
};

export type SoundSettings = {
  systemSoundsEnabled: boolean;
  /** 0 (silent) to 1 (full), multiplies each sound recipe's own note volume. */
  volume: number;
};

/** macOS accent palette order: Multicolore (no override) then the 8 named accents. */
export type AccentColor =
  "multicolor" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green" | "graphite";

export type AppearanceSettings = {
  accentColor: AccentColor;
};

export type SettingsState = {
  glass: GlassSettings;
  accessibility: AccessibilitySettings;
  dock: DockSettings;
  sound: SoundSettings;
  appearance: AppearanceSettings;
};

export type SliderRange = { min: number; max: number; step: number };

export const TINT_INTENSITY_RANGE: SliderRange = { min: 0, max: 1, step: 0.05 };
export const BLUR_SCALE_RANGE: SliderRange = { min: 0.5, max: 1.5, step: 0.05 };
export const REFRACTION_SCALE_RANGE: SliderRange = { min: 0, max: 2, step: 0.1 };
export const DOCK_ICON_SIZE_RANGE: SliderRange = { min: 32, max: 64, step: 1 };
export const DOCK_MAGNIFIED_SIZE_RANGE: SliderRange = { min: 64, max: 128, step: 1 };
export const SOUND_VOLUME_RANGE: SliderRange = { min: 0, max: 1, step: 0.05 };

export const SETTINGS_STORAGE_KEY = "system-settings";
export const SETTINGS_VERSION = 1;

/** `src/lib/dock.ts`'s existing rest/magnified sizes double as the dock settings defaults — no second definition. */
export const DEFAULT_SETTINGS: SettingsState = {
  glass: {
    style: "clear",
    tintIntensity: 0.5,
    blurScale: 1,
    refractionScale: 1,
    chromaticAberration: true,
    dynamicLighting: true,
    quality: "high",
  },
  accessibility: {
    reduceTransparency: false,
    reduceMotion: false,
    increaseContrast: false,
  },
  dock: {
    iconSize: DOCK_ICON_REST_SIZE,
    magnification: true,
    magnifiedSize: DOCK_ICON_MAGNIFIED_SIZE,
  },
  sound: {
    systemSoundsEnabled: true,
    volume: 0.7,
  },
  appearance: {
    accentColor: "multicolor",
  },
};

export type AccentColorOption = {
  id: AccentColor;
  label: string;
  swatchLight: string;
  swatchDark: string;
};

/**
 * Approximated macOS accent hues (recreated, not traced from Apple assets —
 * same approach as the SVG icons and system sounds, see os-macos-ui skill).
 * "Multicolore" carries no swatch override: it's the default `--system-blue`
 * already defined in globals.css, same as "Bleu" — both render identically.
 * The light-mode "Jaune" value is deliberately darkened well past a faithful
 * system yellow (which fails contrast outright): plain text set in accent
 * color (e.g. a selected sidebar row) must still clear WCAG AA's 4.5:1 body
 * text ratio against a near-white background.
 */
export const ACCENT_COLORS: AccentColorOption[] = [
  { id: "multicolor", label: "Multicolore", swatchLight: "#007aff", swatchDark: "#0a84ff" },
  { id: "blue", label: "Bleu", swatchLight: "#007aff", swatchDark: "#0a84ff" },
  { id: "purple", label: "Violet", swatchLight: "#8944ab", swatchDark: "#bf5af2" },
  { id: "pink", label: "Rose", swatchLight: "#d30f65", swatchDark: "#ff375f" },
  { id: "red", label: "Rouge", swatchLight: "#d70015", swatchDark: "#ff453a" },
  { id: "orange", label: "Orange", swatchLight: "#c93400", swatchDark: "#ff9f0a" },
  { id: "yellow", label: "Jaune", swatchLight: "#8a6a00", swatchDark: "#ffd60a" },
  { id: "green", label: "Vert", swatchLight: "#1f7a1f", swatchDark: "#32d74b" },
  { id: "graphite", label: "Graphite", swatchLight: "#6e6e73", swatchDark: "#98989d" },
];

export function getAccentColorOption(id: AccentColor): AccentColorOption {
  const option = ACCENT_COLORS.find((accent) => accent.id === id);
  if (!option) {
    throw new Error(`Unknown accent color "${id}"`);
  }
  return option;
}
