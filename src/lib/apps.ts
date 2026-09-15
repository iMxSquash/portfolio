import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { FinderIcon } from "@/components/apps/finder/FinderIcon";
import { NotesIcon } from "@/components/apps/notes/NotesIcon";
import { IllustratorIcon } from "@/components/apps/projects/IllustratorIcon";
import { PhotoshopIcon } from "@/components/apps/projects/PhotoshopIcon";
import { PremiereProIcon } from "@/components/apps/projects/PremiereProIcon";
import { TrashIcon } from "@/components/apps/trash/TrashIcon";
import type { Size } from "@/lib/window";

export type MenuItemDefinition = {
  label: string;
  shortcut?: string;
};

export type MenuDefinition = {
  label: string;
  items: MenuItemDefinition[];
};

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
};

/**
 * Well-known id for the Trash app. The dock special-cases it to always
 * render last, after the running/minimized windows section, matching real
 * macOS — see `Dock.tsx`.
 */
export const TRASH_APP_ID = "trash";

const Finder = dynamic(() => import("@/components/apps/finder/Finder").then((mod) => mod.Finder));
const Notes = dynamic(() => import("@/components/apps/notes/Notes").then((mod) => mod.Notes));
const Trash = dynamic(() => import("@/components/apps/trash/Trash").then((mod) => mod.Trash));

/**
 * System apps, declared statically — never sourced from Supabase (see
 * `PROJECT_APPS` below for the apps Phase 7's backoffice will manage
 * instead, see os-apps skill).
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
];

/** Shared window sizing for every project app — same tool-window proportions across Photoshop/Illustrator/Premiere Pro. */
const PROJECT_APP_DEFAULT_SIZE = { width: 960, height: 640 };
const PROJECT_APP_MIN_SIZE = { width: 560, height: 400 };

/**
 * Project apps, declared statically until the Phase 7 backoffice sources
 * them from Supabase instead (see `PROJECT_APPS` below and os-apps skill).
 * Each maps to its own subdomain, opened via `IframeWindow`.
 */
const PROJECT_APP_SOURCES: Array<
  Pick<AppDefinition, "id" | "name" | "icon"> & { subdomain: string }
> = [
  { id: "photoshop", name: "Photoshop", icon: PhotoshopIcon, subdomain: "photoshop" },
  { id: "illustrator", name: "Illustrator", icon: IllustratorIcon, subdomain: "illustrator" },
  { id: "premierepro", name: "Premiere Pro", icon: PremiereProIcon, subdomain: "premierepro" },
];

export const PROJECT_APPS: AppDefinition[] = PROJECT_APP_SOURCES.map(
  ({ id, name, icon, subdomain }) => ({
    id,
    name,
    icon,
    type: "iframe",
    url: `https://${subdomain}.elwen.dev`,
    showOnDesktop: true,
    showOnMobile: true,
    defaultSize: PROJECT_APP_DEFAULT_SIZE,
    minSize: PROJECT_APP_MIN_SIZE,
  }),
);

/** Full registry: system apps + projects. Desktop, dock, Finder and the iOS springboard read this, never `SYSTEM_APPS` alone (see os-apps skill). */
export const APPS: AppDefinition[] = [...SYSTEM_APPS, ...PROJECT_APPS];

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

/** Component-type (system) apps — what Finder's "Applications" favorite lists. */
export function getSystemComponentApps(apps: AppDefinition[]): AppDefinition[] {
  return apps.filter((app) => app.type === "component");
}
