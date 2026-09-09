"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BOOT_DURATION_S, BOOT_DURATION_S_REDUCED } from "@/lib/boot";
import { AppleLogo } from "@/components/icons/AppleLogo";

export function BootIntro({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? BOOT_DURATION_S_REDUCED : BOOT_DURATION_S;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-black text-white">
      <AppleLogo size={64} />
      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/20">
        <motion.div
          className="h-full w-full origin-left rounded-full bg-white"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration, ease: "linear" }}
          onAnimationComplete={onComplete}
        />
      </div>
    </div>
  );
}
