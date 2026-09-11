/** Generic dog-eared document glyph for Finder/Trash list entries that aren't apps. */
export function DocumentIcon() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
      <path d="M22 8h38l18 18v66a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" fill="#F4F4F6" />
      <path d="M60 8v14a4 4 0 0 0 4 4h14L60 8Z" fill="#D6D6DC" />
      <g stroke="#C4C4CC" strokeWidth="4" strokeLinecap="round">
        <line x1="30" y1="52" x2="70" y2="52" />
        <line x1="30" y1="64" x2="70" y2="64" />
        <line x1="30" y1="76" x2="54" y2="76" />
      </g>
    </svg>
  );
}
