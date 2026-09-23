"use client";

import { useState } from "react";
import { FINDER_TOOLBAR_CLUSTER_GLASS } from "@/lib/glass-presets";
import { useLiquidGlass } from "@/lib/use-liquid-glass";

type SegmentedControlOption<Value extends string> = { value: Value; label: string };

type SegmentedControlProps<Value extends string> = {
  value: Value;
  options: SegmentedControlOption<Value>[];
  onChange: (value: Value) => void;
  ariaLabel: string;
};

/**
 * Actionable, so it gets real Liquid Glass with refraction (see
 * apple-design skill) — reuses `FINDER_TOOLBAR_CLUSTER_GLASS` rather than a
 * dedicated preset, per TODO-settings.md's stated fallback: same pill-glass
 * family as the Finder toolbar clusters already renders well here.
 */
export function SegmentedControl<Value extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedControlProps<Value>) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  useLiquidGlass(el, FINDER_TOOLBAR_CLUSTER_GLASS);

  return (
    <div ref={setEl} role="radiogroup" aria-label={ariaLabel} className="flex gap-0.5 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`focus-visible:outline-system-blue rounded-[6px] px-3 py-1 text-[12px] font-medium focus-visible:outline-2 ${
            value === option.value
              ? "bg-black/8 dark:bg-white/12"
              : "hover:bg-black/4 dark:hover:bg-white/4"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
