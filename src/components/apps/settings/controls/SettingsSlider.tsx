"use client";

import { useState, type ChangeEvent } from "react";
import type { SliderRange } from "@/lib/settings";

type SettingsSliderProps = {
  id?: string;
  /** Announced by assistive tech (use even when a visible `SettingsRow` label already exists — they're the same text). */
  label: string;
  value: number;
  range: SliderRange;
  /** Called once, when the gesture ends — never on every drag frame (see os-window-manager skill's "never write to the store during a drag" rule). */
  onCommit: (value: number) => void;
  formatValue?: (value: number) => string;
  disabled?: boolean;
};

/**
 * `<input type="range">` that keeps its own local value while dragging and
 * only calls `onCommit` on release (`pointerup`/`keyup`/`blur` — covers
 * mouse drag, keyboard nudge and any interaction that ends off-element).
 */
export function SettingsSlider({
  id,
  label,
  value,
  range,
  onCommit,
  formatValue,
  disabled = false,
}: SettingsSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  // Adjusting state during render (React's own recommended pattern for
  // "reset state when a prop changes") instead of an effect — follows
  // external resets (e.g. the pane's "Réinitialiser" button) without the
  // extra render an effect-based sync would cost, and without ever fighting
  // the user's own in-progress drag (`value` only changes from outside a
  // drag in this app).
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
    setLocalValue(value);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setLocalValue(Number(event.target.value));
  }

  function commit() {
    if (localValue !== value) onCommit(localValue);
  }

  return (
    <div className="flex w-36 items-center gap-2">
      <input
        id={id}
        type="range"
        aria-label={label}
        min={range.min}
        max={range.max}
        step={range.step}
        value={localValue}
        disabled={disabled}
        onChange={handleChange}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        className="accent-system-blue w-full disabled:opacity-40"
      />
      {formatValue ? (
        <span
          aria-hidden="true"
          className="text-foreground/55 w-9 shrink-0 text-right text-[11px] tabular-nums"
        >
          {formatValue(localValue)}
        </span>
      ) : null}
    </div>
  );
}
