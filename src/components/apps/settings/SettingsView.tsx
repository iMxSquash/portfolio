"use client";

import { useMemo, useState, type ComponentType, type KeyboardEvent } from "react";
import { IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react";
import { ToolbarCluster } from "@/components/os/window/ToolbarCluster";
import { useWindowChrome } from "@/components/os/window/WindowChromeContext";
import { focusListSibling } from "@/lib/arrow-key-nav";
import {
  SIDEBAR_CHROME_GLASS,
  SIDEBAR_CHROME_TINT_DARK,
  SIDEBAR_CHROME_TINT_LIGHT,
} from "@/lib/glass-presets";
import {
  getSettingsPane,
  searchSettingsPanes,
  SETTINGS_PANE_SECTIONS,
  type SettingsPane,
  type SettingsPaneId,
} from "@/lib/settings-panes";
import { useIsDarkMode } from "@/lib/use-is-dark-mode";
import { useLiquidGlass } from "@/lib/use-liquid-glass";
import { AccessibilityPane } from "./panes/AccessibilityPane";
import { AppearancePane } from "./panes/AppearancePane";
import { DesktopAndDockPane } from "./panes/DesktopAndDockPane";
import { GeneralPane } from "./panes/GeneralPane";
import { LiquidGlassPane } from "./panes/LiquidGlassPane";
import { SoundPane } from "./panes/SoundPane";
import { WallpaperPane } from "./panes/WallpaperPane";

const DEFAULT_PANE_ID: SettingsPaneId = "general";

const PANE_COMPONENTS: Record<SettingsPaneId, ComponentType> = {
  general: GeneralPane,
  appearance: AppearancePane,
  "liquid-glass": LiquidGlassPane,
  accessibility: AccessibilityPane,
  "desktop-dock": DesktopAndDockPane,
  wallpaper: WallpaperPane,
  sound: SoundPane,
};

/**
 * Réglages Système: layout copied from `FinderView.tsx` (unified window,
 * flat full-height sidebar carrying the traffic lights, glass toolbar
 * clusters, opaque `bg-window-canvas` content pane) — the whole app is a
 * deliberate visual match with the Finder (see TODO-settings.md). Desktop
 * only, like Finder/Notes.
 */
export function SettingsView() {
  const [history, setHistory] = useState<SettingsPaneId[]>([DEFAULT_PANE_ID]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentPaneId = history[historyIndex];
  const currentPane = getSettingsPane(currentPaneId);
  const CurrentPaneComponent = PANE_COMPONENTS[currentPaneId];

  const [query, setQuery] = useState("");
  const searchResults = useMemo(() => searchSettingsPanes(query), [query]);

  const { trafficLights, dragHandlers } = useWindowChrome();
  const [sidebarEl, setSidebarEl] = useState<HTMLElement | null>(null);

  // Same flat-chrome exception as Finder/Notes, extended to Réglages Système
  // by explicit design decision (see CLAUDE.md) — not itself re-verified
  // against a macOS System Settings screenshot.
  const isDarkMode = useIsDarkMode();
  const sidebarGlass = useMemo(
    () => ({
      ...SIDEBAR_CHROME_GLASS,
      tint: isDarkMode ? SIDEBAR_CHROME_TINT_DARK : SIDEBAR_CHROME_TINT_LIGHT,
    }),
    [isDarkMode],
  );
  useLiquidGlass(sidebarEl, sidebarGlass);

  function navigate(paneId: SettingsPaneId) {
    if (paneId === currentPaneId) return;
    const nextHistory = [...history.slice(0, historyIndex + 1), paneId];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const firstResult = searchResults[0];
      if (firstResult) navigate(firstResult.id);
      return;
    }
    if (event.key === "Escape" && query) {
      // Only claim Escape while there's something to clear — otherwise let
      // it bubble (e.g. to the menu bar's own Escape-closes-menu handler).
      event.stopPropagation();
      setQuery("");
    }
  }

  return (
    <div className="flex h-full min-h-0 text-[13px]">
      <nav
        ref={setSidebarEl}
        aria-label="Panneaux de réglages"
        className="flex w-48 min-w-40 shrink-0 flex-col border-y-0 border-l-0"
      >
        <div
          className="flex h-(--toolbar-height) shrink-0 items-center pl-4 select-none"
          {...dragHandlers}
        >
          {trafficLights}
        </div>

        <div className="px-2.5 pb-2">
          <div className="relative">
            <IconSearch
              size={13}
              stroke={2}
              aria-hidden="true"
              className="text-foreground/45 absolute top-1/2 left-2 -translate-y-1/2"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Rechercher"
              aria-label="Rechercher un réglage"
              className="focus-visible:outline-system-blue w-full rounded-md bg-black/5 py-1 pr-2 pl-6 text-[12px] outline-none focus-visible:outline-2 dark:bg-white/8"
            />
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2"
          onKeyDown={(event) => focusListSibling(event, event.currentTarget, "vertical")}
        >
          {searchResults.length === 0 ? (
            <p className="text-foreground/55 px-3 py-4 text-center text-[12px]">Aucun résultat</p>
          ) : query ? (
            searchResults.map((pane) => (
              <SettingsPaneRow
                key={pane.id}
                pane={pane}
                active={pane.id === currentPaneId}
                onSelect={() => navigate(pane.id)}
              />
            ))
          ) : (
            SETTINGS_PANE_SECTIONS.map((sectionIds, index) => (
              <div key={sectionIds.join("-")} className={index > 0 ? "mt-4" : undefined}>
                {sectionIds.map((id) => {
                  const pane = getSettingsPane(id);
                  return (
                    <SettingsPaneRow
                      key={pane.id}
                      pane={pane}
                      active={pane.id === currentPaneId}
                      onSelect={() => navigate(pane.id)}
                    />
                  );
                })}
              </div>
            ))
          )}
        </div>
      </nav>

      <div className="bg-window-canvas flex min-h-0 flex-1 flex-col">
        <div
          className="flex h-(--toolbar-height) shrink-0 items-center gap-2 px-3 select-none"
          {...dragHandlers}
        >
          <ToolbarCluster>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Précédent"
                disabled={historyIndex === 0}
                onClick={() => setHistoryIndex((index) => Math.max(0, index - 1))}
                className="focus-visible:outline-system-blue rounded-[6px] px-1.5 py-0.5 hover:bg-black/4 focus-visible:outline-2 disabled:opacity-30 dark:hover:bg-white/4"
              >
                <IconChevronLeft size={12} stroke={3} />
              </button>
              <button
                type="button"
                aria-label="Suivant"
                disabled={historyIndex === history.length - 1}
                onClick={() => setHistoryIndex((index) => Math.min(history.length - 1, index + 1))}
                className="focus-visible:outline-system-blue rounded-[6px] px-1.5 py-0.5 hover:bg-black/4 focus-visible:outline-2 disabled:opacity-30 dark:hover:bg-white/4"
              >
                <IconChevronRight size={12} stroke={3} />
              </button>
            </div>
          </ToolbarCluster>

          <h1 className="font-semibold">{currentPane.label}</h1>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <CurrentPaneComponent />
        </div>
      </div>
    </div>
  );
}

function SettingsPaneRow({
  pane,
  active,
  onSelect,
}: {
  pane: SettingsPane;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = pane.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`focus-visible:outline-system-blue flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left focus-visible:-outline-offset-2 focus-visible:outline-2 ${
        active ? "bg-black/6 dark:bg-white/7" : "hover:bg-black/4 dark:hover:bg-white/4"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] ${pane.iconColor}`}
      >
        <Icon className="size-3.5 text-white" />
      </span>
      <span className="truncate">{pane.label}</span>
    </button>
  );
}
