import { BsWindowDesktop } from "react-icons/bs";

/** Finder sidebar glyph for the Bureau favorite, same contract as FolderIcon. */
export function DesktopIcon({ className = "" }: { className?: string }) {
  return <BsWindowDesktop size={14} className={`shrink-0 ${className}`} />;
}
