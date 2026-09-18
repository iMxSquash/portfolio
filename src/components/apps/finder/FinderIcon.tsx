import { useId } from "react";

export function FinderIcon() {
  // Can render more than once per page (dock + Spotlight results) — gradient
  // and clip-path ids must be unique per instance, not shared literals.
  const uid = useId();

  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" role="img" aria-hidden="true">
      <g clipPath={`url(#finder-clip-${uid})`}>
        <path
          d="M40.2426 -3.8147e-06H7.10163C3.17951 -3.8147e-06 0 3.1795 0 7.10162V40.2426C0 44.1647 3.17951 47.3442 7.10163 47.3442H40.2426C44.1647 47.3442 47.3442 44.1647 47.3442 40.2426V7.10162C47.3442 3.1795 44.1647 -3.8147e-06 40.2426 -3.8147e-06Z"
          fill={`url(#finder-left-${uid})`}
        />
        <path
          d="M40.2426 -7.62939e-06H25.3735C23.4132 4.54947 19.8994 11.984 19.7514 26.2057C19.7489 26.3283 19.7711 26.4501 19.8166 26.5639C19.862 26.6777 19.9299 26.7813 20.0161 26.8684C20.1024 26.9555 20.2052 27.0244 20.3186 27.071C20.432 27.1176 20.5535 27.1409 20.6761 27.1397H26.104C26.2266 27.1396 26.348 27.1642 26.4609 27.2119C26.5738 27.2596 26.676 27.3296 26.7614 27.4175C26.8467 27.5055 26.9136 27.6097 26.9579 27.724C27.0023 27.8383 27.0232 27.9603 27.0195 28.0829C26.8846 34.5492 27.477 41.0102 28.7856 47.3442H40.2426C42.126 47.3442 43.9324 46.596 45.2642 45.2642C46.596 43.9324 47.3442 42.126 47.3442 40.2426V7.10162C47.3442 5.21815 46.596 3.41182 45.2642 2.08001C43.9324 0.748198 42.126 -7.62939e-06 40.2426 -7.62939e-06Z"
          fill={`url(#finder-right-${uid})`}
        />
        <path
          d="M34.3061 13.7779V16.9219M13.1306 13.7779V16.9219M37.487 30.5333C33.7779 34.111 28.8255 36.1102 23.6721 36.1102C18.5188 36.1102 13.5664 34.111 9.85724 30.5333"
          stroke="black"
          strokeWidth="1.84938"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <linearGradient id={`finder-left-${uid}`} x1="0" y1="4734.42" x2="0" y2="-3.8147e-06" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E73F2" />
          <stop offset="1" stopColor="#19D3FD" />
        </linearGradient>
        <linearGradient id={`finder-right-${uid}`} x1="19.7512" y1="4734.42" x2="19.7512" y2="-7.62939e-06" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DBE9F4" />
          <stop offset="1" stopColor="#F7F6F6" />
        </linearGradient>
        <clipPath id={`finder-clip-${uid}`}>
          <rect width="47.3442" height="47.3442" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
