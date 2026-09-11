export type FinderFavoriteId = "projects" | "applications" | "desktop";

export type FinderFavorite = { id: FinderFavoriteId; label: string };

/** Sidebar favorites — each maps to an apps-registry slice (see Finder.tsx). */
export const FINDER_FAVORITES: FinderFavorite[] = [
  { id: "projects", label: "Projets" },
  { id: "applications", label: "Applications" },
  { id: "desktop", label: "Bureau" },
];
