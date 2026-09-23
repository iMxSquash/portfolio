"use client";

import { motion } from "framer-motion";

const TOGGLE_SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;
const TOGGLE_WIDTH = 38;
const TOGGLE_HEIGHT = 22;
const TOGGLE_THUMB_SIZE = 18;
const TOGGLE_THUMB_INSET = 2;

type ToggleProps = {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Announced by assistive tech — pass the row's own label text. */
  label: string;
};

/**
 * macOS-style switch: a real `<button role="switch" aria-checked>`, spring
 * thumb (respects `MotionConfig`'s app-wide reduced-motion setting — see
 * `OS.tsx`), accent-colored fill when on so state isn't color-only (the
 * thumb's own position is the redundant, color-independent cue).
 */
export function Toggle({ id, checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{ width: TOGGLE_WIDTH, height: TOGGLE_HEIGHT }}
      className={`focus-visible:outline-system-blue relative shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        checked ? "bg-system-blue" : "bg-black/15 dark:bg-white/20"
      }`}
    >
      <motion.span
        aria-hidden="true"
        className="absolute top-1/2 block rounded-full bg-white shadow-sm"
        style={{ width: TOGGLE_THUMB_SIZE, height: TOGGLE_THUMB_SIZE, y: "-50%" }}
        animate={{
          left: checked
            ? TOGGLE_WIDTH - TOGGLE_THUMB_SIZE - TOGGLE_THUMB_INSET
            : TOGGLE_THUMB_INSET,
        }}
        transition={TOGGLE_SPRING}
      />
    </button>
  );
}
