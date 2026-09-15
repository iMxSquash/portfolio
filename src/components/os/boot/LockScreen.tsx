"use client";

import { motion, useReducedMotion } from "framer-motion";
import { UNLOCK_DURATION_S, UNLOCK_DURATION_S_REDUCED } from "@/lib/boot";
import { formatLockScreenDate, formatStatusBarClock } from "@/lib/ios";
import { useLiveDate } from "@/lib/use-live-clock";
import { HomeIndicator } from "../ios/HomeIndicator";

/**
 * iOS equivalent of `LoginScreen.tsx`, driven by the same `useBootStore`
 * stage machine (see `BootScreen.tsx`) — swipe up on the home indicator
 * instead of clicking an avatar (see os-ios-ui / TODO.md Phase 6).
 */
export function LockScreen({
  unlocking,
  onUnlockClick,
  onUnlockComplete,
}: {
  unlocking: boolean;
  onUnlockClick: () => void;
  onUnlockComplete: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? UNLOCK_DURATION_S_REDUCED : UNLOCK_DURATION_S;
  // One shared tick for both derived strings (time + date), instead of two
  // independent `setInterval`s for the same underlying clock.
  const now = useLiveDate();
  const time = now ? formatStatusBarClock(now) : null;
  const date = now ? formatLockScreenDate(now) : null;

  return (
    <motion.div
      // Same plain fixed blur as LoginScreen (not a LiquidGlassEngine
      // instance — this scrim isn't an actionable control, see
      // apple-design skill).
      className="fixed inset-0 flex flex-col items-center justify-center gap-1 bg-black/20 backdrop-blur-3xl dark:bg-black/30"
      animate={unlocking ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: unlocking ? duration : 0 }}
      onAnimationComplete={() => {
        if (unlocking) onUnlockComplete();
      }}
    >
      <p className="text-lg font-medium text-white capitalize">{date ?? " "}</p>
      <p className="text-7xl font-semibold text-white tabular-nums">{time ?? " "}</p>
      <p className="mt-8 text-sm text-white/70">Glisser vers le haut pour déverrouiller</p>

      <HomeIndicator
        onSwipeUp={() => {
          if (!unlocking) onUnlockClick();
        }}
        variant="light"
        ariaLabel="Déverrouiller la session"
      />
    </motion.div>
  );
}
