import { useId } from "react";
import { SiteLogo } from "@/components/icons/SiteLogo";

/** "About This Mac" easter egg icon (see os-apps skill): a system-blue tile carrying the site mark, echoing real macOS's grey Mac-silhouette icon without tracing it. */
export function AboutThisMacIcon() {
  const uid = useId();

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`about-bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#0A84FF" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill={`url(#about-bg-${uid})`} />
      <g transform="translate(24 33)" className="text-white">
        <SiteLogo size={52} />
      </g>
    </svg>
  );
}
