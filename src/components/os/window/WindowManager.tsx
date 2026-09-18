"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { IframeWindow } from "@/components/apps/iframe/IframeWindow";
import { OpenFullscreenButton } from "@/components/apps/iframe/OpenFullscreenButton";
import { getApp, type AppDefinition } from "@/lib/apps";
import { playSystemSound } from "@/lib/sounds";
import { useSpotlightStore } from "@/stores/useSpotlightStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { Window } from "./Window";

type WindowManagerProps = {
  apps: AppDefinition[];
};

/** Text entry currently has keyboard focus — Escape/Cmd+\` below must stay out of its way. */
function isEditableElement(element: Element | null): boolean {
  if (!element) return false;
  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.hasAttribute("contenteditable")
  );
}

/** Renders every open window from `useWindowStore`, resolved against the apps registry. */
export function WindowManager({ apps }: WindowManagerProps) {
  const windows = useWindowStore((state) => state.windows);

  // Keyboard-only window navigation (WCAG "tout doit être utilisable au
  // clavier", see TODO.md Phase 9): Escape closes the focused window,
  // Cmd/Ctrl+` cycles focus through open windows — real macOS's own "Cycle
  // Through Windows" shortcut, reused here rather than hijacking plain Tab
  // (which must keep moving focus between controls inside the active
  // window). Reads `useWindowStore.getState()` fresh on every keystroke
  // instead of subscribing, so this listener attaches once for the
  // component's lifetime rather than re-attaching on every window
  // open/close/focus/drag.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableElement(document.activeElement)) return;
      if (useSpotlightStore.getState().open) return;

      const store = useWindowStore.getState();

      if (event.key === "Escape" && store.focusedAppId) {
        event.preventDefault();
        playSystemSound("close");
        store.closeWindow(store.focusedAppId);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "`") {
        const openAppIds = Object.values(store.windows)
          .filter((win) => !win.isMinimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((win) => win.appId);
        if (openAppIds.length < 2) return;
        event.preventDefault();
        const currentIndex = store.focusedAppId ? openAppIds.indexOf(store.focusedAppId) : -1;
        const nextAppId = openAppIds[(currentIndex + 1) % openAppIds.length];
        if (nextAppId) store.focusWindow(nextAppId);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {Object.values(windows).map((windowState) => {
        const app = getApp(apps, windowState.appId);
        if (!app) return null;
        const iframeUrl = app.type === "iframe" ? app.url : undefined;

        return (
          <Window
            key={app.id}
            app={app}
            state={windowState}
            titleBarTrailing={iframeUrl ? <OpenFullscreenButton url={iframeUrl} /> : null}
          >
            {app.type === "component" && app.component ? <app.component /> : null}
            {iframeUrl ? <IframeWindow appId={app.id} url={iframeUrl} /> : null}
          </Window>
        );
      })}
    </AnimatePresence>
  );
}
