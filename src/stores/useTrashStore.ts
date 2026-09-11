import { create } from "zustand";
import { INITIAL_TRASH_ITEMS, type TrashItem } from "@/components/apps/trash/trash-content";

type TrashStore = {
  items: TrashItem[];
  /** Drives the dock/desktop icon's full-vs-empty artwork (see TrashIcon). */
  emptyTrash: () => void;
};

export const useTrashStore = create<TrashStore>()((set) => ({
  items: INITIAL_TRASH_ITEMS,
  emptyTrash: () => set({ items: [] }),
}));
