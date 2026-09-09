import type { ComponentType } from "react";

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
 * System apps (Notes, Finder, Corbeille…), declared statically. Empty for
 * now — their components don't exist until Phase 4. Phase 7 merges this
 * with Supabase-sourced project apps server-side before descending into
 * props (see os-apps skill).
 */
export const SYSTEM_APPS: AppDefinition[] = [];

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
