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
import type { AppDefinition } from "@/lib/apps";
import {
  DOCK_ICON_MAGNIFIED_SIZE,
  DOCK_ICON_REST_SIZE,
  DOCK_MAGNIFICATION_DISTANCE,
  DOCK_MAGNIFICATION_SPRING,
  DOCK_TOOLTIP_DELAY_S,
} from "@/lib/dock";
import { useDockIconStore } from "@/stores/useDockIconStore";
import { useWindowStore } from "@/stores/useWindowStore";

type DockIconProps = {
  app: AppDefinition;
  mouseX: MotionValue<number>;
  isOpen: boolean;
};

export function DockIcon({ app, mouseX, isOpen }: DockIconProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const registerIconRef = useDockIconStore((state) => state.registerIconRef);
  const openWindow = useWindowStore((state) => state.openWindow);
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (value) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    return value - (rect.left + rect.width / 2);
  });
  const size = useTransform(
    distance,
    [-DOCK_MAGNIFICATION_DISTANCE, 0, DOCK_MAGNIFICATION_DISTANCE],
    [DOCK_ICON_REST_SIZE, DOCK_ICON_MAGNIFIED_SIZE, DOCK_ICON_REST_SIZE],
  );
  const springSize = useSpring(size, DOCK_MAGNIFICATION_SPRING);

  useEffect(() => {
    registerIconRef(app.id, buttonRef.current);
    return () => registerIconRef(app.id, null);
  }, [app.id, registerIconRef]);

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hovered ? (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, transition: { delay: DOCK_TOOLTIP_DELAY_S } }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.1 } }}
            className="liquid-glass absolute -top-9 rounded-md px-2 py-1 text-xs whitespace-nowrap"
          >
            {app.name}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        aria-label={app.name}
        onClick={() => openWindow(app.id, app.defaultSize)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: reducedMotion ? DOCK_ICON_REST_SIZE : springSize,
          height: reducedMotion ? DOCK_ICON_REST_SIZE : springSize,
        }}
        className="flex items-end justify-center"
      >
        <AppIcon app={app} />
      </motion.button>

      <span
        aria-hidden="true"
        className={`mt-1 size-1 rounded-full bg-foreground transition-opacity ${isOpen ? "opacity-70" : "opacity-0"}`}
      />
    </div>
  );
}
