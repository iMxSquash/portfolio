"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DISPLAY_NAME, UNLOCK_DURATION_S, UNLOCK_DURATION_S_REDUCED } from "@/lib/boot";

export function LoginScreen({
  unlocking,
  onUnlockClick,
  onUnlockComplete,
}: {
  unlocking: boolean;
  onUnlockClick: () => void;
  onUnlockComplete: () => void;
}) {
  const avatarRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? UNLOCK_DURATION_S_REDUCED : UNLOCK_DURATION_S;

  useEffect(() => {
    avatarRef.current?.focus();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-2xl dark:bg-black/30"
      animate={unlocking ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: unlocking ? duration : 0 }}
      onAnimationComplete={() => {
        if (unlocking) onUnlockComplete();
      }}
    >
      <button
        ref={avatarRef}
        type="button"
        disabled={unlocking}
        onClick={onUnlockClick}
        aria-label="Déverrouiller la session"
        className="flex h-24 w-24 items-center justify-center rounded-full bg-white/15 text-white ring-2 ring-white/40 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none"
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
        </svg>
      </button>
      <p className="text-lg font-medium text-white">{DISPLAY_NAME}</p>
      <p className="text-sm text-white/70">Cliquez pour déverrouiller</p>
    </motion.div>
  );
}
