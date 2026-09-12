"use client";

import { useState } from "react";
import { IconAdjustmentsHorizontal, IconSun } from "@tabler/icons-react";
import { useThemeStore } from "@/stores/useThemeStore";
import type { ThemeMode } from "@/lib/theme";

const THEME_OPTIONS: Array<{ mode: ThemeMode; label: string }> = [
  { mode: "light", label: "Clair" },
  { mode: "dark", label: "Sombre" },
  { mode: "system", label: "Système" },
];

export function ControlCenterIcon({ className }: { className?: string }) {
  return <IconAdjustmentsHorizontal className={className} stroke={2} aria-hidden="true" />;
}

/**
 * Control Center bonus: real theme toggle (wired to `useThemeStore`) and a
 * decorative brightness slider — there's no browser API to actually dim the
 * display, so it's local, unpersisted state, purely for show.
 */
export function ControlCenterContent() {
  const mode = useThemeStore((state) => state.mode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [brightness, setBrightness] = useState(80);

  return (
    <div className="w-60 space-y-3 p-1">
      <div>
        <p className="mb-1.5 px-1 text-xs font-medium opacity-60">Apparence</p>
        {/* Track: rounded-lg (8px) + p-1 (4px) padding -> buttons rounded-[4px] (concentric, see liquid-glass-tailwind skill). */}
        <div className="flex rounded-lg bg-black/10 p-1 dark:bg-white/10">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => setTheme(option.mode)}
              className={`flex-1 rounded-[4px] px-2 py-1 text-xs font-medium ${
                mode === option.mode ? "bg-white text-black dark:bg-white/20 dark:text-white" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 px-1 text-xs font-medium opacity-60">Luminosité</p>
        <div className="flex items-center gap-2 px-1">
          <SunIcon className="size-3" />
          <input
            type="range"
            min={0}
            max={100}
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
            aria-label="Luminosité (factice, sans effet réel)"
            className="w-full accent-system-blue"
          />
          <SunIcon className="size-4" />
        </div>
      </div>
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return <IconSun className={`opacity-60 ${className ?? ""}`} stroke={1.75} aria-hidden="true" />;
}
