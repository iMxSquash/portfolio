"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useMotionValue } from "framer-motion";
import { AppIcon } from "@/components/os/AppIcon";
import type { AppDefinition } from "@/lib/apps";
import { useLiquidGlassRefraction } from "@/lib/use-liquid-glass-refraction";
import { useLiquidGlassStore } from "@/stores/useLiquidGlassStore";
import { useSpotlightStore } from "@/stores/useSpotlightStore";
import { useWindowStore } from "@/stores/useWindowStore";

type SpotlightProps = {
  apps: AppDefinition[];
  /** True while locked/booting — the ⌘Space shortcut and the menu-bar icon are inert then, same as the rest of the chrome. */
  disabled?: boolean;
};

/**
 * Global search over the apps registry, opened via ⌘Space or the magnifier
 * icon in the menu bar (see MenuBar.tsx) — both toggle the same
 * `useSpotlightStore`. Floats over the desktop with no backdrop dimming
 * (real macOS Spotlight doesn't dim either).
 */
export function Spotlight({ apps, disabled = false }: SpotlightProps) {
  const open = useSpotlightStore((state) => state.open);
  const close = useSpotlightStore((state) => state.close);
  const toggle = useSpotlightStore((state) => state.toggle);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const openWindow = useWindowStore((state) => state.openWindow);

  // Draggable like real Spotlight — plain pointer events (not Framer's `drag`
  // prop) for the same reason as Window.tsx: full control over what counts
  // as a drag handle (not the input, not the result buttons).
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragRef = useRef<{
    pointerId: number;
    startPointer: { x: number; y: number };
    startPosition: { x: number; y: number };
  } | null>(null);

  const glassParams = useLiquidGlassStore((state) => state.params);
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  useLiquidGlassRefraction(
    panelEl,
    {
      scale: glassParams.refractScale,
      aberration: glassParams.refractAberration,
      mode: glassParams.refractMode,
    },
    // Border-radius alone (pill <-> card, see hasResultsPanel below) doesn't
    // resize the element, so the controller's own ResizeObserver won't
    // rebuild the displacement map for it — force one explicitly.
    Boolean(query.trim()),
  );

  // "State derived from a state/prop change" (React docs pattern) rather than
  // an effect: clearing the query on open, and force-closing if Spotlight
  // becomes disabled mid-session (e.g. the screen gets locked while it's
  // open), both need to happen during render, not after a commit.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }
  const [prevDisabled, setPrevDisabled] = useState(disabled);
  if (disabled !== prevDisabled) {
    setPrevDisabled(disabled);
    if (disabled) close();
  }

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return apps.filter((app) => app.name.toLowerCase().includes(trimmed));
  }, [apps, query]);
  const selected = Math.min(selectedIndex, Math.max(results.length - 1, 0));

  useEffect(() => {
    if (disabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.code === "Space") {
        event.preventDefault();
        toggle();
      } else if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disabled, toggle, close]);

  useEffect(() => {
    if (!open) return;
    x.set(0);
    y.set(0);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, x, y]);

  if (!open) return null;

  function launch(app: AppDefinition) {
    openWindow(app.id, app.defaultSize);
    close();
  }

  function handleDragPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("input") || target.closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startPosition: { x: x.get(), y: y.get() },
    };
  }

  function handleDragPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    x.set(drag.startPosition.x + (event.clientX - drag.startPointer.x));
    y.set(drag.startPosition.y + (event.clientY - drag.startPointer.y));
  }

  function handleDragPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex(Math.min(selected + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex(Math.max(selected - 1, 0));
    } else if (event.key === "Enter") {
      const app = results[selected];
      if (app) launch(app);
    }
  }

  const hasResultsPanel = Boolean(query.trim());

  return (
    <div className="fixed inset-0 z-[1002] flex justify-center pt-[20vh]" onClick={() => close()}>
      <motion.div
        ref={setPanelEl}
        role="dialog"
        aria-label="Spotlight"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handleDragPointerDown}
        onPointerMove={handleDragPointerMove}
        onPointerUp={handleDragPointerUp}
        style={
          { x, y, "--glass-tint-alpha": glassParams.refractTintAlpha } as unknown as CSSProperties
        }
        // Idle (no query yet): a full pill, like real Spotlight. Once results
        // show below, a full pill on a tall rectangle would look wrong, so it
        // relaxes to a large rounded-3xl card instead — the rows below then
        // derive their radius from *this* value, not the pill one.
        className={`liquid-glass h-fit w-[640px] max-w-[90vw] touch-none overflow-hidden p-0 shadow-glass-lg ${
          hasResultsPanel ? "rounded-3xl" : "rounded-full"
        }`}
      >
        <div className="flex items-center gap-4 px-6 py-4">
          <SpotlightIcon className="size-6 shrink-0 opacity-60" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Spotlight"
            aria-label="Recherche Spotlight"
            className="w-full bg-transparent text-xl outline-none placeholder:opacity-40"
          />
        </div>

        {hasResultsPanel ? (
          // Panel is rounded-3xl (24px) with no padding here; this results
          // list sits flush against the bottom edge, so its rows are
          // rounded-2xl (16px) = 24 - 8 (the list's own p-2) — concentric,
          // see liquid-glass-tailwind skill.
          <div className="border-t border-black/10 p-2 dark:border-white/10">
            {results.length === 0 ? (
              <p className="px-3 py-2 text-sm opacity-60">Aucun résultat</p>
            ) : (
              <ul>
                {results.map((app, index) => (
                  <li key={app.id}>
                    <button
                      type="button"
                      onClick={() => launch(app)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ${
                        index === selected ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      <span className="size-6 shrink-0">
                        <AppIcon app={app} />
                      </span>
                      <span className="text-sm">{app.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

/** Also used as the menu-bar trigger icon (see MenuBar.tsx) — same magnifier, two ways to open Spotlight. */
export function SpotlightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M14 14l-3.2-3.2" />
    </svg>
  );
}
