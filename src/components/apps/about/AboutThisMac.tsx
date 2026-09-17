"use client";

import { SiteLogo } from "@/components/icons/SiteLogo";
import { launchApp } from "@/lib/apps";
import { DISPLAY_NAME } from "@/lib/boot";
import { SITE_TAGLINE } from "@/lib/seo";
import { useAppsStore } from "@/stores/useAppsStore";
import { useWindowStore } from "@/stores/useWindowStore";

/**
 * Easter egg (see TODO.md Phase 9): a real macOS "About This Mac" panel,
 * specs replaced with tongue-in-cheek personal ones. Opened from the Apple
 * menu — see `APPLE_MENU_ITEMS` / `MenuBar.tsx`.
 */
const SPEC_ROWS: Array<{ label: string; value: string }> = [
  { label: "Puce", value: "Café, 3 shots/jour" },
  { label: "Mémoire", value: "Illimitée (⌘Z compris)" },
  { label: "Stockage", value: "127 onglets Chrome ouverts" },
  { label: "Numéro de série", value: "ELWN-2026-DEV" },
  { label: "Système d'exploitation", value: "Elwen OS 26.0" },
];

export function AboutThisMac() {
  const openWindow = useWindowStore((state) => state.openWindow);

  // Read at click time rather than subscribing: this button is the only
  // consumer, so there's no reason to re-render the whole panel on every
  // unrelated apps-store update.
  function openNotes() {
    const notesApp = useAppsStore.getState().apps.find((app) => app.id === "notes");
    if (notesApp) launchApp(notesApp, openWindow);
  }

  return (
    <div className="flex h-full flex-col items-center gap-4 px-8 pt-6 pb-8 text-center">
      <SiteLogo size={64} />

      <div>
        <p className="text-lg font-semibold">{DISPLAY_NAME}</p>
        <p className="text-foreground/60 text-sm">{SITE_TAGLINE}</p>
      </div>

      <dl className="w-full divide-y divide-black/10 rounded-lg border border-black/10 text-left text-[13px] dark:divide-white/10 dark:border-white/15">
        {SPEC_ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-2">
            <dt className="text-foreground/60">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={openNotes}
        className="hover:bg-foreground/5 focus-visible:outline-system-blue mt-auto rounded-full border border-black/10 px-4 py-1.5 text-[13px] font-medium focus-visible:outline-2 dark:border-white/15"
      >
        Plus d&rsquo;infos…
      </button>
    </div>
  );
}
