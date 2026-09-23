/**
 * Dock magnification tuning — continuous interpolation of icon size based on
 * cursor distance, not a simple hover scale (see os-macos-ui skill).
 */
export const DOCK_ICON_REST_SIZE = 48;
export const DOCK_ICON_MAGNIFIED_SIZE = 80;
export const DOCK_MAGNIFICATION_DISTANCE = 150;
export const DOCK_MAGNIFICATION_SPRING = { mass: 0.1, stiffness: 170, damping: 12 } as const;

/**
 * Vertical padding inside the dock pill. Real macOS never grows the dock's
 * own height when icons magnify — only its width (more/bigger icons need
 * more room in the row). The pill height is pinned to the user's chosen rest
 * icon size (see `getDockHeight`) so magnified icons, bottom-anchored via
 * `items-end`, visually pop out above the glass instead of stretching it.
 */
export const DOCK_PADDING_Y = 8;

/** Delay before the app-name tooltip appears on hover. */
export const DOCK_TOOLTIP_DELAY_S = 0.3;

/** The dock pill's fixed height for a given (user-configurable, see `DockSettings.iconSize`) rest icon size. */
export function getDockHeight(iconSize: number): number {
  return iconSize + DOCK_PADDING_Y * 2;
}
