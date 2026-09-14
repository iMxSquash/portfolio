"use client";

import { FinderView } from "./FinderView";

/** The Finder app — opens on the Projets favorite (see FinderView.tsx). */
export function Finder() {
  return <FinderView initialFavoriteId="projects" />;
}
