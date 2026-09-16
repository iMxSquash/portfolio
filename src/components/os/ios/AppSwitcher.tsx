"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { AppIcon } from "@/components/os/AppIcon";
import { getApp, type AppDefinition } from "@/lib/apps";
import { useIOSAppStore } from "@/stores/useIOSAppStore";

type AppSwitcherProps = {
  apps: AppDefinition[];
};

/** Vertical drag distance (px) on a card that counts as "quit this app". */
const CARD_DISMISS_THRESHOLD_PX = 120;

/**
 * App switcher (see os-ios-ui skill / TODO.md Phase 6): opened by a
 * press-and-hold on the home indicator (see `HomeIndicator.tsx`). Shows
 * every app in `recentAppIds` as a horizontally scrollable card; tapping one
 * switches to it, swiping a card up quits it. No live app thumbnails — this
 * portfolio never keeps a backgrounded app mounted (see the Phase 6
 * /simplify pass on iframe apps), so there is no screenshot to show; each
 * card centers the app's icon instead, a deliberate simplification.
 */
export function AppSwitcher({ apps }: AppSwitcherProps) {
  const recentAppIds = useIOSAppStore((state) => state.recentAppIds);
  const closeSwitcher = useIOSAppStore((state) => state.closeSwitcher);
  const switchToApp = useIOSAppStore((state) => state.switchToApp);
  const removeFromRecents = useIOSAppStore((state) => state.removeFromRecents);
  const rowRef = useRef<HTMLDivElement>(null);

  // `recentAppIds` is most-recent-first (see useIOSAppStore); the row reads
  // oldest -> newest left to right, so it's reversed just for display.
  const recentApps = recentAppIds
    .map((id) => getApp(apps, id))
    .filter((app): app is AppDefinition => app !== undefined)
    .reverse();

  // Opens scrolled to the current app's card (now the rightmost one) rather
  // than the oldest, matching real iOS — the row starts scrolled to 0
  // otherwise, since that's simply where a fresh scroll container sits.
  useEffect(() => {
    rowRef.current?.scrollTo({ left: rowRef.current.scrollWidth });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-label="Applications récentes"
      className="fixed inset-0 z-1001 flex items-center bg-black/40 backdrop-blur-2xl"
      onClick={closeSwitcher}
    >
      <div
        ref={rowRef}
        className="flex w-full items-center gap-5 overflow-x-auto px-[10vw] py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <AnimatePresence>
          {recentApps.map((app) => (
            <SwitcherCard
              key={app.id}
              app={app}
              onSelect={() => switchToApp(app.id)}
              onDismiss={() => removeFromRecents(app.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SwitcherCard({
  app,
  onSelect,
  onDismiss,
}: {
  app: AppDefinition;
  onSelect: () => void;
  onDismiss: () => void;
}) {
  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.y < -CARD_DISMISS_THRESHOLD_PX) onDismiss();
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -300 }}
      drag="y"
      dragConstraints={{ top: -300, bottom: 0 }}
      dragElastic={0.3}
      dragMomentum={false}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      // `onTap` (not `onClick`) so a drag that ends up back at rest — the
      // swipe-to-dismiss gesture snapping back — never also counts as a
      // select; Framer only fires it for a genuine tap with no drag.
      onTap={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      // Native horizontal panning stays with the browser (so the row below
      // can still be scrolled by touch from on top of a card) — only
      // vertical is claimed by this drag gesture.
      style={{ touchAction: "pan-x" }}
      className="flex shrink-0 flex-col items-center gap-3"
    >
      <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[13px] font-medium text-white">
        <span className="size-4 shrink-0">
          <AppIcon app={app} />
        </span>
        {app.name}
      </div>
      <div className="bg-window-canvas flex h-[55vh] w-[62vw] max-w-72 items-center justify-center rounded-[28px] shadow-2xl">
        <span className="w-20">
          <AppIcon app={app} />
        </span>
      </div>
    </motion.div>
  );
}
