import { IconFolder } from "@tabler/icons-react";

/** Generic macOS folder glyph, shared by Notes' sidebar and Finder's sidebar/breadcrumbs. */
export function FolderIcon({ className = "" }: { className?: string }) {
  return <IconFolder size={14} className={`shrink-0 ${className}`} />;
}
