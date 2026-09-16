"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AppIcon } from "@/components/os/AppIcon";
import { launchApp, type AppDefinition } from "@/lib/apps";
import { IOS_MORPH_TRANSITION, IOS_MORPH_TRANSITION_REDUCED } from "@/lib/ios";
import { useIOSAppStore } from "@/stores/useIOSAppStore";

type SpringboardIconProps = {
  app: AppDefinition;
};

/**
 * One springboard tile: icon + label. Shares a `layoutId` with
 * `AppFullScreenView`'s root so opening an app morphs from this icon to the
 * full-screen container instead of a plain cross-fade (see os-ios-ui skill).
 * `external` apps never open a screen — `launchApp` routes them straight to
 * a new tab, same helper the macOS dock/desktop use.
 */
export function SpringboardIcon({ app }: SpringboardIconProps) {
  const openApp = useIOSAppStore((state) => state.openApp);
  const reducedMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={() => launchApp(app, openApp)}
      aria-label={app.name}
      className="flex flex-col items-center gap-1.5 [-webkit-touch-callout:none] select-none"
    >
      <motion.span
        layoutId={`ios-app-${app.id}`}
        transition={{ layout: reducedMotion ? IOS_MORPH_TRANSITION_REDUCED : IOS_MORPH_TRANSITION }}
        className="block w-(--ios-springboard-icon-size)"
      >
        <AppIcon app={app} />
      </motion.span>
      <span className="max-w-[72px] truncate text-[11px] font-medium text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.5)]">
        {app.name}
      </span>
    </button>
  );
}
