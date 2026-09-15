"use client";

import {
  createContext,
  useContext,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from "react";

type WindowChromeDragHandlers = {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onDoubleClick: MouseEventHandler<HTMLElement>;
};

type WindowChromeContextValue = {
  focused: boolean;
  /** Same drag/maximize handlers `Window.tsx` uses on its own title bar — spread onto whatever chrome region a `windowStyle: "unified"` app wants draggable (e.g. Finder's toolbar and the top of its sidebar). */
  dragHandlers: WindowChromeDragHandlers;
  /** Pre-built `<TrafficLights>` for the app to place in its own layout. */
  trafficLights: ReactNode;
};

const WindowChromeContext = createContext<WindowChromeContextValue | null>(null);

export function WindowChromeProvider({
  value,
  children,
}: {
  value: WindowChromeContextValue;
  children: ReactNode;
}) {
  return <WindowChromeContext.Provider value={value}>{children}</WindowChromeContext.Provider>;
}

/** Only available inside a `windowStyle: "unified"` app's content tree (see os-window-manager skill). */
export function useWindowChrome(): WindowChromeContextValue {
  const context = useContext(WindowChromeContext);
  if (!context) {
    throw new Error("useWindowChrome must be used within a unified window's content tree");
  }
  return context;
}
