/**
 * Dock magnification tuning — continuous interpolation of icon size based on
 * cursor distance, not a simple hover scale (see os-macos-ui skill).
 */
export const DOCK_ICON_REST_SIZE = 48;
export const DOCK_ICON_MAGNIFIED_SIZE = 80;
export const DOCK_MAGNIFICATION_DISTANCE = 150;
export const DOCK_MAGNIFICATION_SPRING = { mass: 0.1, stiffness: 170, damping: 12 } as const;

/** Delay before the app-name tooltip appears on hover. */
export const DOCK_TOOLTIP_DELAY_S = 0.3;
