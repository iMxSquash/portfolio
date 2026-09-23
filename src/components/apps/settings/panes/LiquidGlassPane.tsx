"use client";

import { useState } from "react";
import Image from "next/image";
import { DOCK_GLASS } from "@/lib/glass-presets";
import {
  BLUR_SCALE_RANGE,
  REFRACTION_SCALE_RANGE,
  TINT_INTENSITY_RANGE,
  type GlassQuality,
  type GlassStyle,
} from "@/lib/settings";
import { useLiquidGlass } from "@/lib/use-liquid-glass";
import { getDefaultWallpaper, getWallpaper } from "@/lib/wallpapers";
import { useOSStore } from "@/stores/useOSStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useWallpaperStore } from "@/stores/useWallpaperStore";
import { SegmentedControl } from "../controls/SegmentedControl";
import { SettingsGroup } from "../controls/SettingsGroup";
import { SettingsRow } from "../controls/SettingsRow";
import { SettingsSecondaryButton } from "../controls/SettingsSecondaryButton";
import { SettingsSlider } from "../controls/SettingsSlider";
import { Toggle } from "../controls/Toggle";

const STYLE_OPTIONS: Array<{ value: GlassStyle; label: string }> = [
  { value: "clear", label: "Clair" },
  { value: "tinted", label: "Teinté" },
];

const QUALITY_OPTIONS: Array<{ value: GlassQuality; label: string }> = [
  { value: "high", label: "Élevée" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Faible" },
];

function formatScalePercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Liquid Glass, the flagship pane: every control here maps straight to a
 * `GlassSettings` field, resolved everywhere through `resolveGlassConfig`
 * (see `glass-settings.ts`) — no bespoke preview-only config.
 */
export function LiquidGlassPane() {
  const glass = useSettingsStore((state) => state.glass);
  const updateGlass = useSettingsStore((state) => state.updateGlass);
  const resetSection = useSettingsStore((state) => state.resetSection);
  // Whichever OS's wallpaper is actually on screen behind this preview
  // (see WallpaperPane.tsx: the pane is reachable from both SettingsView
  // and SettingsMobile).
  const os = useOSStore((state) => state.mode);
  const wallpaperId = useWallpaperStore((state) => state.selected[os]);
  const wallpaper = getWallpaper(wallpaperId) ?? getDefaultWallpaper(os);

  const [previewEl, setPreviewEl] = useState<HTMLDivElement | null>(null);
  // Same preset family as the Dock — the live preview reacts to every
  // setting below through the same `resolveGlassConfig` integration point
  // every other glass surface in the OS goes through.
  useLiquidGlass(previewEl, DOCK_GLASS);

  return (
    <div>
      <SettingsGroup srOnlyTitle="Aperçu">
        <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-[10px]">
          <Image src={wallpaper.src} alt="" fill sizes="400px" className="object-cover" />
          <div ref={setPreviewEl} className="relative h-14 w-14" />
        </div>
      </SettingsGroup>

      <SettingsGroup srOnlyTitle="Style">
        <SettingsRow label="Style">
          <SegmentedControl
            ariaLabel="Style du Liquid Glass"
            value={glass.style}
            options={STYLE_OPTIONS}
            onChange={(style) => updateGlass({ style })}
          />
        </SettingsRow>
        {glass.style === "tinted" ? (
          <SettingsRow label="Intensité de la teinte" controlId="glass-tint-intensity">
            <SettingsSlider
              id="glass-tint-intensity"
              label="Intensité de la teinte"
              value={glass.tintIntensity}
              range={TINT_INTENSITY_RANGE}
              formatValue={formatScalePercent}
              onCommit={(tintIntensity) => updateGlass({ tintIntensity })}
            />
          </SettingsRow>
        ) : null}
      </SettingsGroup>

      <SettingsGroup srOnlyTitle="Flou et réfraction">
        <SettingsRow label="Intensité du flou" controlId="glass-blur-scale">
          <SettingsSlider
            id="glass-blur-scale"
            label="Intensité du flou"
            value={glass.blurScale}
            range={BLUR_SCALE_RANGE}
            formatValue={formatScalePercent}
            onCommit={(blurScale) => updateGlass({ blurScale })}
          />
        </SettingsRow>
        <SettingsRow label="Réfraction" controlId="glass-refraction-scale">
          <SettingsSlider
            id="glass-refraction-scale"
            label="Réfraction"
            value={glass.refractionScale}
            range={REFRACTION_SCALE_RANGE}
            formatValue={formatScalePercent}
            onCommit={(refractionScale) => updateGlass({ refractionScale })}
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup srOnlyTitle="Effets">
        <SettingsRow label="Aberration chromatique" description="Dock et Spotlight uniquement">
          <Toggle
            label="Aberration chromatique"
            checked={glass.chromaticAberration}
            onChange={(chromaticAberration) => updateGlass({ chromaticAberration })}
          />
        </SettingsRow>
        <SettingsRow label="Éclairage dynamique">
          <Toggle
            label="Éclairage dynamique"
            checked={glass.dynamicLighting}
            onChange={(dynamicLighting) => updateGlass({ dynamicLighting })}
          />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup
        srOnlyTitle="Qualité de rendu"
        helpText="Faible réduit l'impact sur les performances, au prix d'un flou moins détaillé."
      >
        <SettingsRow label="Qualité de rendu">
          <SegmentedControl
            ariaLabel="Qualité de rendu du Liquid Glass"
            value={glass.quality}
            options={QUALITY_OPTIONS}
            onChange={(quality) => updateGlass({ quality })}
          />
        </SettingsRow>
      </SettingsGroup>

      <div className="flex justify-end px-1">
        <SettingsSecondaryButton onClick={() => resetSection("glass")}>
          Réinitialiser le Liquid Glass
        </SettingsSecondaryButton>
      </div>
    </div>
  );
}
