"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { IconChevronLeft, IconChevronRight, IconLayoutGrid, IconList } from "@tabler/icons-react";
import { FolderIcon } from "@/components/icons/FolderIcon";
import {
  getDesktopApps,
  getProjectApps,
  getSystemComponentApps,
  SYSTEM_APPS,
  type AppDefinition,
} from "@/lib/apps";
import { FINDER_FAVORITES, type FinderFavoriteId } from "@/lib/finder";
import { useLiquidGlassRefraction } from "@/lib/use-liquid-glass-refraction";
import { useLiquidGlassStore } from "@/stores/useLiquidGlassStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { FileGrid, type FileGridItem, type FinderViewMode } from "./FileGrid";

/**
 * Sidebar is a larger element (per apple-design skill: Materials — Color)
 * so it goes more opaque than the base `liquid-glass` default, to stay
 * legible over the projects/apps grid scrolling behind it.
 */
const SIDEBAR_TINT = {
  "--glass-tint-alpha": "18%",
  "--glass-tint-alpha-dark": "50%",
} as CSSProperties;

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
  const [sidebarEl, setSidebarEl] = useState<HTMLElement | null>(null);
  const glassParams = useLiquidGlassStore((state) => state.params);
  // Sidebar is an actionable nav surface — refraction defaults on, aberration
  // stays 0 (Dock + Spotlight already spend the 1-2-element chromatic budget).
  useLiquidGlassRefraction(sidebarEl, {
    scale: glassParams.refractScale,
    aberration: 0,
    mode: glassParams.refractMode,
  });

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
    <div className="flex h-full min-h-0 flex-col text-[13px]">
      <div className="liquid-glass glass-hairline flex shrink-0 items-center gap-2 rounded-none border-x-0 border-t-0 px-2 py-1.5">
        <button
          type="button"
          aria-label="Précédent"
          disabled={historyIndex === 0}
          onClick={() => setHistoryIndex((index) => Math.max(0, index - 1))}
          className="rounded px-1.5 py-0.5 focus-visible:outline-2 focus-visible:outline-system-blue disabled:opacity-30"
        >
          <IconChevronLeft size={12} stroke={3} />
        </button>
        <button
          type="button"
          aria-label="Suivant"
          disabled={historyIndex === history.length - 1}
          onClick={() => setHistoryIndex((index) => Math.min(history.length - 1, index + 1))}
          className="rounded px-1.5 py-0.5 focus-visible:outline-2 focus-visible:outline-system-blue disabled:opacity-30"
        >
          <IconChevronRight size={12} stroke={3} />
        </button>

        <span className="font-semibold">{currentFavorite?.label}</span>

        {/* Flat segmented control sitting on the already-glass toolbar — no
            second blur layer (see apple-design skill: nested translucent
            layers is an anti-pattern). */}
        <div className="ml-auto flex items-center gap-1 rounded-md bg-black/10 p-0.5 dark:bg-white/15">
          <button
            type="button"
            aria-label="Vue en icônes"
            aria-pressed={viewMode === "icons"}
            onClick={() => setViewMode("icons")}
            className={`focus-visible:outline-system-blue rounded px-2 py-0.5 focus-visible:outline-2 ${viewMode === "icons" ? "bg-white shadow-sm dark:bg-white/20" : ""}`}
          >
            <IconLayoutGrid size={14} stroke={2} />
          </button>
          <button
            type="button"
            aria-label="Vue en liste"
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
            className={`focus-visible:outline-system-blue rounded px-2 py-0.5 focus-visible:outline-2 ${viewMode === "list" ? "bg-white shadow-sm dark:bg-white/20" : ""}`}
          >
            <IconList size={14} stroke={2} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <nav
          ref={setSidebarEl}
          className="liquid-glass w-40 min-w-32 shrink-0 rounded-none border-y-0 border-l-0 py-2"
          style={SIDEBAR_TINT}
        >
          <p className="text-foreground/40 px-3 pb-1 text-[11px] font-medium">Favoris</p>
          {FINDER_FAVORITES.map((favorite) => (
            <button
              key={favorite.id}
              type="button"
              onClick={() => navigate(favorite.id)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-system-blue ${
                favorite.id === currentFavoriteId
                  ? "bg-system-blue/20 dark:bg-system-blue/25"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <FolderIcon />
              <span className="truncate">{favorite.label}</span>
            </button>
          ))}
        </nav>

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
