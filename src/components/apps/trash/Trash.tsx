"use client";

import { DocumentIcon } from "@/components/apps/finder/DocumentIcon";
import { FileGrid, type FileGridItem } from "@/components/apps/finder/FileGrid";
import { useTrashStore } from "@/stores/useTrashStore";

/** Reuses the Finder layout (see os-apps skill), with static fun content and an empty-trash action. */
export function Trash() {
  const items = useTrashStore((state) => state.items);
  const emptyTrash = useTrashStore((state) => state.emptyTrash);

  const fileItems: FileGridItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    icon: DocumentIcon,
    kind: item.kind,
    onOpen: () => {},
  }));

  return (
    <div className="flex h-full min-h-0 flex-col text-[13px]">
      <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-3 py-1.5 dark:border-white/10">
        <span className="font-semibold">Corbeille</span>
        <button
          type="button"
          onClick={emptyTrash}
          disabled={items.length === 0}
          className="focus-visible:outline-system-blue rounded bg-black/5 px-2 py-1 text-[12px] focus-visible:outline-2 disabled:opacity-40 dark:bg-white/10"
        >
          Vider la corbeille
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <FileGrid items={fileItems} viewMode="icons" emptyLabel="La corbeille est vide" />
      </div>
    </div>
  );
}
