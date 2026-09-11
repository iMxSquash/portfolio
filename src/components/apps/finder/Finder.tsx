"use client";

import { useMemo, useState } from "react";
import { FolderIcon } from "@/components/icons/FolderIcon";
import {
  getDesktopApps,
  getProjectApps,
  getSystemComponentApps,
  SYSTEM_APPS,
  type AppDefinition,
} from "@/lib/apps";
import { FINDER_FAVORITES, type FinderFavoriteId } from "@/lib/finder";
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
      <div className="flex shrink-0 items-center gap-2 border-b border-black/10 px-2 py-1.5 dark:border-white/10">
        <button
          type="button"
          aria-label="Précédent"
          disabled={historyIndex === 0}
          onClick={() => setHistoryIndex((index) => Math.max(0, index - 1))}
          className="rounded px-1.5 py-0.5 disabled:opacity-30"
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          aria-label="Suivant"
          disabled={historyIndex === history.length - 1}
          onClick={() => setHistoryIndex((index) => Math.min(history.length - 1, index + 1))}
          className="rounded px-1.5 py-0.5 disabled:opacity-30"
        >
          <ChevronIcon direction="right" />
        </button>

        <span className="font-semibold">{currentFavorite?.label}</span>

        <div className="ml-auto flex items-center gap-1 rounded-md bg-black/5 p-0.5 dark:bg-white/10">
          <button
            type="button"
            aria-label="Vue en icônes"
            aria-pressed={viewMode === "icons"}
            onClick={() => setViewMode("icons")}
            className={`rounded px-2 py-0.5 ${viewMode === "icons" ? "bg-white shadow-sm dark:bg-white/20" : ""}`}
          >
            ⊞
          </button>
          <button
            type="button"
            aria-label="Vue en liste"
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
            className={`rounded px-2 py-0.5 ${viewMode === "list" ? "bg-white shadow-sm dark:bg-white/20" : ""}`}
          >
            ☰
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <nav className="w-40 min-w-32 shrink-0 overflow-y-auto border-r border-black/10 bg-black/[0.02] py-2 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-foreground/40 px-3 pb-1 text-[11px] font-medium">Favoris</p>
          {FINDER_FAVORITES.map((favorite) => (
            <button
              key={favorite.id}
              type="button"
              onClick={() => navigate(favorite.id)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left ${
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

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 4 7 12l8 8" : "M9 4l8 8-8 8"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
