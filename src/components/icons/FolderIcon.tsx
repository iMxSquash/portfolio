import { useId } from "react";

/** Generic macOS folder glyph, shared by Notes' sidebar and Finder's sidebar/breadcrumbs. */
export function FolderIcon({ className = "" }: { className?: string }) {
  // Rendered multiple times per page (Finder favorites, Notes sidebar) — a
  // shared literal gradient id would duplicate across those SVGs.
  const gradientId = `folder-icon-fill-${useId()}`;

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="12"
          y1="4"
          x2="12"
          y2="19"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7CC5FF" />
          <stop offset="100%" stopColor="#0A84FF" />
        </linearGradient>
      </defs>
      <path
        d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
