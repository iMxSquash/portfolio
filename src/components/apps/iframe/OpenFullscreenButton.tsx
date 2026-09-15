"use client";

import { IconExternalLink } from "@tabler/icons-react";
import { openInNewTab } from "@/lib/apps";

type OpenFullscreenButtonProps = {
  url: string;
};

/** Title bar action for iframe windows: opens the project's own subdomain directly (see os-apps skill). */
export function OpenFullscreenButton({ url }: OpenFullscreenButtonProps) {
  return (
    <button
      type="button"
      aria-label="Ouvrir en plein écran"
      title="Ouvrir en plein écran"
      onClick={() => openInNewTab(url)}
      className="hover:bg-foreground/8 focus-visible:outline-system-blue flex size-5 items-center justify-center rounded-[6px] focus-visible:outline-2"
    >
      <IconExternalLink size={13} stroke={1.75} />
    </button>
  );
}
