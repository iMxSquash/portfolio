"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { ResizeDirection } from "@/lib/window";

type ResizeHandlesProps = {
  onResizeStart: (direction: ResizeDirection, event: ReactPointerEvent) => void;
  onResizeMove: (event: ReactPointerEvent) => void;
  onResizeEnd: (event: ReactPointerEvent) => void;
};

const EDGES: { direction: ResizeDirection; className: string }[] = [
  { direction: "n", className: "-top-[3px] inset-x-0 h-[6px] cursor-ns-resize" },
  { direction: "s", className: "-bottom-[3px] inset-x-0 h-[6px] cursor-ns-resize" },
  { direction: "w", className: "-left-[3px] inset-y-0 w-[6px] cursor-ew-resize" },
  { direction: "e", className: "-right-[3px] inset-y-0 w-[6px] cursor-ew-resize" },
];

const CORNERS: { direction: ResizeDirection; className: string }[] = [
  { direction: "nw", className: "-top-[6px] -left-[6px] size-[12px] cursor-nwse-resize" },
  { direction: "ne", className: "-top-[6px] -right-[6px] size-[12px] cursor-nesw-resize" },
  { direction: "sw", className: "-bottom-[6px] -left-[6px] size-[12px] cursor-nesw-resize" },
  { direction: "se", className: "-bottom-[6px] -right-[6px] size-[12px] cursor-nwse-resize" },
];

/** 4 edges + 4 corners, invisible hit zones straddling the window border. */
export function ResizeHandles({ onResizeStart, onResizeMove, onResizeEnd }: ResizeHandlesProps) {
  return (
    <>
      {EDGES.map(({ direction, className }) => (
        <div
          key={direction}
          className={`absolute z-10 touch-none ${className}`}
          onPointerDown={(event) => onResizeStart(direction, event)}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
        />
      ))}
      {CORNERS.map(({ direction, className }) => (
        <div
          key={direction}
          className={`absolute z-20 touch-none ${className}`}
          onPointerDown={(event) => onResizeStart(direction, event)}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
        />
      ))}
    </>
  );
}
