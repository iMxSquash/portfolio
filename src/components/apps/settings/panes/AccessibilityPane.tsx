"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { SettingsGroup } from "../controls/SettingsGroup";
import { SettingsRow } from "../controls/SettingsRow";
import { Toggle } from "../controls/Toggle";

/** Accessibilité: the three toggles `resolveGlassConfig`/`OS.tsx` react to directly. */
export function AccessibilityPane() {
  const accessibility = useSettingsStore((state) => state.accessibility);
  const updateAccessibility = useSettingsStore((state) => state.updateAccessibility);

  return (
    <SettingsGroup srOnlyTitle="Accessibilité">
      <SettingsRow
        label="Réduire la transparence"
        description="Rend les surfaces en verre presque opaques"
      >
        <Toggle
          label="Réduire la transparence"
          checked={accessibility.reduceTransparency}
          onChange={(reduceTransparency) => updateAccessibility({ reduceTransparency })}
        />
      </SettingsRow>
      <SettingsRow label="Réduire les animations">
        <Toggle
          label="Réduire les animations"
          checked={accessibility.reduceMotion}
          onChange={(reduceMotion) => updateAccessibility({ reduceMotion })}
        />
      </SettingsRow>
      <SettingsRow label="Augmenter le contraste">
        <Toggle
          label="Augmenter le contraste"
          checked={accessibility.increaseContrast}
          onChange={(increaseContrast) => updateAccessibility({ increaseContrast })}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}
