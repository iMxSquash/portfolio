"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IframeWindow } from "@/components/apps/iframe/IframeWindow";
import type { AppDefinition } from "@/lib/apps";
import { IOS_MORPH_TRANSITION, IOS_MORPH_TRANSITION_REDUCED } from "@/lib/ios";
import { useIOSAppStore } from "@/stores/useIOSAppStore";
import { HomeIndicator } from "./HomeIndicator";

type AppFullScreenViewProps = {
  app: AppDefinition;
};

/**
 * Full-screen container for the one active iOS app (see os-ios-ui skill):
 * fills the screen under the notch/Dynamic Island only, not the full status
 * bar — the app's real content extends up underneath the status bar's own
 * fixed row (see `StatusBar.tsx`, `"content"` variant), the same "translucent
 * bar floats over content" relationship as real iOS, rather than the status
 * bar reserving a dead band of its own `bg-window-canvas` backing with
 * nothing to blur behind it. Shares its `layoutId` with the springboard icon
 * that opened it so Framer Motion morphs between the two automatically (icon
 * -> full screen and back) instead of a plain cross-fade — the content
 * visually scaling up along with the box during that morph is the intended
 * "zoom from the icon" effect, not a bug to correct for. The home indicator
 * closes it (swipe up) or opens the app switcher instead (press and hold) —
 * see `AppSwitcher.tsx`.
 */
export function AppFullScreenView({ app }: AppFullScreenViewProps) {
  const closeApp = useIOSAppStore((state) => state.closeApp);
  const openSwitcher = useIOSAppStore((state) => state.openSwitcher);
  const reducedMotion = useReducedMotion();
  const Component = app.mobileComponent ?? app.component;

  return (
    <motion.div
      key={app.id}
      layoutId={`ios-app-${app.id}`}
      transition={{ layout: reducedMotion ? IOS_MORPH_TRANSITION_REDUCED : IOS_MORPH_TRANSITION }}
      className="bg-window-canvas absolute inset-0 overflow-hidden"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)" }}
    >
      <div className="h-full w-full">
        {app.type === "iframe" && app.url ? (
          <IframeWindow appId={app.id} url={app.url} />
        ) : Component ? (
          <Component />
        ) : null}
      </div>
      <HomeIndicator
        onSwipeUp={closeApp}
        onLongPress={openSwitcher}
        ariaLabel={`Fermer ${app.name}`}
      />
    </motion.div>
  );
}
