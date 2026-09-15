/**
 * Dock magnification tuning — continuous interpolation of icon size based on
 * cursor distance, not a simple hover scale (see os-macos-ui skill).
 */
export const DOCK_ICON_REST_SIZE = 48;
export const DOCK_ICON_MAGNIFIED_SIZE = 80;
export const DOCK_MAGNIFICATION_DISTANCE = 150;
export const DOCK_MAGNIFICATION_SPRING = { mass: 0.1, stiffness: 170, damping: 12 } as const;

/**
 * Vertical padding inside the dock pill and the pill's resulting fixed
 * height. Real macOS never grows the dock's own height when icons magnify —
 * only its width (more/bigger icons need more room in the row). The pill
 * height is pinned to the rest-size icon so magnified icons, bottom-anchored
 * via `items-end`, visually pop out above the glass instead of stretching it.
 */
export const DOCK_PADDING_Y = 8;
export const DOCK_HEIGHT = DOCK_ICON_REST_SIZE + DOCK_PADDING_Y * 2;

/** Delay before the app-name tooltip appears on hover. */
export const DOCK_TOOLTIP_DELAY_S = 0.3;
