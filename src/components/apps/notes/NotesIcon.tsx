/**
 * Recreated in SVG (not the official asset, see os-macos-ui skill): yellow
 * legal-pad header, ruled white body, pencil accent — reads as "Notes" at a
 * glance without tracing Apple's artwork.
 */
export function NotesIcon() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
      <rect width="100" height="100" fill="#FFFFFF" />
      <rect width="100" height="26" fill="#FFCC00" />
      <rect y="24" width="100" height="2" fill="#E0A800" />
      <g stroke="#E4E4E6" strokeWidth="2.5">
        <line x1="14" y1="42" x2="86" y2="42" />
        <line x1="14" y1="56" x2="86" y2="56" />
        <line x1="14" y1="70" x2="60" y2="70" />
      </g>
      <g transform="translate(62 58) rotate(45)">
        <rect x="-4" y="-18" width="8" height="30" rx="1.5" fill="#FF9F0A" />
        <path d="M -4 12 L 4 12 L 0 22 Z" fill="#8A8A8E" />
        <rect x="-4" y="-18" width="8" height="7" fill="#F2F2F2" />
      </g>
    </svg>
  );
}
