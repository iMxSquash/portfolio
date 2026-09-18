"use client";

import { useEffect, useRef, useState } from "react";
import { IconWorldOff } from "@tabler/icons-react";
import { openInNewTab } from "@/lib/apps";
import { useIframeAppChannelStore } from "@/stores/useIframeAppChannelStore";

/**
 * `onLoad` doesn't fire reliably when a host blocks embedding (it often
 * "loads" an error page instead) — see os-apps skill. This timeout is the
 * fallback: no successful load within this window means blocked.
 */
const LOAD_TIMEOUT_MS = 8000;

type LoadStatus = "loading" | "loaded" | "blocked";

type IframeWindowProps = {
  appId: string;
  url: string;
};

/**
 * Shared window content for every `type: 'iframe'` project app (see os-apps
 * skill). Stays mounted across minimize so the embedded project keeps its
 * state — the window manager only hides it visually, never unmounts it.
 */
export function IframeWindow({ appId, url }: IframeWindowProps) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const registerFrame = useIframeAppChannelStore((state) => state.registerFrame);
  const unregisterFrame = useIframeAppChannelStore((state) => state.unregisterFrame);
  const requestMenus = useIframeAppChannelStore((state) => state.requestMenus);

  // Runs once per mounted iframe window — a given window instance keeps the
  // same `url` for its whole life (see os-apps skill), so there's no case to
  // resync on `url` changing.
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setStatus((current) => (current === "loading" ? "blocked" : current));
    }, LOAD_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Unregisters this app's frame from the menu-bar channel (see
  // useIframeAppChannelStore) whenever the window itself is closed —
  // otherwise a stale `contentWindow` reference could linger in the store.
  useEffect(() => () => unregisterFrame(appId), [appId, unregisterFrame]);

  function handleLoad() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("loaded");
    const contentWindow = iframeRef.current?.contentWindow;
    if (contentWindow) {
      registerFrame(appId, { window: contentWindow, origin: new URL(url).origin });
      requestMenus(appId);
    }
  }

  return (
    <div className="relative h-full w-full">
      {status === "blocked" ? (
        <div className="bg-window-canvas absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <IconWorldOff size={32} stroke={1.5} className="opacity-40" aria-hidden="true" />
          <p className="max-w-64 text-[13px] opacity-60">
            Ce projet ne peut pas s&apos;afficher ici.
          </p>
          <button
            type="button"
            onClick={() => openInNewTab(url)}
            className="bg-system-blue rounded-lg px-3 py-1.5 text-[13px] font-medium text-white"
          >
            Ouvrir dans un nouvel onglet
          </button>
        </div>
      ) : (
        <>
          <iframe
            ref={iframeRef}
            src={url}
            title={url}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={handleLoad}
            className="h-full w-full border-0"
          />
          {status === "loading" ? (
            <div className="bg-window-canvas absolute inset-0 flex items-center justify-center">
              <span
                className="border-foreground/15 border-t-foreground/60 size-6 animate-spin rounded-full border-2"
                aria-hidden="true"
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
