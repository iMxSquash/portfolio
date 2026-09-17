"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { OSMode } from "@/lib/device";
import { hasSeenBootThisSession, markBootSeenThisSession } from "@/lib/boot";
import { playSystemSound } from "@/lib/sounds";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { useBootStore } from "@/stores/useBootStore";
import { BootIntro } from "./boot/BootIntro";
import { LockScreen } from "./boot/LockScreen";
import { LoginScreen } from "./boot/LoginScreen";

/**
 * Overlay above <MacOS>/<IOS>: boot animation -> login/lock -> unlock, once
 * per browser session, shared by both modes through the same
 * `useBootStore` stage machine (one `boot-seen` session flag regardless of
 * mode — a real session is either always-desktop or always-mobile). Only
 * the unlock screen itself differs: `LoginScreen` (click an avatar) for
 * macOS, `LockScreen` (swipe up) for iOS. Initial state is always "booting"
 * on both server and first client render (no hydration mismatch); the
 * layout effect below corrects it to "done" synchronously before paint if
 * this session already played it. The `.boot-seen` class set by the
 * blocking script in layout.tsx (see globals.css `.boot-seen
 * .boot-screen-root`) hides this overlay visually even earlier, closing the
 * gap before that effect runs.
 */
export function BootScreen({ mode }: { mode: OSMode }) {
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

  const UnlockScreen = mode === "ios" ? LockScreen : LoginScreen;

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
          <UnlockScreen
            key="login"
            unlocking={stage === "unlocking"}
            onUnlockClick={() => {
              // The click/swipe that unlocks is a real user gesture, which
              // browsers require before any audio can play — see
              // `playSystemSound`'s doc comment.
              playSystemSound("startup");
              setStage("unlocking");
            }}
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
