"use client";

import { useState, type ComponentType } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { IOS_STATUS_BAR_CLEARANCE } from "@/lib/ios";
import {
  DESKTOP_ONLY_PANE_IDS,
  getSettingsPane,
  SETTINGS_PANE_SECTIONS,
  type SettingsPane,
  type SettingsPaneId,
} from "@/lib/settings-panes";
import { useReduceMotion } from "@/lib/use-reduce-motion";
import { AccessibilityPane } from "./panes/AccessibilityPane";
import { AppearancePane } from "./panes/AppearancePane";
import { GeneralPane } from "./panes/GeneralPane";
import { LiquidGlassPane } from "./panes/LiquidGlassPane";
import { SoundPane } from "./panes/SoundPane";
import { WallpaperPane } from "./panes/WallpaperPane";

// Same push/pop curve as NotesMobile's own list -> detail navigation.
const NAV_TRANSITION = { type: "tween", duration: 0.32, ease: [0.32, 0.72, 0, 1] } as const;
const NAV_TRANSITION_REDUCED = { duration: 0 } as const;

// Same edge-swipe-back geometry as NotesMobile: real iOS only recognizes the
// gesture when the touch starts within a narrow strip of the screen edge,
// not anywhere on the page, so a normal rightward scroll inside a pane never
// triggers it.
const EDGE_SWIPE_ZONE_WIDTH = 24;
const EDGE_SWIPE_BACK_THRESHOLD_PX = 60;

/** No iOS equivalent for "Bureau et Dock", so a mobile section left empty after filtering it out is dropped entirely. */
const MOBILE_PANE_SECTIONS = SETTINGS_PANE_SECTIONS.map((section) =>
  section.filter((id) => !DESKTOP_ONLY_PANE_IDS.includes(id)),
).filter((section) => section.length > 0);

const PANE_COMPONENTS: Partial<Record<SettingsPaneId, ComponentType>> = {
  general: GeneralPane,
  appearance: AppearancePane,
  "liquid-glass": LiquidGlassPane,
  accessibility: AccessibilityPane,
  wallpaper: WallpaperPane,
  sound: SoundPane,
};

/**
 * iOS Réglages Système: grouped list -> pane stacked navigation (see
 * os-ios-ui skill), the same two-level pattern as `NotesMobile.tsx`. Reuses
 * the exact same pane components as the desktop `SettingsView` (none of them
 * depend on `useWindowChrome()` or other window-manager state) instead of
 * duplicating a single setting — see TODO-settings.md Phase 9.
 */
export function SettingsMobile() {
  const [selectedPaneId, setSelectedPaneId] = useState<SettingsPaneId | null>(null);
  const reducedMotion = useReduceMotion();
  const transition = reducedMotion ? NAV_TRANSITION_REDUCED : NAV_TRANSITION;
  const selectedPane = selectedPaneId ? getSettingsPane(selectedPaneId) : null;
  const SelectedPaneComponent = selectedPaneId ? PANE_COMPONENTS[selectedPaneId] : undefined;

  // Framer's `onPanEnd` (unlike its `drag` prop) recognizes the gesture
  // without moving the element itself and without manual pointer capture —
  // see NotesMobile.tsx, the same edge-swipe-back pattern.
  function handleEdgeSwipeEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x > EDGE_SWIPE_BACK_THRESHOLD_PX) {
      setSelectedPaneId(null);
    }
  }

  return (
    <AnimatePresence initial={false}>
      {selectedPane && SelectedPaneComponent ? (
        <motion.div
          key="detail"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={transition}
          className="bg-window-canvas absolute inset-0 z-10 flex flex-col text-[15px]"
          style={{ paddingTop: IOS_STATUS_BAR_CLEARANCE }}
        >
          <div className="flex h-12 shrink-0 items-center px-2">
            <button
              type="button"
              onClick={() => setSelectedPaneId(null)}
              className="text-system-blue flex items-center gap-0.5 px-2 py-1.5 text-[17px]"
            >
              <IconChevronLeft size={22} stroke={2.2} aria-hidden="true" />
              Réglages
            </button>
          </div>
          {/* The pane's own SettingsGroup cards already carry the visual
              weight — this heading exists for assistive tech only, matching
              the desktop SettingsView's single visible <h1> per window. */}
          <h1 className="sr-only">{selectedPane.label}</h1>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
            <SelectedPaneComponent />
          </div>

          {/* Swipe-from-left-edge-to-go-back hit zone, below the header so
              it never steals taps from the back button above it. */}
          <motion.div
            onPanEnd={handleEdgeSwipeEnd}
            aria-hidden="true"
            className="absolute top-12 bottom-0 left-0 touch-none"
            style={{ width: EDGE_SWIPE_ZONE_WIDTH }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="list"
          initial={{ x: "-25%" }}
          animate={{ x: 0 }}
          exit={{ x: "-25%" }}
          transition={transition}
          className="bg-window-canvas absolute inset-0 flex flex-col text-[15px]"
          style={{ paddingTop: IOS_STATUS_BAR_CLEARANCE }}
        >
          <div className="shrink-0 px-5 pt-4 pb-2">
            <h1 className="text-3xl font-bold">Réglages</h1>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {MOBILE_PANE_SECTIONS.map((sectionIds, index) => (
              <ul
                key={sectionIds.join("-")}
                className={`overflow-hidden rounded-xl bg-black/[0.03] dark:bg-white/[0.04] ${index > 0 ? "mt-4" : ""}`}
              >
                {sectionIds.map((id) => (
                  <SettingsPaneRow
                    key={id}
                    pane={getSettingsPane(id)}
                    onSelect={() => setSelectedPaneId(id)}
                  />
                ))}
              </ul>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SettingsPaneRow({ pane, onSelect }: { pane: SettingsPane; onSelect: () => void }) {
  const Icon = pane.icon;
  return (
    <li className="border-b border-black/8 last:border-b-0 dark:border-white/8">
      <button
        type="button"
        onClick={onSelect}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-2"
      >
        <span
          aria-hidden="true"
          className={`flex size-7 shrink-0 items-center justify-center rounded-[7px] ${pane.iconColor}`}
        >
          <Icon className="size-4 text-white" />
        </span>
        <span className="flex-1 truncate text-left">{pane.label}</span>
        <IconChevronRight
          size={16}
          stroke={2}
          aria-hidden="true"
          className="text-foreground/30 shrink-0"
        />
      </button>
    </li>
  );
}
