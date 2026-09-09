import { useId } from "react";

const VIEWBOX_WIDTH = 278;
const VIEWBOX_HEIGHT = 176;
const ASPECT_RATIO = VIEWBOX_HEIGHT / VIEWBOX_WIDTH;

/** Site logo (public/logo.svg), used on the boot screen. `size` sets the width; height follows the logo's own aspect ratio. */
export function AppleLogo({
  size = 96,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const clipId = useId();

  return (
    <svg
      width={size}
      height={size * ASPECT_RATIO}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      fill="none"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M131.48 101.89L129.73 87.54C123.43 135.34 97.17 163.52 63.02 168.25V81.06C72.48 84.04 84.38 107.67 86.83 127.1H88.58V31.69H86.83C84.38 51.12 72.48 74.76 63.02 77.73V6.65C96.46 9.8 117.47 25.56 129.73 72.65L131.48 66.27C136.2 35.51 153.21 11.31 178.5 0H0V175.08H212.56C168.84 175.08 138.11 144.94 131.48 101.9V101.89Z"
          fill="currentColor"
        />
        <path d="M255.77 0C270.49 5.32 277.51 11.73 277.51 11.73V0H255.77Z" fill="currentColor" />
        <path
          d="M212.56 175.08H277.51V139.62C270.06 160.52 243.81 175.08 212.56 175.08Z"
          fill="currentColor"
        />
        <path
          d="M243.55 103.82C241.62 80.71 226.22 3.85 193.13 3.85C181.23 3.85 173.87 15.76 173.87 34.49C173.87 96.64 214.84 132.36 249.85 132.36C261.35 132.36 273.12 129.27 277.51 122.73V11.73L245.3 103.82H243.55Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
