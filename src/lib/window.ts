export type Position = { x: number; y: number };
export type Size = { width: number; height: number };
export type Bounds = { position: Position; size: Size };

/** Mirrors `--menu-bar-height` in globals.css — keep in sync (see os-macos-ui skill). */
export const MENU_BAR_HEIGHT = 28;

/** Minimum strip of title bar that must stay reachable so a dragged-off window can be caught again. */
const MIN_VISIBLE_TITLE_BAR = 40;

/** New windows cascade from the center instead of stacking exactly on top of each other. */
const CASCADE_OFFSET = 24;
const CASCADE_STEPS = 8;

/** Spring used for maximize/restore/minimize — brisk but not stiff, matches macOS window chrome. */
export const WINDOW_SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 0.8 } as const;
export const WINDOW_SPRING_REDUCED = { type: "tween", duration: 0 } as const;

export const WINDOW_OPEN_TRANSITION = { duration: 0.2, ease: "easeOut" } as const;
export const WINDOW_CLOSE_TRANSITION = { duration: 0.15, ease: "easeIn" } as const;
export const WINDOW_REDUCED_TRANSITION = { duration: 0 } as const;

export function computeDefaultBounds(size: Size, openCount: number, viewport: Size): Bounds {
  const cascade = (openCount % CASCADE_STEPS) * CASCADE_OFFSET;
  const baseX = (viewport.width - size.width) / 2;
  const baseY = MENU_BAR_HEIGHT + (viewport.height - MENU_BAR_HEIGHT - size.height) / 2;
  return {
    position: {
      x: Math.round(baseX + cascade),
      y: Math.round(Math.max(MENU_BAR_HEIGHT, baseY) + cascade),
    },
    size,
  };
}

export function computeMaximizedBounds(viewport: Size): Bounds {
  return {
    position: { x: 0, y: MENU_BAR_HEIGHT },
    size: { width: viewport.width, height: viewport.height - MENU_BAR_HEIGHT },
  };
}

/** Clamps a dragged title-bar position: never under the menu bar, always partly catchable on the other edges. */
export function clampDragPosition(position: Position, size: Size, viewport: Size): Position {
  return {
    x: clamp(
      position.x,
      MIN_VISIBLE_TITLE_BAR - size.width,
      viewport.width - MIN_VISIBLE_TITLE_BAR,
    ),
    y: clamp(position.y, MENU_BAR_HEIGHT, viewport.height - MIN_VISIBLE_TITLE_BAR),
  };
}

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/**
 * Applies a resize gesture from one of the 8 handles, anchoring the opposite edge/corner
 * (dragging the west handle keeps the right edge fixed, etc.) and enforcing the app's min
 * size plus the same menu-bar ceiling as dragging.
 */
export function applyResize(
  direction: ResizeDirection,
  start: Bounds,
  delta: { dx: number; dy: number },
  minSize: Size,
): Bounds {
  const startRight = start.position.x + start.size.width;
  const startBottom = start.position.y + start.size.height;

  let width = start.size.width;
  let height = start.size.height;
  if (direction.includes("e")) width += delta.dx;
  if (direction.includes("w")) width -= delta.dx;
  if (direction.includes("s")) height += delta.dy;
  if (direction.includes("n")) height -= delta.dy;
  width = Math.max(width, minSize.width);
  height = Math.max(height, minSize.height);

  const x = direction.includes("w") ? startRight - width : start.position.x;
  let y = direction.includes("n") ? startBottom - height : start.position.y;

  if (direction.includes("n") && y < MENU_BAR_HEIGHT) {
    y = MENU_BAR_HEIGHT;
    height = startBottom - y;
  }

  return { position: { x, y }, size: { width, height } };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
