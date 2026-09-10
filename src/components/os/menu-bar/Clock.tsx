"use client";

import { useEffect, useState } from "react";
import { formatMenuBarClock } from "@/lib/menu-bar";

/**
 * Isolated in its own component so the 1s tick only re-renders this leaf,
 * never the rest of the menu bar. `null` until mounted to avoid a
 * server/client hydration mismatch (the server's clock would differ from
 * the client's).
 */
export function Clock() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setLabel(formatMenuBarClock(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="tabular-nums">{label ?? " "}</span>;
}
