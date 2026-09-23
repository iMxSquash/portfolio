"use client";

import { motion } from "framer-motion";
import { SiteLogo } from "@/components/icons/SiteLogo";
import { BOOT_DURATION_S, BOOT_DURATION_S_REDUCED } from "@/lib/boot";
import { useReduceMotion } from "@/lib/use-reduce-motion";

export function BootIntro({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = useReduceMotion();
  const duration = reducedMotion ? BOOT_DURATION_S_REDUCED : BOOT_DURATION_S;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-black text-white">
      <SiteLogo size={64} />
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
