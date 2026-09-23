"use client";

import { DOCK_ICON_SIZE_RANGE, DOCK_MAGNIFIED_SIZE_RANGE } from "@/lib/settings";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { SettingsGroup } from "../controls/SettingsGroup";
import { SettingsRow } from "../controls/SettingsRow";
import { SettingsSlider } from "../controls/SettingsSlider";
import { Toggle } from "../controls/Toggle";

function formatPixels(value: number): string {
  return `${Math.round(value)}px`;
}

/** Bureau et Dock: `Dock.tsx`/`DockIcon.tsx` read `useSettingsStore().dock` directly, see os-macos-ui skill. */
export function DesktopAndDockPane() {
  const dock = useSettingsStore((state) => state.dock);
  const updateDock = useSettingsStore((state) => state.updateDock);

  return (
    <SettingsGroup srOnlyTitle="Bureau et Dock">
      <SettingsRow label="Taille des icônes" controlId="dock-icon-size">
        <SettingsSlider
          id="dock-icon-size"
          label="Taille des icônes du Dock"
          value={dock.iconSize}
          range={DOCK_ICON_SIZE_RANGE}
          formatValue={formatPixels}
          onCommit={(iconSize) => updateDock({ iconSize })}
        />
      </SettingsRow>
      <SettingsRow label="Agrandissement">
        <Toggle
          label="Agrandissement des icônes du Dock"
          checked={dock.magnification}
          onChange={(magnification) => updateDock({ magnification })}
        />
      </SettingsRow>
      <SettingsRow label="Taille agrandie" controlId="dock-magnified-size">
        <SettingsSlider
          id="dock-magnified-size"
          label="Taille agrandie des icônes du Dock"
          value={dock.magnifiedSize}
          range={DOCK_MAGNIFIED_SIZE_RANGE}
          formatValue={formatPixels}
          disabled={!dock.magnification}
          onCommit={(magnifiedSize) => updateDock({ magnifiedSize })}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}
