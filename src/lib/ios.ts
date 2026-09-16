import { getMobileApps, type AppDefinition } from "./apps";

/** Internal iPadOS-style breakpoint distinguishing phone vs tablet springboard grids (see os-ios-ui skill). */
export const IOS_TABLET_MIN_WIDTH_QUERY = "(min-width: 768px)";

/** Springboard grid capacity per breakpoint — apps beyond one page's capacity spill onto the next page. */
export const SPRINGBOARD_COLUMNS_PHONE = 4;
export const SPRINGBOARD_MAX_ROWS_PHONE = 5;
export const SPRINGBOARD_COLUMNS_TABLET = 6;
export const SPRINGBOARD_MAX_ROWS_TABLET = 4;

/** Max apps pinned in the iOS dock (see os-ios-ui skill: "4 icônes max"). */
export const IOS_DOCK_MAX_APPS = 4;

/** Splits `items` into springboard pages of `pageSize` each (always at least one, possibly empty, page). */
export function chunkIntoPages<T>(items: T[], pageSize: number): T[][] {
  if (pageSize <= 0 || items.length === 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
}

/**
 * iOS dock apps: the first `IOS_DOCK_MAX_APPS` mobile-visible apps in
 * registry order. Scales with Phase 7's Supabase-sourced projects without a
 * dedicated registry flag — the dock always keeps its 4-icon budget, the
 * springboard (every mobile app via `getMobileApps`, dock ones included —
 * real iOS allows an app to live in both places at once) paginates
 * whatever's left.
 */
export function getIOSDockApps(apps: AppDefinition[]): AppDefinition[] {
  return getMobileApps(apps).slice(0, IOS_DOCK_MAX_APPS);
}

/**
 * `padding-top`/`height` shared by every iOS surface that must clear the
 * status bar (see os-ios-ui skill) — the one place this `calc()` is spelled
 * out, composed further where a surface needs more clearance (e.g. the
 * springboard's extra breathing room above its icons).
 */
export const IOS_STATUS_BAR_CLEARANCE =
  "calc(var(--ios-status-bar-height) + env(safe-area-inset-top))";

/**
 * Shared `layoutId` morph between a springboard icon and its full-screen app
 * (see `SpringboardIcon.tsx` / `AppFullScreenView.tsx`) — both ends need the
 * same explicit spring, matching the macOS window chrome's own feel. Pass it
 * as `transition={{ layout: ... }}`, not a bare `transition={...}` — a
 * `layoutId` FLIP is a *layout* animation, which Framer only picks the given
 * spring for under that nested key; a bare `transition` prop is silently
 * ignored for it and it falls back to Framer's default spring, which
 * settles closer to 600ms+ — long enough that a quick second tap (opening a
 * different app right after closing one) can land while the previous view
 * is still mid-exit, showing both at once.
 */
export const IOS_MORPH_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
} as const;
export const IOS_MORPH_TRANSITION_REDUCED = { type: "tween", duration: 0 } as const;

const STATUS_BAR_TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

/** iOS status-bar clock format, e.g. "9:41" — time only, unlike the macOS menu bar's date+time (see formatMenuBarClock). */
export function formatStatusBarClock(date: Date): string {
  return date.toLocaleTimeString("fr-FR", STATUS_BAR_TIME_FORMAT);
}

const LOCK_SCREEN_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
};

/** iOS lock screen date, e.g. "mardi 15 septembre" — shown under the large clock. */
export function formatLockScreenDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", LOCK_SCREEN_DATE_FORMAT);
}
