"use client";

import { useEffect, useState } from "react";

/**
 * Ticks the current `Date` every second — the shared tick behind
 * `useLiveClock` below. Exposed on its own for a caller that needs more than
 * one formatted value off the same clock (see `LockScreen.tsx`'s time + date,
 * which would otherwise run two separate 1s intervals for one underlying
 * value). `null` until mounted, so the server's clock (absent) never
 * mismatches the client's on hydration.
 */
export function useLiveDate(): Date | null {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setDate(new Date());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return date;
}

/**
 * Ticks `format(new Date())` every second. Callers isolate this in their own
 * small leaf component (see `Clock.tsx`, `StatusBarClock.tsx`) so the 1s
 * re-render never bubbles up into a larger bar.
 */
export function useLiveClock(format: (date: Date) => string): string | null {
  const date = useLiveDate();
  return date ? format(date) : null;
}
