"use client";

import { motion } from "framer-motion";
import { IframeWindow } from "@/components/apps/iframe/IframeWindow";
import type { AppDefinition } from "@/lib/apps";
import { IOS_STATUS_BAR_CLEARANCE } from "@/lib/ios";
import { useIOSAppStore } from "@/stores/useIOSAppStore";
import { HomeIndicator } from "./HomeIndicator";

type AppFullScreenViewProps = {
  app: AppDefinition;
};

/**
 * Full-screen container for the one active iOS app (see os-ios-ui skill):
 * fills the screen under the status bar, and shares its `layoutId` with the
 * springboard icon that opened it so Framer Motion morphs between the two
 * automatically (icon -> full screen and back) instead of a plain cross-fade
 * — the content visually scaling up along with the box during that morph is
 * the intended "zoom from the icon" effect, not a bug to correct for. The
 * home indicator (swipe up) is the only way to close it.
 */
export function AppFullScreenView({ app }: AppFullScreenViewProps) {
  const closeApp = useIOSAppStore((state) => state.closeApp);
  const Component = app.mobileComponent ?? app.component;

  return (
    <motion.div
      key={app.id}
      layoutId={`ios-app-${app.id}`}
      className="bg-window-canvas absolute inset-0 overflow-hidden"
      style={{ paddingTop: IOS_STATUS_BAR_CLEARANCE }}
    >
      <div className="h-full w-full">
        {app.type === "iframe" && app.url ? (
          <IframeWindow url={app.url} />
        ) : Component ? (
          <Component />
        ) : null}
      </div>
      <HomeIndicator onSwipeUp={closeApp} ariaLabel={`Fermer ${app.name}`} />
    </motion.div>
  );
}
