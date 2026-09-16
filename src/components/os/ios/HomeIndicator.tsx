"use client";

import { useRef } from "react";
import { motion, type PanInfo } from "framer-motion";

/** Vertical drag distance (px) that counts as a deliberate swipe-up, not an accidental nudge. */
const SWIPE_UP_THRESHOLD_PX = 60;
/** Press-and-hold duration (ms) that opens the app switcher instead of a plain swipe-up — mirrors real iOS's drag-up-and-pause gesture, minus the pause-mid-drag timing which a press-hold approximates more simply. */
const LONG_PRESS_MS = 350;

type HomeIndicatorProps = {
  onSwipeUp: () => void;
  /** Held instead of swiped: opens the app switcher (see os-ios-ui skill). Omit where there's nothing to switch between (e.g. the lock screen). */
  onLongPress?: () => void;
  /** Light bar over a dark scrim (lock screen) vs. dark bar over light app/wallpaper content. */
  variant?: "light" | "dark";
  ariaLabel: string;
};

/**
 * The iOS home-indicator bar, doubling as the swipe-up-to-close/unlock
 * gesture target — shared by `AppFullScreenView` (closes the active app) and
 * `LockScreen` (unlocks), the same OS-level affordance in both places (see
 * os-ios-ui skill). The drag zone is this thin bottom strip only, never the
 * full screen edge, so it never fights the browser/OS's own edge-swipe
 * gestures.
 */
export function HomeIndicator({
  onSwipeUp,
  onLongPress,
  variant = "dark",
  ariaLabel,
}: HomeIndicatorProps) {
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);

  function clearPressTimer() {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  function handlePointerDown() {
    longPressFiredRef.current = false;
    if (!onLongPress) return;
    pressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  }

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    clearPressTimer();
    if (longPressFiredRef.current) return;
    if (info.offset.y < -SWIPE_UP_THRESHOLD_PX) onSwipeUp();
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      drag="y"
      dragConstraints={{ top: -80, bottom: 0 }}
      dragElastic={0.4}
      dragMomentum={false}
      dragSnapToOrigin
      onPointerDown={handlePointerDown}
      onPointerUp={clearPressTimer}
      onPointerCancel={clearPressTimer}
      // A real drag means the user is swiping, not holding still — stop the
      // long-press timer so a swipe-up-fast never also opens the switcher.
      onDragStart={clearPressTimer}
      onDragEnd={handleDragEnd}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSwipeUp();
        }
      }}
      className="fixed inset-x-0 bottom-0 z-1000 flex touch-none justify-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-system-blue"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)", paddingTop: 10 }}
    >
      <span
        aria-hidden="true"
        className={`h-(--ios-home-indicator-height) w-(--ios-home-indicator-width) rounded-full ${
          variant === "light" ? "bg-white/90" : "bg-foreground/70"
        }`}
      />
    </motion.div>
  );
}
