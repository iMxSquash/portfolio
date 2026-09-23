"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UNLOCK_DURATION_S, UNLOCK_DURATION_S_REDUCED } from "@/lib/boot";
import { LOCK_SCREEN_GLASS } from "@/lib/glass-presets";
import { formatLockScreenDate, formatStatusBarClock } from "@/lib/ios";
import { useLiveDate } from "@/lib/use-live-clock";
import { QL_CONTENT_FLEX_COL_CENTER, useLiquidGlass } from "@/lib/use-liquid-glass";
import { useReduceMotion } from "@/lib/use-reduce-motion";
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
  const reducedMotion = useReduceMotion();
  const duration = reducedMotion ? UNLOCK_DURATION_S_REDUCED : UNLOCK_DURATION_S;
  // One shared tick for both derived strings (time + date), instead of two
  // independent `setInterval`s for the same underlying clock.
  const now = useLiveDate();
  const time = now ? formatStatusBarClock(now) : null;
  const date = now ? formatLockScreenDate(now) : null;
  const [scrimEl, setScrimEl] = useState<HTMLDivElement | null>(null);
  // Same "Sheet / modal" glass as macOS's LoginScreen (see
  // `LOCK_SCREEN_GLASS`'s own doc comment) — its children (time, date,
  // hint, home indicator) never change shape, so no host-children wrapper
  // is needed (see use-liquid-glass.ts).
  useLiquidGlass(scrimEl, LOCK_SCREEN_GLASS);

  return (
    <motion.div
      ref={setScrimEl}
      // See LoginScreen.tsx / QL_CONTENT_FLEX_COL_CENTER: the engine
      // reparents children into `.ql-content`, so the flex column layout
      // and gap need restating there (a `gap-1` on the host itself is inert
      // now that it has only one child).
      className={`fixed inset-0 flex flex-col items-center justify-center ${QL_CONTENT_FLEX_COL_CENTER} [&>.ql-content]:gap-1`}
      animate={unlocking ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: unlocking ? duration : 0 }}
      onAnimationComplete={() => {
        if (unlocking) onUnlockComplete();
      }}
    >
      <p className="text-center text-lg font-medium text-white capitalize">{date ?? " "}</p>
      <p className="text-center text-7xl font-semibold text-white tabular-nums">{time ?? " "}</p>
      <p className="mt-8 text-center text-sm text-white/70">
        Glisser vers le haut pour déverrouiller
      </p>

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
