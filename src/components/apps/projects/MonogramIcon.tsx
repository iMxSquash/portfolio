type MonogramIconProps = {
  /** Flat background field. */
  bg: string;
  /** Monogram text color. */
  fg: string;
  /** Two-letter monogram, e.g. "Ps". */
  label: string;
};

/**
 * Shared shape for the Adobe-style project icons (Photoshop/Illustrator/
 * Premiere Pro): a flat color field + bold two-letter monogram, recreated
 * rather than tracing Adobe's official artwork (see os-macos-ui skill).
 */
export function MonogramIcon({ bg, fg, label }: MonogramIconProps) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
      <rect width="100" height="100" fill={bg} />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="700"
        fontSize="42"
        fill={fg}
      >
        {label}
      </text>
    </svg>
  );
}
