import type { ComponentType } from "react";
import { FolderIcon } from "@/components/icons/FolderIcon";
import { TrashGlyphIcon } from "@/components/icons/TrashGlyphIcon";

export type FinderFavoriteId = "projects" | "applications" | "desktop" | "trash";

export type FinderFavorite = {
  id: FinderFavoriteId;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

/**
 * Sidebar favorites — each maps to a content source in `FinderView.tsx`
 * ("trash" reads `useTrashStore` instead of the apps registry). Shared by
 * both the Finder and Trash windows (see os-apps skill: Corbeille is a
 * Finder window pre-navigated to this last entry) — single source of truth
 * for the nav so both stay in sync.
 */
export const FINDER_FAVORITES: FinderFavorite[] = [
  { id: "projects", label: "Projets", icon: FolderIcon },
  { id: "applications", label: "Applications", icon: FolderIcon },
  { id: "desktop", label: "Bureau", icon: FolderIcon },
  { id: "trash", label: "Corbeille", icon: TrashGlyphIcon },
];
