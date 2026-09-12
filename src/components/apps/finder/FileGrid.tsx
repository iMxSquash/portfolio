import type { ComponentType, KeyboardEvent } from "react";
import { AppIcon } from "@/components/os/AppIcon";
import { focusGridSibling, focusListSibling } from "@/lib/arrow-key-nav";

export type FileGridItem = {
  id: string;
  name: string;
  icon: ComponentType | string;
  kind: string;
  onOpen: () => void;
};

export type FinderViewMode = "icons" | "list";

type FileGridProps = {
  items: FileGridItem[];
  viewMode: FinderViewMode;
  emptyLabel: string;
};

/**
 * Icon grid / list view shared by Finder's main pane and the Trash window
 * (see os-apps skill: Corbeille "réutilise le layout Finder").
 */
export function FileGrid({ items, viewMode, emptyLabel }: FileGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-foreground/40 flex h-full items-center justify-center text-[13px]">
        {emptyLabel}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div
        className="text-[13px]"
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
          focusListSibling(event, event.currentTarget, "vertical")
        }
      >
        <div className="text-foreground/50 flex border-b border-black/10 px-3 py-1.5 text-[11px] font-medium dark:border-white/10">
          <span className="flex-1">Nom</span>
          <span className="w-28 shrink-0">Genre</span>
        </div>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onDoubleClick={item.onOpen}
            onKeyDown={(event) => {
              if (event.key === "Enter") item.onOpen();
            }}
            className="focus-visible:bg-system-blue/20 flex w-full items-center border-b border-black/5 px-3 py-1.5 text-left hover:bg-black/5 focus-visible:outline-none dark:border-white/5 dark:hover:bg-white/5"
          >
            <span className="flex flex-1 items-center gap-2 truncate">
              <span className="w-4.5 shrink-0">
                <AppIcon app={item} />
              </span>
              {item.name}
            </span>
            <span className="text-foreground/50 w-28 shrink-0 truncate">{item.kind}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2 p-3"
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => focusGridSibling(event, event.currentTarget)}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onDoubleClick={item.onOpen}
          onKeyDown={(event) => {
            if (event.key === "Enter") item.onOpen();
          }}
          className="focus-visible:bg-system-blue/20 flex flex-col items-center gap-1 rounded p-2 text-center hover:bg-black/5 focus-visible:outline-none dark:hover:bg-white/5"
        >
          <span className="w-12">
            <AppIcon app={item} />
          </span>
          <span className="w-full truncate text-[12px]">{item.name}</span>
        </button>
      ))}
    </div>
  );
}
