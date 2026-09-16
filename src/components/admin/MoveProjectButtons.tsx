"use client";

import { useTransition } from "react";
import { moveProject } from "@/app/admin/(protected)/projects/actions";

/** Reorders a project by swapping `sort_order` with its neighbor (see `moveProject`). */
export function MoveProjectButtons({
  id,
  disableUp,
  disableDown,
}: {
  id: string;
  disableUp: boolean;
  disableDown: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(() => {
      void moveProject(id, direction);
    });
  }

  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={isPending || disableUp}
        aria-label="Monter"
        className="rounded px-1.5 py-0.5 text-sm hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={isPending || disableDown}
        aria-label="Descendre"
        className="rounded px-1.5 py-0.5 text-sm hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10"
      >
        ↓
      </button>
    </div>
  );
}
