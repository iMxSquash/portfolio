"use client";

import { useState } from "react";
import { useThemeStore } from "@/stores/useThemeStore";
import type { ThemeMode } from "@/lib/theme";

const THEME_OPTIONS: Array<{ mode: ThemeMode; label: string }> = [
  { mode: "light", label: "Clair" },
  { mode: "dark", label: "Sombre" },
  { mode: "system", label: "Système" },
];

export function ControlCenterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="1" y="2.5" width="14" height="4" rx="2" fill="currentColor" opacity="0.25" />
      <circle cx="10" cy="4.5" r="1.6" fill="currentColor" />
      <rect x="1" y="9.5" width="14" height="4" rx="2" fill="currentColor" opacity="0.25" />
      <circle cx="6" cy="11.5" r="1.6" fill="currentColor" />
    </svg>
  );
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
            className="w-full accent-blue-500"
          />
          <SunIcon className="size-4" />
        </div>
      </div>
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className={`opacity-60 ${className ?? ""}`}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M3.1 12.9l1.1-1.1M11.8 4.2l1.1-1.1" />
    </svg>
  );
}
