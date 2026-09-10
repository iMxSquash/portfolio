import type { MenuDefinition } from "./apps";

export type AppleMenuEntry =
  { id: "about" | "preferences" | "lock"; label: string } | { id: `separator-${number}` };

/** Apple-menu equivalent (logo dropdown). Only "lock" is wired to real behavior (reuses the boot lock screen). */
export const APPLE_MENU_ITEMS: AppleMenuEntry[] = [
  { id: "about", label: "À propos de ce portfolio" },
  { id: "separator-1" },
  { id: "preferences", label: "Préférences…" },
  { id: "separator-2" },
  { id: "lock", label: "Verrouiller l'écran" },
];

/** Shown for the focused app's menus when the app registry doesn't define its own (see `AppDefinition.menus`) — fake but authentic-looking, per os-macos-ui skill. */
export const DEFAULT_APP_MENUS: MenuDefinition[] = [
  {
    label: "Fichier",
    items: [
      { label: "Nouvelle fenêtre", shortcut: "⌘N" },
      { label: "Fermer", shortcut: "⌘W" },
    ],
  },
  {
    label: "Édition",
    items: [
      { label: "Annuler", shortcut: "⌘Z" },
      { label: "Rétablir", shortcut: "⇧⌘Z" },
      { label: "Couper", shortcut: "⌘X" },
      { label: "Copier", shortcut: "⌘C" },
      { label: "Coller", shortcut: "⌘V" },
    ],
  },
  {
    label: "Présentation",
    items: [{ label: "Entrer en plein écran", shortcut: "⌃⌘F" }],
  },
  {
    label: "Fenêtre",
    items: [{ label: "Réduire", shortcut: "⌘M" }, { label: "Zoom" }],
  },
  {
    label: "Aide",
    items: [{ label: "Aide" }],
  },
];

const CLOCK_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};
const CLOCK_TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

/** macOS French clock format, e.g. "lun. 6 juil. 09:41". */
export function formatMenuBarClock(date: Date): string {
  const datePart = date.toLocaleDateString("fr-FR", CLOCK_DATE_FORMAT);
  const timePart = date.toLocaleTimeString("fr-FR", CLOCK_TIME_FORMAT);
  return `${datePart} ${timePart}`;
}
