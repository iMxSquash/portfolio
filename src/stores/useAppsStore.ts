import { create } from "zustand";
import { SYSTEM_APPS, type AppDefinition } from "@/lib/apps";

/**
 * Holds the request-time app registry: `SYSTEM_APPS` merged with the
 * Supabase-sourced project apps (see `src/lib/projects.ts`). Hydrated once
 * from `page.tsx` via `OS`'s `initialProjectApps` prop (see os-apps skill) —
 * `MacOS`, `IOS` and `Finder` read from here instead of importing
 * `SYSTEM_APPS` directly, which only covers system apps before hydration.
 */
type AppsStore = {
  apps: AppDefinition[];
  setApps: (apps: AppDefinition[]) => void;
};

export const useAppsStore = create<AppsStore>((set) => ({
  apps: SYSTEM_APPS,
  setApps: (apps) => set({ apps }),
}));
