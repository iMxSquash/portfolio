import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { AboutThisMacIcon } from "@/components/apps/about/AboutThisMacIcon";
import { FinderIcon } from "@/components/apps/finder/FinderIcon";
import { NotesIcon } from "@/components/apps/notes/NotesIcon";
import { TerminalIcon } from "@/components/apps/terminal/TerminalIcon";
import { TrashIcon } from "@/components/apps/trash/TrashIcon";
import type { Size } from "@/lib/window";

export type MenuItemDefinition = {
  label: string;
  shortcut?: string;
};

export type MenuSeparatorDefinition = {
  separator: true;
};

export type MenuEntryDefinition = MenuItemDefinition | MenuSeparatorDefinition;

export type MenuDefinition = {
  label: string;
  items: MenuEntryDefinition[];
};

export function isMenuSeparator(entry: MenuEntryDefinition): entry is MenuSeparatorDefinition {
  return "separator" in entry;
}

/**
 * Everything openable (system app, iframe project, external link) is
 * declared as an `AppDefinition`. Desktop, dock, Finder and the iOS
 * springboard only read this registry — never a duplicated app list.
 */
export type AppDefinition = {
  id: string;
  name: string;
  icon: ComponentType | string;
  type: "component" | "iframe" | "external";
  /** For type 'component' — always loaded via next/dynamic at the call site. */
  component?: ComponentType;
  /**
   * Optional iOS full-screen replacement for `component` (see os-ios-ui
   * skill) — some apps need a genuinely different layout in a single
   * full-screen view than in a resizable desktop window (Notes' stacked
   * list/note nav vs. its 3-column desktop layout), not just a responsive
   * version of the same component. Falls back to `component` when unset.
   */
  mobileComponent?: ComponentType;
  /** For type 'iframe' (subdomain) or 'external'. */
  url?: string;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  pinnedToDock?: boolean;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  menus?: MenuDefinition[];
  /**
   * Structural window chrome (see os-window-manager skill). `"standard"`
   * (default) keeps the classic full-width title bar. `"unified"` removes
   * it — the app renders its own leading chrome (a full-height sidebar) and
   * receives the traffic lights + window-drag handlers via
   * `useWindowChrome()`. Reserved for apps whose own layout has somewhere
   * for the traffic lights to live; verified against real macOS Finder.
   */
  windowStyle?: "standard" | "unified";
  /**
   * A true system panel (only "About This Mac" today), not a browsable app —
   * real macOS never lists it in Finder/Applications and never shows it in
   * the Dock, even while its window is open. Excluded from
   * `getSystemComponentApps` and from the Dock's running-apps list (see
   * `Dock.tsx`) by this one flag rather than by id in each consumer.
   */
  isSystemPanel?: boolean;
};

/**
 * Well-known id for the Trash app. The dock special-cases it to always
 * render last, after the running/minimized windows section, matching real
 * macOS — see `Dock.tsx`.
 */
export const TRASH_APP_ID = "trash";

/** Well-known id for the "About This Mac" easter egg (see os-apps skill / TODO.md Phase 9) — looked up to open it from the Apple menu, see `MenuBar.tsx`. */
export const ABOUT_THIS_MAC_APP_ID = "about-this-mac";

const Finder = dynamic(() => import("@/components/apps/finder/Finder").then((mod) => mod.Finder));
const Notes = dynamic(() => import("@/components/apps/notes/Notes").then((mod) => mod.Notes));
const NotesMobile = dynamic(() =>
  import("@/components/apps/notes/NotesMobile").then((mod) => mod.NotesMobile),
);
const Trash = dynamic(() => import("@/components/apps/trash/Trash").then((mod) => mod.Trash));
const AboutThisMac = dynamic(() =>
  import("@/components/apps/about/AboutThisMac").then((mod) => mod.AboutThisMac),
);
const Terminal = dynamic(() =>
  import("@/components/apps/terminal/Terminal").then((mod) => mod.Terminal),
);

/**
 * System apps, declared statically — never sourced from Supabase (see
 * `src/lib/projects.ts` for the project apps the Phase 7 backoffice
 * manages instead, see os-apps skill).
 */
export const SYSTEM_APPS: AppDefinition[] = [
  {
    id: "finder",
    name: "Finder",
    icon: FinderIcon,
    type: "component",
    component: Finder,
    // Real macOS never puts Finder on the desktop, dock-only, always leftmost.
    showOnDesktop: false,
    showOnMobile: false,
    pinnedToDock: true,
    defaultSize: { width: 720, height: 480 },
    minSize: { width: 480, height: 340 },
    windowStyle: "unified",
  },
  {
    id: "notes",
    name: "Notes",
    icon: NotesIcon,
    type: "component",
    component: Notes,
    mobileComponent: NotesMobile,
    showOnDesktop: true,
    showOnMobile: true,
    pinnedToDock: true,
    defaultSize: { width: 780, height: 520 },
    minSize: { width: 480, height: 360 },
    // Same chrome as Finder (own sidebar carries the traffic lights) — see
    // os-apps skill.
    windowStyle: "unified",
  },
  {
    id: TRASH_APP_ID,
    name: "Corbeille",
    icon: TrashIcon,
    type: "component",
    component: Trash,
    showOnDesktop: false,
    showOnMobile: false,
    pinnedToDock: true,
    defaultSize: { width: 720, height: 480 },
    minSize: { width: 480, height: 340 },
    // Same chrome as Finder (own sidebar carries the traffic lights) — the
    // Trash is technically a Finder window, see os-apps skill.
    windowStyle: "unified",
  },
  {
    id: ABOUT_THIS_MAC_APP_ID,
    name: "À propos de ce Mac",
    icon: AboutThisMacIcon,
    type: "component",
    component: AboutThisMac,
    // Opened from the Apple menu only — never on the desktop/dock/springboard/Finder.
    showOnDesktop: false,
    showOnMobile: false,
    isSystemPanel: true,
    defaultSize: { width: 360, height: 440 },
    minSize: { width: 360, height: 440 },
  },
  {
    id: "terminal",
    name: "Terminal",
    icon: TerminalIcon,
    type: "component",
    component: Terminal,
    // Easter egg: discoverable via Finder/Applications and Spotlight, but
    // not surfaced on the desktop/dock/springboard (see TODO.md Phase 9).
    showOnDesktop: false,
    showOnMobile: false,
    defaultSize: { width: 640, height: 420 },
    minSize: { width: 420, height: 280 },
  },
];

/**
 * Shared window sizing for project apps — used as a fallback when a
 * Supabase `projects` row leaves `default_width`/`default_height` unset
 * (see `src/lib/projects.ts`, which sources every project app from the
 * Phase 7 backoffice — none are declared statically here anymore).
 */
export const PROJECT_APP_DEFAULT_SIZE = { width: 960, height: 640 };
export const PROJECT_APP_MIN_SIZE = { width: 560, height: 400 };

/**
 * Builds the full request-time registry: `SYSTEM_APPS` + the Supabase-sourced
 * project apps (see `src/lib/projects.ts`). Owned here rather than inlined at
 * the `OS.tsx` call site, so "how the registry is assembled" stays in one
 * place alongside the static apps it merges with.
 */
export function mergeAppRegistry(projectApps: AppDefinition[]): AppDefinition[] {
  return [...SYSTEM_APPS, ...projectApps];
}

/** Opens `url` the same way everywhere it happens: external apps, an iframe window's title-bar/blocked-state escape hatch (see os-apps skill). */
export function openInNewTab(url: string): void {
  window.open(url, "_blank", "noopener");
}

/**
 * Opens `app`: `external` apps go straight to a new tab (no window — see
 * os-apps skill), everything else through `openWindow`.
 */
export function launchApp(
  app: AppDefinition,
  openWindow: (appId: string, defaultSize: Size) => void,
): void {
  if (app.type === "external") {
    if (app.url) openInNewTab(app.url);
    return;
  }
  openWindow(app.id, app.defaultSize);
}

export function getApp(apps: AppDefinition[], id: string): AppDefinition | undefined {
  return apps.find((app) => app.id === id);
}

export function getDesktopApps(apps: AppDefinition[]): AppDefinition[] {
  return apps.filter((app) => app.showOnDesktop);
}

export function getMobileApps(apps: AppDefinition[]): AppDefinition[] {
  return apps.filter((app) => app.showOnMobile);
}

export function getDockApps(apps: AppDefinition[]): AppDefinition[] {
  return apps.filter((app) => app.pinnedToDock);
}

/** Iframe/external apps — what Finder's "Projets" favorite lists (see os-apps skill). */
export function getProjectApps(apps: AppDefinition[]): AppDefinition[] {
  return apps.filter((app) => app.type === "iframe" || app.type === "external");
}

/** Component-type (system) apps — what Finder's "Applications" favorite lists. Excludes system panels (see `AppDefinition.isSystemPanel`). */
export function getSystemComponentApps(apps: AppDefinition[]): AppDefinition[] {
  return apps.filter((app) => app.type === "component" && !app.isSystemPanel);
}

/**
 * The first app whose icon is an image asset rather than an SVG component —
 * only that kind renders a next/image `<Image>` (see `AppIcon`), so it's the
 * only one that can be the page's LCP element. Shared by the desktop icon
 * column and the iOS springboard's first page so each marks the right icon
 * `priority` without re-deriving this per grid.
 */
export function findFirstImageIconId(apps: AppDefinition[]): string | undefined {
  return apps.find((app) => typeof app.icon === "string")?.id;
}
