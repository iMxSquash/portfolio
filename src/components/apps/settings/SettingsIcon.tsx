import { useId } from "react";

/**
 * "Réglages Système" app icon: a recreated (not traced) macOS 26 gear glyph
 * over a silver squircle background, following the same
 * gradient-fill-plus-unique-ids pattern as `FinderIcon.tsx` (can render more
 * than once per page — dock + Spotlight results).
 */
export function SettingsIcon() {
  const uid = useId();

  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" role="img" aria-hidden="true">
      <g clipPath={`url(#settings-clip-${uid})`}>
        <rect width="47.3442" height="47.3442" fill={`url(#settings-bg-${uid})`} />
        <path
          d="M20.78 9.15 L21.77 5.13 L26.23 5.13 L27.22 9.15 L28.70 9.54 L30.12 10.09 L33.29 7.43 L36.89 10.04 L35.34 13.88 L36.30 15.07 L37.13 16.34 L41.26 16.05 L42.63 20.29 L39.12 22.47 L39.20 24.00 L39.12 25.53 L42.63 27.71 L41.26 31.95 L37.13 31.66 L36.30 32.93 L35.34 34.12 L36.89 37.96 L33.29 40.57 L30.12 37.91 L28.70 38.46 L27.22 38.85 L26.23 42.87 L21.77 42.87 L20.78 38.85 L19.30 38.46 L17.88 37.91 L14.71 40.57 L11.11 37.96 L12.66 34.12 L11.70 32.93 L10.87 31.66 L6.74 31.95 L5.37 27.71 L8.88 25.53 L8.80 24.00 L8.88 22.47 L5.37 20.29 L6.74 16.05 L10.87 16.34 L11.70 15.07 L12.66 13.88 L11.11 10.04 L14.71 7.43 L17.88 10.09 L19.30 9.54 Z"
          fill={`url(#settings-gear-${uid})`}
          fillRule="evenodd"
        />
        <circle cx="24" cy="24" r="7.5" fill={`url(#settings-bg-${uid})`} />
      </g>
      <defs>
        <linearGradient
          id={`settings-bg-${uid}`}
          x1="0"
          y1="0"
          x2="0"
          y2="47.3442"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E4E4E9" />
          <stop offset="1" stopColor="#A9A9B0" />
        </linearGradient>
        <linearGradient
          id={`settings-gear-${uid}`}
          x1="24"
          y1="5.13"
          x2="24"
          y2="42.87"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E8E93" />
          <stop offset="1" stopColor="#5B5B60" />
        </linearGradient>
        <clipPath id={`settings-clip-${uid}`}>
          <rect width="47.3442" height="47.3442" rx="10.65" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
