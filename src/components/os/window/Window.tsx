"use client";

import { useMemo, useRef } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import type { AppDefinition } from "@/lib/apps";
import {
  WINDOW_OPEN_TRANSITION,
  WINDOW_CLOSE_TRANSITION,
  WINDOW_SPRING,
  WINDOW_SPRING_REDUCED,
  applyResize,
  clampDragPosition,
  computeMaximizedBounds,
  type Bounds,
  type Position,
  type ResizeDirection,
} from "@/lib/window";
import { useDockIconStore } from "@/stores/useDockIconStore";
import { useWindowStore, type WindowState } from "@/stores/useWindowStore";
import { ResizeHandles } from "./ResizeHandles";
import { TrafficLights } from "./TrafficLights";

const MINIMIZE_SCALE = 0.05;
/** 3 traffic lights + 2 gaps — mirrors the left group so the title stays visually centered. */
const TRAFFIC_LIGHTS_WIDTH = "calc(3 * var(--traffic-light-size) + 2 * var(--traffic-light-gap))";

type WindowProps = {
  app: AppDefinition;
  state: WindowState;
  children: ReactNode;
};

export function Window({ app, state, children }: WindowProps) {
  const focusedAppId = useWindowStore((s) => s.focusedAppId);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const setBounds = useWindowStore((s) => s.setBounds);
  const setInteracting = useWindowStore((s) => s.setInteracting);

  const reducedMotion = useReducedMotion();
  const focused = focusedAppId === app.id;

  const x = useMotionValue(state.position.x);
  const y = useMotionValue(state.position.y);
  const width = useMotionValue(state.size.width);
  const height = useMotionValue(state.size.height);

  const dragRef = useRef<{
    pointerId: number;
    startPointer: Position;
    startPosition: Position;
  } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    direction: ResizeDirection;
    startPointer: Position;
    startBounds: Bounds;
  } | null>(null);

  // Opens from wherever it was launched — the registered dock/desktop icon rect once
  // Phase 3 exists, a plain center scale+fade until then (see useDockIconStore).
  const openOrigin = useMemo(() => {
    if (typeof window === "undefined") return null;
    const rect = useDockIconStore.getState().getIconRect(app.id);
    if (!rect) return null;
    return {
      x: rect.left + rect.width / 2 - state.size.width / 2,
      y: rect.top + rect.height / 2 - state.size.height / 2,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the position at mount matters
  }, []);

  // Where the window shrinks to on minimize: the registered dock icon rect once Phase 3
  // builds the dock, a bottom-center fallback point until then (see useDockIconStore).
  const minimizeTarget = useMemo(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const rect = useDockIconStore.getState().getIconRect(app.id);
    const center = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight - 24 };
    return { x: center.x - state.size.width / 2, y: center.y - state.size.height / 2 };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute only when it starts minimizing
  }, [app.id, state.isMinimized]);

  const animateTarget = state.isMinimized
    ? {
        x: minimizeTarget.x,
        y: minimizeTarget.y,
        width: state.size.width,
        height: state.size.height,
        scale: MINIMIZE_SCALE,
        opacity: 0,
      }
    : {
        x: state.position.x,
        y: state.position.y,
        width: state.size.width,
        height: state.size.height,
        scale: 1,
        opacity: 1,
      };

  const transition = reducedMotion
    ? WINDOW_SPRING_REDUCED
    : {
        x: WINDOW_SPRING,
        y: WINDOW_SPRING,
        width: WINDOW_SPRING,
        height: WINDOW_SPRING,
        scale: WINDOW_OPEN_TRANSITION,
        opacity: WINDOW_OPEN_TRANSITION,
      };

  function handleToggleMaximize() {
    toggleMaximize(
      app.id,
      computeMaximizedBounds({ width: window.innerWidth, height: window.innerHeight }),
    );
  }

  function handleTitleBarPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (state.isMaximized) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setInteracting(true);
    dragRef.current = {
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startPosition: { x: x.get(), y: y.get() },
    };
  }

  function handleTitleBarPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const raw = {
      x: drag.startPosition.x + (event.clientX - drag.startPointer.x),
      y: drag.startPosition.y + (event.clientY - drag.startPointer.y),
    };
    const clamped = clampDragPosition(
      raw,
      { width: width.get(), height: height.get() },
      { width: window.innerWidth, height: window.innerHeight },
    );
    x.set(clamped.x);
    y.set(clamped.y);
  }

  function handleTitleBarPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setInteracting(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    setBounds(app.id, { position: { x: x.get(), y: y.get() } });
  }

  function handleTitleBarDoubleClick(event: ReactMouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    handleToggleMaximize();
  }

  function handleResizeStart(direction: ResizeDirection, event: ReactPointerEvent) {
    (event.target as Element).setPointerCapture(event.pointerId);
    setInteracting(true);
    resizeRef.current = {
      pointerId: event.pointerId,
      direction,
      startPointer: { x: event.clientX, y: event.clientY },
      startBounds: {
        position: { x: x.get(), y: y.get() },
        size: { width: width.get(), height: height.get() },
      },
    };
  }

  function handleResizeMove(event: ReactPointerEvent) {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    const delta = {
      dx: event.clientX - resize.startPointer.x,
      dy: event.clientY - resize.startPointer.y,
    };
    const next = applyResize(resize.direction, resize.startBounds, delta, app.minSize);
    x.set(next.position.x);
    y.set(next.position.y);
    width.set(next.size.width);
    height.set(next.size.height);
  }

  function handleResizeEnd(event: ReactPointerEvent) {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    setInteracting(false);
    (event.target as Element).releasePointerCapture(event.pointerId);
    setBounds(app.id, {
      position: { x: x.get(), y: y.get() },
      size: { width: width.get(), height: height.get() },
    });
  }

  return (
    <motion.div
      role="dialog"
      aria-label={app.name}
      aria-hidden={state.isMinimized}
      data-app-id={app.id}
      onPointerDown={() => focusWindow(app.id)}
      className={`rounded-window absolute flex touch-none flex-col overflow-hidden ${
        focused ? "shadow-window-focused" : "shadow-window-unfocused"
      }`}
      style={{
        x,
        y,
        width,
        height,
        zIndex: state.zIndex,
        pointerEvents: state.isMinimized ? "none" : "auto",
      }}
      initial={
        openOrigin
          ? { opacity: 0, scale: 0.1, x: openOrigin.x, y: openOrigin.y }
          : { opacity: 0, scale: 0.9 }
      }
      animate={animateTarget}
      exit={{
        opacity: 0,
        scale: 0.92,
        transition: reducedMotion ? WINDOW_SPRING_REDUCED : WINDOW_CLOSE_TRANSITION,
      }}
      transition={transition}
    >
      <div
        className={`flex h-(--title-bar-height-min) shrink-0 touch-none items-center border-b px-2 select-none ${
          focused
            ? "border-black/10 bg-black/2 dark:border-white/10 dark:bg-white/5"
            : "border-black/5 bg-black/1 dark:border-white/5 dark:bg-white/2"
        }`}
        onPointerDown={handleTitleBarPointerDown}
        onPointerMove={handleTitleBarPointerMove}
        onPointerUp={handleTitleBarPointerUp}
        onDoubleClick={handleTitleBarDoubleClick}
      >
        <TrafficLights
          focused={focused}
          onClose={() => closeWindow(app.id)}
          onMinimize={() => minimizeWindow(app.id)}
          onToggleMaximize={handleToggleMaximize}
        />
        <span className="flex-1 truncate px-2 text-center text-[13px] font-semibold">
          {app.name}
        </span>
        <div style={{ width: TRAFFIC_LIGHTS_WIDTH }} aria-hidden />
      </div>

      <div className="bg-background text-foreground relative flex-1 touch-auto overflow-auto">
        {children}
      </div>

      <ResizeHandles
        onResizeStart={handleResizeStart}
        onResizeMove={handleResizeMove}
        onResizeEnd={handleResizeEnd}
      />
    </motion.div>
  );
}
