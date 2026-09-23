import type { ComponentType } from "react";
import {
  IconAccessible,
  IconContrast2,
  IconDeviceDesktop,
  IconDroplet,
  IconPhoto,
  IconSettings,
  IconVolume,
} from "@tabler/icons-react";

export type SettingsPaneId =
  | "general"
  | "appearance"
  | "liquid-glass"
  | "accessibility"
  | "desktop-dock"
  | "wallpaper"
  | "sound";

export type SettingsPane = {
  id: SettingsPaneId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind background classes for the pane's rounded-square sidebar glyph (see `SettingsPaneRow.tsx`). */
  iconColor: string;
  /** Extra terms the sidebar search field matches against, beyond `label` (see `SettingsView.tsx`). */
  keywords: string[];
};

/**
 * Pane registry, same principle as `finder.ts`'s favorites: one list feeding
 * both the sidebar rows and the search filter. Grouped into 3 sections
 * matching real macOS System Settings' sidebar (no visible section titles
 * there — just a gap between groups, see `SettingsView.tsx`).
 */
export const SETTINGS_PANES: SettingsPane[] = [
  {
    id: "general",
    label: "Général",
    icon: IconSettings,
    iconColor: "bg-gray-500",
    keywords: ["à propos", "réinitialiser", "informations"],
  },
  {
    id: "appearance",
    label: "Apparence",
    icon: IconContrast2,
    iconColor: "bg-neutral-800",
    keywords: ["thème", "clair", "sombre", "accent", "couleur"],
  },
  {
    id: "liquid-glass",
    label: "Liquid Glass",
    icon: IconDroplet,
    iconColor: "bg-system-blue",
    keywords: ["glass", "verre", "flou", "réfraction", "transparence", "aberration"],
  },
  {
    id: "accessibility",
    label: "Accessibilité",
    icon: IconAccessible,
    iconColor: "bg-blue-600",
    keywords: ["transparence", "animations", "contraste", "mouvement"],
  },
  {
    id: "desktop-dock",
    label: "Bureau et Dock",
    icon: IconDeviceDesktop,
    iconColor: "bg-slate-600",
    keywords: ["dock", "icônes", "agrandissement", "magnification"],
  },
  {
    id: "wallpaper",
    label: "Fond d'écran",
    icon: IconPhoto,
    iconColor: "bg-teal-600",
    keywords: ["fond", "écran", "wallpaper", "image"],
  },
  {
    id: "sound",
    label: "Son",
    icon: IconVolume,
    iconColor: "bg-red-500",
    keywords: ["sons", "volume", "audio"],
  },
];

/** Sidebar grouping (see the file doc comment) — ids only, resolved against `SETTINGS_PANES`. */
export const SETTINGS_PANE_SECTIONS: SettingsPaneId[][] = [
  ["general"],
  ["appearance", "liquid-glass", "accessibility"],
  ["desktop-dock", "wallpaper", "sound"],
];

/**
 * Panes with no iOS equivalent (real iOS has no desktop/Dock concept) —
 * `SettingsMobile.tsx` filters these out of its own pane list, dropping any
 * section left empty.
 */
export const DESKTOP_ONLY_PANE_IDS: SettingsPaneId[] = ["desktop-dock"];

export function getSettingsPane(id: SettingsPaneId): SettingsPane {
  const pane = SETTINGS_PANES.find((candidate) => candidate.id === id);
  if (!pane) {
    throw new Error(`Unknown settings pane "${id}"`);
  }
  return pane;
}

/** Case/accent-insensitive match against a pane's label and keywords, for the sidebar search field. */
export function searchSettingsPanes(query: string): SettingsPane[] {
  const normalized = normalize(query);
  if (!normalized) return SETTINGS_PANES;
  return SETTINGS_PANES.filter((pane) =>
    [pane.label, ...pane.keywords].some((candidate) => normalize(candidate).includes(normalized)),
  );
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
