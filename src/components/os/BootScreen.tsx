"use client";

import { AnimatePresence, motion } from "framer-motion";
import { hasSeenBootThisSession, markBootSeenThisSession } from "@/lib/boot";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { useBootStore } from "@/stores/useBootStore";
import { BootIntro } from "./boot/BootIntro";
import { LoginScreen } from "./boot/LoginScreen";

/**
 * Overlay above <MacOS>: boot animation -> login -> unlock, once per
 * browser session. Initial state is always "booting" on both server and
 * first client render (no hydration mismatch); the layout effect below
 * corrects it to "done" synchronously before paint if this session already
 * played it. The `.boot-seen` class set by the blocking script in
 * layout.tsx (see globals.css `.boot-seen .boot-screen-root`) hides this
 * overlay visually even earlier, closing the gap before that effect runs.
 */
export function BootScreen() {
  const stage = useBootStore((state) => state.stage);
  const setStage = useBootStore((state) => state.setStage);

  useIsomorphicLayoutEffect(() => {
    if (hasSeenBootThisSession()) {
      setStage("done");
    }
  }, [setStage]);

  if (stage === "done") {
    return null;
  }

  return (
    <div className="boot-screen-root fixed inset-0 z-50">
      <AnimatePresence mode="wait">
        {stage === "booting" ? (
          <motion.div
            key="booting"
            className="h-full w-full"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BootIntro onComplete={() => setStage("login")} />
          </motion.div>
        ) : (
          <LoginScreen
            key="login"
            unlocking={stage === "unlocking"}
            onUnlockClick={() => setStage("unlocking")}
            onUnlockComplete={() => {
              markBootSeenThisSession();
              setStage("done");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
