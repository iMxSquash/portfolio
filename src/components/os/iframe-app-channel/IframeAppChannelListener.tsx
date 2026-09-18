"use client";

import { useEffect } from "react";
import { getProjectApps } from "@/lib/apps";
import { parseIframeToHostMessage } from "@/lib/iframe-app-channel";
import { useAppsStore } from "@/stores/useAppsStore";
import { useIframeAppChannelStore } from "@/stores/useIframeAppChannelStore";

/**
 * One global `message` listener for every `type: 'iframe'` project app (see
 * os-apps skill) — mounted once at the OS root rather than per window.
 * `event.origin` is matched against each iframe app's own registry URL to
 * find which app sent it: a `postMessage` sender is never trusted just
 * because it claims an app id, only because its origin matches one we
 * actually embedded.
 */
export function IframeAppChannelListener() {
  const apps = useAppsStore((state) => state.apps);
  const setMenus = useIframeAppChannelStore((state) => state.setMenus);

  useEffect(() => {
    const appIdByOrigin = new Map<string, string>();
    for (const app of getProjectApps(apps)) {
      if (app.type !== "iframe" || !app.url) continue;
      try {
        appIdByOrigin.set(new URL(app.url).origin, app.id);
      } catch {
        // Malformed URL in the registry — nothing to trust this app's messages against.
      }
    }

    function handleMessage(event: MessageEvent) {
      const appId = appIdByOrigin.get(event.origin);
      if (!appId) return;
      const message = parseIframeToHostMessage(event.data);
      if (!message) return;
      if (message.type === "menus") setMenus(appId, message.menus);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [apps, setMenus]);

  return null;
}
