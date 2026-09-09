import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client (synchronous, before paint — needed to
 * correct SSR-guessed state with zero visible flash), falls back to
 * `useEffect` on the server to avoid React's "useLayoutEffect does nothing
 * on the server" warning (the effect body never runs during SSR either way).
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
