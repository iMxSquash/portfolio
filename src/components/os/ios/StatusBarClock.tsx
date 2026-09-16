"use client";

import { formatStatusBarClock } from "@/lib/ios";
import { useLiveClock } from "@/lib/use-live-clock";

/**
 * Isolated in its own component so the 1s tick only re-renders this leaf,
 * never the rest of the status bar — same reasoning as the macOS menu bar's
 * `Clock.tsx`.
 */
export function StatusBarClock() {
  const label = useLiveClock(formatStatusBarClock);
  return <span className="tabular-nums">{label ?? " "}</span>;
}
