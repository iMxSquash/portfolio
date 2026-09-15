"use client";

import { motion, type PanInfo } from "framer-motion";

/** Vertical drag distance (px) that counts as a deliberate swipe-up, not an accidental nudge. */
const SWIPE_UP_THRESHOLD_PX = 60;

type HomeIndicatorProps = {
  onSwipeUp: () => void;
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
export function HomeIndicator({ onSwipeUp, variant = "dark", ariaLabel }: HomeIndicatorProps) {
  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
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
