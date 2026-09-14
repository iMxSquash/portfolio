import { IconTrash } from "@tabler/icons-react";

/** Corbeille sidebar glyph, same contract as FolderIcon (see FINDER_FAVORITES). */
export function TrashGlyphIcon({ className = "" }: { className?: string }) {
  return <IconTrash size={14} className={`shrink-0 ${className}`} />;
}
