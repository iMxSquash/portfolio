"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUser } from "@tabler/icons-react";
import { DISPLAY_NAME, UNLOCK_DURATION_S, UNLOCK_DURATION_S_REDUCED } from "@/lib/boot";
import { LOCK_SCREEN_GLASS } from "@/lib/glass-presets";
import { QL_CONTENT_FLEX_COL_CENTER, useLiquidGlass } from "@/lib/use-liquid-glass";
import { useReduceMotion } from "@/lib/use-reduce-motion";

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
  const [scrimEl, setScrimEl] = useState<HTMLDivElement | null>(null);
  const reducedMotion = useReduceMotion();
  const duration = reducedMotion ? UNLOCK_DURATION_S_REDUCED : UNLOCK_DURATION_S;

  // Full-viewport scrim behind the login card (see `LOCK_SCREEN_GLASS`'s own
  // doc comment for the "Sheet / modal" material choice); its children
  // (avatar button, name, hint) never change shape, so no host-children
  // wrapper is needed (see use-liquid-glass.ts).
  useLiquidGlass(scrimEl, LOCK_SCREEN_GLASS);

  useEffect(() => {
    avatarRef.current?.focus();
  }, []);

  return (
    <motion.div
      ref={setScrimEl}
      // The engine reparents this div's children into its own `.ql-content`
      // wrapper (see QL_CONTENT_FLEX_COL_CENTER's doc comment) — restore the
      // flex column layout and gap there so the avatar/name/hint stack and
      // space out the same way they did as direct children of this host
      // (`gap-4` on the host itself is inert now that it has only one
      // child).
      className={`fixed inset-0 flex flex-col items-center justify-center ${QL_CONTENT_FLEX_COL_CENTER} [&>.ql-content]:gap-4`}
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
        <IconUser size={48} stroke={1.75} aria-hidden="true" />
      </button>
      <p className="text-center text-lg font-medium text-white">{DISPLAY_NAME}</p>
      <p className="text-center text-sm text-white/70">Cliquez pour déverrouiller</p>
    </motion.div>
  );
}
