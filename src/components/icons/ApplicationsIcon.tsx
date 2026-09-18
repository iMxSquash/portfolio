import { SiAppstore } from "react-icons/si";

/** Finder sidebar glyph for the Applications favorite, same contract as FolderIcon. */
export function ApplicationsIcon({ className = "" }: { className?: string }) {
  return <SiAppstore size={14} className={`shrink-0 ${className}`} />;
}
