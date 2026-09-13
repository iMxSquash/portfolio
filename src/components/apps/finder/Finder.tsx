"use client";

import { useMemo, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconLayoutGrid, IconList } from "@tabler/icons-react";
import { FolderIcon } from "@/components/icons/FolderIcon";
import { useWindowChrome } from "@/components/os/window/WindowChromeContext";
import {
  getDesktopApps,
  getProjectApps,
  getSystemComponentApps,
  SYSTEM_APPS,
  type AppDefinition,
} from "@/lib/apps";
import { FINDER_FAVORITES, type FinderFavoriteId } from "@/lib/finder";
import { FINDER_SIDEBAR_MATERIAL } from "@/lib/liquid-glass";
import { useLiquidGlassRefraction } from "@/lib/use-liquid-glass-refraction";
import { useLiquidGlassStore } from "@/stores/useLiquidGlassStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { FileGrid, type FileGridItem, type FinderViewMode } from "./FileGrid";

const EMPTY_LABELS: Record<FinderFavoriteId, string> = {
  projects: "Aucun projet pour le moment",
  applications: "Aucune application",
  desktop: "Le bureau est vide",
};

/**
 * Finder clone: sidebar favorites (Projets/Applications/Bureau) resolved
 * against the apps registry, toolbar back/forward + icons/list toggle, main
 * pane via the shared `FileGrid`. Desktop only (see os-apps skill).
 */
export function Finder() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const [history, setHistory] = useState<FinderFavoriteId[]>(["projects"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<FinderViewMode>("icons");
  const { trafficLights, dragHandlers } = useWindowChrome();
  const [backForwardEl, setBackForwardEl] = useState<HTMLElement | null>(null);
  const [viewToggleEl, setViewToggleEl] = useState<HTMLElement | null>(null);
  const glassParams = useLiquidGlassStore((state) => state.params);
  // Toolbar controls are individually actionable Liquid Glass pills — the
  // toolbar itself carries no material (see apple-design skill: a full-width
  // bar is background chrome, not a control, but the controls sitting on it
  // still default to refraction). The sidebar, by contrast, is verified
  // against real macOS Finder to be flat window chrome with no lens — it
  // does not get refraction (see FINDER_SIDEBAR_MATERIAL).
  const refractionOptions = useMemo(
    () => ({
      scale: glassParams.refractScale,
      aberration: 0,
      mode: glassParams.refractMode,
    }),
    [glassParams.refractScale, glassParams.refractMode],
  );
  useLiquidGlassRefraction(backForwardEl, refractionOptions);
  useLiquidGlassRefraction(viewToggleEl, refractionOptions);

  const currentFavoriteId = history[historyIndex];

  function navigate(favoriteId: FinderFavoriteId) {
    if (favoriteId === currentFavoriteId) return;
    const nextHistory = [...history.slice(0, historyIndex + 1), favoriteId];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }

  function appToFileItem(app: AppDefinition): FileGridItem {
    return {
      id: app.id,
      name: app.name,
      icon: app.icon,
      kind: appKindLabel(app),
      onOpen: () => {
        if (app.type === "external") {
          window.open(app.url, "_blank", "noopener");
          return;
        }
        openWindow(app.id, app.defaultSize);
      },
    };
  }

  const items = useMemo(() => {
    switch (currentFavoriteId) {
      case "projects":
        return getProjectApps(SYSTEM_APPS).map(appToFileItem);
      case "applications":
        return getSystemComponentApps(SYSTEM_APPS).map(appToFileItem);
      case "desktop":
        return getDesktopApps(SYSTEM_APPS).map(appToFileItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- appToFileItem closes over stable openWindow
  }, [currentFavoriteId]);

  const currentFavorite = FINDER_FAVORITES.find((favorite) => favorite.id === currentFavoriteId);

  return (
    <div className="flex h-full min-h-0 text-[13px]">
      {/* Sidebar is flat window chrome (no refraction — verified against real
          macOS Finder), pleine hauteur, carries the traffic lights in its own
          top row so it reads as one continuous surface with the window's
          leading edge instead of sitting under a separate title bar. */}
      <nav
        className="liquid-glass glass-edge-bleed relative flex w-40 min-w-32 shrink-0 flex-col rounded-none border-y-0 border-l-0"
        style={FINDER_SIDEBAR_MATERIAL}
      >
        <div
          className="flex h-(--toolbar-height) shrink-0 items-center pl-4 select-none"
          {...dragHandlers}
        >
          {trafficLights}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <p className="text-foreground/55 px-3 pb-1 text-[11px] font-medium">Favoris</p>
          {FINDER_FAVORITES.map((favorite) => (
            <button
              key={favorite.id}
              type="button"
              onClick={() => navigate(favorite.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-system-blue ${
                favorite.id === currentFavoriteId
                  ? "bg-black/6 text-system-blue font-medium dark:bg-white/7"
                  : "hover:bg-black/4 dark:hover:bg-white/4"
              }`}
            >
              <FolderIcon />
              <span className="truncate">{favorite.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="bg-window-canvas flex min-h-0 flex-1 flex-col">
        {/* No material of its own — real macOS Finder's toolbar sits directly
            on the opaque content pane. Individual controls below still get
            their own Liquid Glass + refraction (they're actionable). */}
        <div
          className="flex h-(--toolbar-height) shrink-0 items-center gap-2 px-3 select-none"
          {...dragHandlers}
        >
          <div
            ref={setBackForwardEl}
            className="liquid-glass flex items-center gap-0.5 rounded-[8px] p-0.5"
          >
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

          <span className="font-semibold">{currentFavorite?.label}</span>

          <div
            ref={setViewToggleEl}
            className="liquid-glass ml-auto flex items-center gap-1 rounded-[8px] p-0.5"
          >
            <button
              type="button"
              aria-label="Vue en icônes"
              aria-pressed={viewMode === "icons"}
              onClick={() => setViewMode("icons")}
              className={`focus-visible:outline-system-blue rounded-[6px] px-2 py-0.5 focus-visible:outline-2 ${viewMode === "icons" ? "bg-black/8 dark:bg-white/9" : ""}`}
            >
              <IconLayoutGrid size={14} stroke={2} />
            </button>
            <button
              type="button"
              aria-label="Vue en liste"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`focus-visible:outline-system-blue rounded-[6px] px-2 py-0.5 focus-visible:outline-2 ${viewMode === "list" ? "bg-black/8 dark:bg-white/9" : ""}`}
            >
              <IconList size={14} stroke={2} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <FileGrid
            items={items}
            viewMode={viewMode}
            emptyLabel={EMPTY_LABELS[currentFavoriteId]}
          />
        </div>
      </div>
    </div>
  );
}

function appKindLabel(app: AppDefinition): string {
  switch (app.type) {
    case "component":
      return "Application";
    case "iframe":
      return "Projet";
    case "external":
      return "Lien externe";
  }
}
