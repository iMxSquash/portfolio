"use client";

import { playSystemSound } from "@/lib/sounds";
import { SOUND_VOLUME_RANGE } from "@/lib/settings";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { SettingsGroup } from "../controls/SettingsGroup";
import { SettingsRow } from "../controls/SettingsRow";
import { SettingsSecondaryButton } from "../controls/SettingsSecondaryButton";
import { SettingsSlider } from "../controls/SettingsSlider";
import { Toggle } from "../controls/Toggle";

function formatVolumePercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** Son: `playSystemSound` (see `sounds.ts`) reads this section straight from the store, no hook involved. */
export function SoundPane() {
  const sound = useSettingsStore((state) => state.sound);
  const updateSound = useSettingsStore((state) => state.updateSound);

  return (
    <SettingsGroup srOnlyTitle="Son">
      <SettingsRow label="Sons système">
        <Toggle
          label="Sons système"
          checked={sound.systemSoundsEnabled}
          onChange={(systemSoundsEnabled) => updateSound({ systemSoundsEnabled })}
        />
      </SettingsRow>
      <SettingsRow label="Volume" controlId="sound-volume">
        <SettingsSlider
          id="sound-volume"
          label="Volume des sons système"
          value={sound.volume}
          range={SOUND_VOLUME_RANGE}
          formatValue={formatVolumePercent}
          disabled={!sound.systemSoundsEnabled}
          onCommit={(volume) => updateSound({ volume })}
        />
      </SettingsRow>
      <SettingsRow label="Tester">
        <SettingsSecondaryButton
          onClick={() => playSystemSound("minimize")}
          disabled={!sound.systemSoundsEnabled}
        >
          Tester
        </SettingsSecondaryButton>
      </SettingsRow>
    </SettingsGroup>
  );
}
