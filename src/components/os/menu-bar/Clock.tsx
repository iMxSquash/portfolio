"use client";

import { formatMenuBarClock } from "@/lib/menu-bar";
import { useLiveClock } from "@/lib/use-live-clock";

/**
 * Isolated in its own component so the 1s tick only re-renders this leaf,
 * never the rest of the menu bar.
 */
export function Clock() {
  const label = useLiveClock(formatMenuBarClock);
  return <span className="tabular-nums">{label ?? " "}</span>;
}
