"use client";

import { IconCheck } from "@tabler/icons-react";
import { ACCENT_COLORS, getAccentColorOption, type AccentColorOption } from "@/lib/settings";
import { THEME_MODE_OPTIONS, type ThemeMode } from "@/lib/theme";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { SettingsGroup } from "../controls/SettingsGroup";

/** Apparence: theme (reuses `useThemeStore`, synced with Control Center) and accent color. */
export function AppearancePane() {
  const mode = useThemeStore((state) => state.mode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const accentColor = useSettingsStore((state) => state.appearance.accentColor);
  const updateAppearance = useSettingsStore((state) => state.updateAppearance);
  const selectedAccent = getAccentColorOption(accentColor);

  return (
    <div>
      <SettingsGroup title="Apparence">
        <div className="flex items-center justify-center gap-6 px-4 py-4">
          {THEME_MODE_OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => setTheme(option.mode)}
              aria-pressed={mode === option.mode}
              className="focus-visible:outline-system-blue flex flex-col items-center gap-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <ThemeThumbnail mode={option.mode} selected={mode === option.mode} />
              <span
                className={`text-[12px] ${mode === option.mode ? "text-system-blue font-medium" : ""}`}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Couleur d'accentuation">
        <div className="px-4 py-3.5">
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((accent) => (
              <button
                key={accent.id}
                type="button"
                aria-pressed={accentColor === accent.id}
                aria-label={accent.label}
                onClick={() => updateAppearance({ accentColor: accent.id })}
                style={{ background: accentSwatchBackground(accent) }}
                className="focus-visible:outline-system-blue relative size-7 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {accentColor === accent.id ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <IconCheck size={14} stroke={3} className="text-white drop-shadow" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          {/* Selection isn't conveyed by the swatch's own color alone — the
              checkmark above and this label are the redundant, color-independent cues. */}
          <p className="text-foreground/55 mt-2.5 text-[12px]">
            Couleur sélectionnée :{" "}
            <span className="text-foreground font-medium">{selectedAccent.label}</span>
          </p>
        </div>
      </SettingsGroup>
    </div>
  );
}

function accentSwatchBackground(accent: AccentColorOption): string {
  if (accent.id === "multicolor") {
    return "conic-gradient(from 90deg, #ff5f57, #febc2e, #28c840, #0a84ff, #bf5af2, #ff5f57)";
  }
  return `linear-gradient(160deg, ${accent.swatchLight}, ${accent.swatchDark})`;
}

function ThemeThumbnail({ mode, selected }: { mode: ThemeMode; selected: boolean }) {
  const ring = selected
    ? "ring-2 ring-system-blue ring-offset-2 ring-offset-window-canvas"
    : "ring-1 ring-black/10 dark:ring-white/15";
  return (
    <span aria-hidden="true" className={`block h-10 w-14 overflow-hidden rounded-md ${ring}`}>
      {mode === "light" ? <span className="block h-full w-full bg-white" /> : null}
      {mode === "dark" ? <span className="block h-full w-full bg-neutral-900" /> : null}
      {mode === "system" ? (
        <span className="flex h-full w-full">
          <span className="h-full w-1/2 bg-white" />
          <span className="h-full w-1/2 bg-neutral-900" />
        </span>
      ) : null}
    </span>
  );
}
