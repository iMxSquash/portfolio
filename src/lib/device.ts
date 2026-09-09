export type OSMode = "macos" | "ios";

export const POINTER_COARSE_QUERY = "(pointer: coarse)";
export const MOBILE_MAX_WIDTH_QUERY = "(max-width: 1024px)";

type MinimalUserAgent = {
  device: { type?: string };
  os: { name?: string };
};

/**
 * Server-side guess from the request User-Agent (via `userAgent()` from
 * `next/server`), used for the first paint before the client can read
 * `matchMedia`.
 *
 * Known limitation: iPadOS Safari sends a desktop-class UA (no "Mobile"
 * token, os.name "Mac OS") by default, so a real iPad is misclassified as
 * "macos" here. It self-corrects on the client via
 * `resolveOSModeFromMediaQueries` (pointer stays "coarse" regardless of UA
 * spoofing), causing a brief flash of the desktop shell on iPad only.
 */
export function resolveOSModeFromUserAgent(ua: MinimalUserAgent): OSMode {
  const isMobileDevice = ua.device.type === "mobile" || ua.device.type === "tablet";
  const isMobileOS = ua.os.name === "iOS" || ua.os.name === "Android";
  return isMobileDevice || isMobileOS ? "ios" : "macos";
}

/** Client-side resolution from live media queries — the source of truth once mounted. */
export function resolveOSModeFromMediaQueries(query: {
  pointerCoarse: boolean;
  isNarrow: boolean;
}): OSMode {
  return query.pointerCoarse || query.isNarrow ? "ios" : "macos";
}
