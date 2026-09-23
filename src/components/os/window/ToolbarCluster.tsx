"use client";

import { useState, type ReactNode } from "react";
import { FINDER_TOOLBAR_CLUSTER_GLASS } from "@/lib/glass-presets";
import { useLiquidGlass } from "@/lib/use-liquid-glass";

/**
 * Individually actionable Liquid Glass pill wrapper for a unified window's
 * own toolbar (back/forward group, view-mode toggle, empty-trash…) — see
 * apple-design skill. Shared by Finder/Trash (`FinderView.tsx`) and Réglages
 * Système (`SettingsView.tsx`) rather than duplicated per app.
 */
export function ToolbarCluster({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useLiquidGlass(el, FINDER_TOOLBAR_CLUSTER_GLASS);
  return (
    <div ref={setEl} className="p-0.5">
      {children}
    </div>
  );
}
