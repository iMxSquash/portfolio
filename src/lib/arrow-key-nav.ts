import type { KeyboardEvent as ReactKeyboardEvent } from "react";

/**
 * Arrow-key focus movement between sibling `<button>`s inside a container —
 * shared by every list/grid in the OS that only had native Tab order before
 * (menu bar, desktop icons, Finder/Trash file grid, Notes sidebars). Moves
 * real DOM focus; it doesn't touch tabIndex or app selection state, so it
 * layers on top of existing Tab behavior instead of replacing it.
 */

function getItems(container: HTMLElement, itemSelector: string): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
}

function currentIndex(items: HTMLElement[]): number {
  return items.indexOf(document.activeElement as HTMLElement);
}

/** One-dimensional list — vertical (ArrowUp/Down) or horizontal (ArrowLeft/Right), with wraparound. */
export function focusListSibling(
  event: ReactKeyboardEvent,
  container: HTMLElement,
  orientation: "vertical" | "horizontal",
  itemSelector = "button",
) {
  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  if (event.key !== nextKey && event.key !== prevKey) return;

  const items = getItems(container, itemSelector);
  const index = currentIndex(items);
  if (index === -1 || items.length === 0) return;

  event.preventDefault();
  const delta = event.key === nextKey ? 1 : -1;
  items[(index + delta + items.length) % items.length]?.focus();
}

/**
 * Two-dimensional grid (e.g. Finder's icon view) — all 4 arrow keys, no
 * wraparound at the edges. Column count is inferred from how many items
 * share the first item's `offsetTop`, so it adapts to the grid's current
 * responsive column count instead of a hardcoded number.
 */
export function focusGridSibling(
  event: ReactKeyboardEvent,
  container: HTMLElement,
  itemSelector = "button",
) {
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;

  const items = getItems(container, itemSelector);
  const index = currentIndex(items);
  if (index === -1 || items.length === 0) return;

  const firstRowTop = items[0].offsetTop;
  const columns = items.filter((item) => item.offsetTop === firstRowTop).length || 1;

  event.preventDefault();
  let next = index;
  if (event.key === "ArrowRight") next = index + 1;
  else if (event.key === "ArrowLeft") next = index - 1;
  else if (event.key === "ArrowDown") next = index + columns;
  else if (event.key === "ArrowUp") next = index - columns;

  items[Math.max(0, Math.min(items.length - 1, next))]?.focus();
}
