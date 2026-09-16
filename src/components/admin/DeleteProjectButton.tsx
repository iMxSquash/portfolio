"use client";

import { useTransition } from "react";
import { deleteProject } from "@/app/admin/(protected)/projects/actions";

/** Confirms before deleting (also removes the logo from Storage — see `deleteProject`). */
export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    startTransition(() => {
      void deleteProject(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
    >
      {isPending ? "Suppression…" : "Supprimer"}
    </button>
  );
}
