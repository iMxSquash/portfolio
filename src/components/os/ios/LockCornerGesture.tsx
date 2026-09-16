"use client";

import { useState } from "react";
import { animate, motion, useMotionValue, type PanInfo } from "framer-motion";
import { relockSession } from "@/lib/boot";
import { LOCK_SCREEN_CURTAIN_GLASS } from "@/lib/glass-presets";
import { formatLockScreenDate, formatStatusBarClock } from "@/lib/ios";
import { useLiveDate } from "@/lib/use-live-clock";
import { QL_CONTENT_FLEX_COL_CENTER, useLiquidGlass } from "@/lib/use-liquid-glass";
import { useBootStore } from "@/stores/useBootStore";

/** Drag distance (px) past which releasing commits to locking instead of snapping back. */
const LOCK_COMMIT_THRESHOLD_PX = 160;
/** Hit-zone size (px) — small and unlabeled on purpose, same "no visible affordance" treatment as the notes edge-swipe zone. */
const CORNER_ZONE_SIZE = 60;
const SNAP_BACK_SPRING = { type: "spring", stiffness: 400, damping: 40 } as const;
const SNAP_CLOSED_TWEEN = { type: "tween", duration: 0.18, ease: "easeIn" } as const;

/**
 * Re-lock gesture: swipe down from the screen's top-left corner, available
 * everywhere in iOS mode (springboard or a full-screen app) — the macOS
 * equivalent is "Verrouiller l'écran" in the Apple menu (see MenuBar.tsx),
 * but iOS has no menu bar to host it, so this corner stands in for it.
 *
 * The corner itself is a small, static hit zone (`onPan`/`onPanEnd`, not
 * `drag` — see the Notes edge-swipe-back zone for the same reasoning): it
 * never moves. What the user actually sees sliding down under their finger
 * is a separate full-screen curtain, previewing the real lock screen, whose
 * `y` this gesture drives live via a motion value. Releasing past the
 * commit threshold finishes the slide and hands off to the real
 * `LockScreen` (`relockSession`); short of it, the curtain springs back out
 * of view and nothing happens.
 */
export function LockCornerGesture() {
  const setBootStage = useBootStore((state) => state.setStage);
  const dragY = useMotionValue(0);
  const [curtainEl, setCurtainEl] = useState<HTMLDivElement | null>(null);
  // Tuned specifically for the live drag (see LOCK_SCREEN_CURTAIN_GLASS) —
  // kept mounted permanently (parked off-screen via `top: -100%` + `dragY`
  // at rest) rather than only while dragging, so this expensive-to-build
  // engine is constructed once, not re-built on every gesture.
  useLiquidGlass(curtainEl, LOCK_SCREEN_CURTAIN_GLASS);

  function handlePan(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    dragY.set(Math.max(0, Math.min(info.offset.y, window.innerHeight)));
  }

  function handlePanEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.y > LOCK_COMMIT_THRESHOLD_PX) {
      animate(dragY, window.innerHeight, {
        ...SNAP_CLOSED_TWEEN,
        onComplete: () => {
          relockSession(setBootStage);
          dragY.set(0);
        },
      });
    } else {
      animate(dragY, 0, SNAP_BACK_SPRING);
    }
  }

  return (
    <>
      <motion.div
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        aria-hidden="true"
        className="fixed top-0 left-0 z-1000 touch-none"
        style={{ width: CORNER_ZONE_SIZE, height: CORNER_ZONE_SIZE }}
      />
      <motion.div
        ref={setCurtainEl}
        aria-hidden="true"
        // Starts fully above the viewport (`top: -100%` of its own 100dvh
        // height) and the live drag `y` slides it down from there. Content
        // is centered exactly like the real `LockScreen` it previews (not
        // anchored to the curtain's own bottom edge) — it only becomes
        // visible once the drag has revealed enough of the curtain to
        // include the centered block, a deliberate trade for looking
        // identical to the screen it hands off to.
        className={`pointer-events-none fixed inset-x-0 z-1060 flex h-dvh flex-col items-center justify-center ${QL_CONTENT_FLEX_COL_CENTER} [&>.ql-content]:gap-1`}
        style={{ top: "-100%", y: dragY }}
      >
        <CurtainClockText />
        <p className="mt-8 text-center text-sm text-white/70">Relâcher pour verrouiller</p>
      </motion.div>
    </>
  );
}

/**
 * Isolated so the 1s clock tick only re-renders this leaf — the curtain
 * stays mounted for the whole unlocked session (see the doc comment on
 * `useLiquidGlass` above), not just while dragging, so without this split
 * the date/time formatting and the full `LockCornerGesture` tree (drag
 * zone included) would redo work every second regardless of whether the
 * curtain is even visible (see `use-live-clock.ts`'s own isolation
 * convention, e.g. `Clock.tsx`/`StatusBarClock.tsx`).
 */
function CurtainClockText() {
  const now = useLiveDate();

  return (
    <>
      <p className="text-center text-lg font-medium text-white capitalize">
        {now ? formatLockScreenDate(now) : " "}
      </p>
      <p className="text-center text-7xl font-semibold text-white tabular-nums">
        {now ? formatStatusBarClock(now) : " "}
      </p>
    </>
  );
}
