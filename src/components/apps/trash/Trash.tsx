"use client";

import { FinderView } from "@/components/apps/finder/FinderView";

/** The Trash is technically a Finder window pre-navigated to Corbeille (see os-apps skill). */
export function Trash() {
  return <FinderView initialFavoriteId="trash" />;
}
