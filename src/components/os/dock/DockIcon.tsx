"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { AppIcon } from "@/components/os/AppIcon";
import { launchApp, TRASH_APP_ID, type AppDefinition } from "@/lib/apps";
import {
  DOCK_MAGNIFICATION_DISTANCE,
  DOCK_MAGNIFICATION_SPRING,
  DOCK_TOOLTIP_DELAY_S,
} from "@/lib/dock";
import { DOCK_TOOLTIP_GLASS } from "@/lib/glass-presets";
import type { DockSettings } from "@/lib/settings";
import { useLiquidGlass } from "@/lib/use-liquid-glass";
import { useDockIconStore } from "@/stores/useDockIconStore";
import { useWindowStore } from "@/stores/useWindowStore";

type DockIconProps = {
  app: AppDefinition;
  mouseX: MotionValue<number>;
  isOpen: boolean;
  dock: DockSettings;
};

export function DockIcon({ app, mouseX, isOpen, dock }: DockIconProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const registerIconRef = useDockIconStore((state) => state.registerIconRef);
  const openWindow = useWindowStore((state) => state.openWindow);
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  // `external` apps open no window (see os-apps skill), so a launch click
  // needs its own feedback — a real-macOS-style bounce — instead of relying
  // on a window appearing.
  const [bouncing, setBouncing] = useState(false);
  const [tooltipEl, setTooltipEl] = useState<HTMLSpanElement | null>(null);
  useLiquidGlass(tooltipEl, DOCK_TOOLTIP_GLASS);

  const distance = useTransform(mouseX, (value) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    return value - (rect.left + rect.width / 2);
  });
  const size = useTransform(
    distance,
    [-DOCK_MAGNIFICATION_DISTANCE, 0, DOCK_MAGNIFICATION_DISTANCE],
    [dock.iconSize, dock.magnifiedSize, dock.iconSize],
  );
  const springSize = useSpring(size, DOCK_MAGNIFICATION_SPRING);
  // No magnification: a fixed size, no spring at all — real macOS doesn't
  // just clamp the spring's range to zero, it removes the effect entirely.
  const fixedSize = !dock.magnification || reducedMotion;

  useEffect(() => {
    registerIconRef(app.id, buttonRef.current);
    return () => registerIconRef(app.id, null);
  }, [app.id, registerIconRef]);

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hovered ? (
          <motion.span
            ref={setTooltipEl}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, transition: { delay: DOCK_TOOLTIP_DELAY_S } }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.1 } }}
            className="absolute -top-9 px-2 py-1 text-xs whitespace-nowrap"
          >
            {app.name}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        aria-label={app.name}
        onClick={() => {
          if (app.type === "external" && !reducedMotion) setBouncing(true);
          launchApp(app, openWindow);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={bouncing ? { y: [0, -16, 0, -8, 0] } : { y: 0 }}
        onAnimationComplete={() => setBouncing(false)}
        transition={bouncing ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
        style={{
          width: fixedSize ? dock.iconSize : springSize,
          height: fixedSize ? dock.iconSize : springSize,
        }}
        className="flex items-end justify-center"
      >
        <AppIcon app={app} glossOverlay={app.id !== TRASH_APP_ID} />
      </motion.button>

      <span
        aria-hidden="true"
        className={`absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-foreground transition-opacity ${isOpen ? "opacity-70" : "opacity-0"}`}
      />
    </div>
  );
}
