import { useId } from "react";

/**
 * Recreated silhouette (not Apple's trademarked artwork), same approach as
 * the Adobe app icons documented in the os-macos-ui skill. Reused by the
 * boot screen now, and by the menu bar logo in a later phase.
 */
export function AppleLogo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const maskId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <circle cx="16.3" cy="7.6" r="2.1" fill="black" />
      </mask>
      <path
        d="M12 8c-1.7-2.3-4.8-2.7-7.2-.7C2 9.7 2.2 14 5.3 17.5 7.3 19.7 9.3 21 12 21s4.7-1.3 6.7-3.5c3.1-3.5 3.3-7.8.5-10.2-2.4-2-5.5-1.6-7.2.7z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <path
        d="M12.6 7.2c-.3-1.7.8-3.3 2.4-3.7.3 1.7-.8 3.3-2.4 3.7z"
        fill="currentColor"
      />
    </svg>
  );
}
