"use client";

import { useEffect, useState } from "react";

/** Subscribes to a `matchMedia` query, updating on `change`. `false` until mounted (no server-side match). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
