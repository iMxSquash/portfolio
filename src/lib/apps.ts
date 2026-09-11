import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { FinderIcon } from "@/components/apps/finder/FinderIcon";
import { NotesIcon } from "@/components/apps/notes/NotesIcon";
import { TrashIcon } from "@/components/apps/trash/TrashIcon";

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
 * System apps, declared statically. Phase 7 merges this with
 * Supabase-sourced project apps server-side before descending into props
 * (see os-apps skill).
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
    defaultSize: { width: 640, height: 440 },
    minSize: { width: 420, height: 320 },
  },
];

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
