"use client";

import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { APPS, getApp } from "@/lib/apps";
import { getDefaultWallpaper, getWallpaper } from "@/lib/wallpapers";
import { useIOSAppStore } from "@/stores/useIOSAppStore";
import { useWallpaperStore } from "@/stores/useWallpaperStore";
import { AppFullScreenView } from "./ios/AppFullScreenView";
import { AppSwitcher } from "./ios/AppSwitcher";
import { IOSDock } from "./ios/IOSDock";
import { LockCornerGesture } from "./ios/LockCornerGesture";
import { Springboard } from "./ios/Springboard";
import { StatusBar } from "./ios/StatusBar";

export function IOS({ inert = false }: { inert?: boolean }) {
  const wallpaperId = useWallpaperStore((state) => state.selected.ios);
  const wallpaper = getWallpaper(wallpaperId) ?? getDefaultWallpaper("ios");
  const activeAppId = useIOSAppStore((state) => state.activeAppId);
  const activeApp = activeAppId ? getApp(APPS, activeAppId) : undefined;
  const isSwitcherOpen = useIOSAppStore((state) => state.isSwitcherOpen);

  return (
    <div
      className="overscroll-none relative h-dvh w-full overflow-hidden [touch-action:manipulation]"
      inert={inert}
    >
      <Image
        src={wallpaper.src}
        alt=""
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="pointer-events-none object-cover select-none [-webkit-user-drag:none]"
      />

      {/* Hidden while locked/booting, same reasoning as MacOS's menu bar/dock
          (see MacOS.tsx) — the lock screen is meant to cover everything. */}
      {inert ? null : <StatusBar variant={activeApp ? "content" : "overlay"} />}
      {inert ? null : <LockCornerGesture />}

      <AnimatePresence>
        {activeApp ? (
          <AppFullScreenView key={activeApp.id} app={activeApp} />
        ) : (
          <Springboard key="springboard" apps={APPS} />
        )}
      </AnimatePresence>

      {inert ? null : <IOSDock apps={APPS} hidden={Boolean(activeApp)} />}

      <AnimatePresence>
        {isSwitcherOpen && !inert ? <AppSwitcher key="switcher" apps={APPS} /> : null}
      </AnimatePresence>
    </div>
  );
}
