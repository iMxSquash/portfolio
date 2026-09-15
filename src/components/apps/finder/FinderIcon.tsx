import { useId } from "react";

/**
 * Recreated in SVG (not the official asset, see os-macos-ui skill): the
 * two-tone split face silhouette that reads as "Finder" at a glance.
 */
export function FinderIcon() {
  // Can render more than once per page (dock + Spotlight results) — gradient
  // ids must be unique per instance, not shared literals.
  const uid = useId();

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`finder-left-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#0A84FF" />
        </linearGradient>
        <linearGradient id={`finder-right-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0A5FBF" />
          <stop offset="100%" stopColor="#012A63" />
        </linearGradient>
      </defs>
      <rect width="50" height="100" fill={`url(#finder-left-${uid})`} />
      <rect x="50" width="50" height="100" fill={`url(#finder-right-${uid})`} />
      <path
        d="M 30 30 A 20 26 0 0 1 30 70"
        stroke="#FFFFFF"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 70 30 A 20 26 0 0 0 70 70"
        stroke="#EAF4FF"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="30" cy="46" r="4" fill="#FFFFFF" />
      <circle cx="70" cy="46" r="4" fill="#EAF4FF" />
    </svg>
  );
}
