import { create } from "zustand";
import type { MenuDefinition } from "@/lib/apps";
import { IFRAME_APP_CHANNEL, type HostToIframeMessage } from "@/lib/iframe-app-channel";

type RegisteredFrame = {
  window: Window;
  origin: string;
};

type IframeAppChannelState = {
  /** Live menus received from each iframe app, keyed by `appId` — takes priority over the registry's static `AppDefinition.menus` in MenuBar.tsx. */
  menusByAppId: Record<string, MenuDefinition[]>;
  setMenus: (appId: string, menus: MenuDefinition[]) => void;
  registerFrame: (appId: string, frame: RegisteredFrame) => void;
  unregisterFrame: (appId: string) => void;
  /** Asks the given iframe app to (re-)send its current menus — called once its `<iframe>` finishes loading. */
  requestMenus: (appId: string) => void;
  /** Forwards a clicked menu item down into the iframe app that owns it — only ever called for an app with live menus (see MenuBar.tsx). */
  sendMenuCommand: (appId: string, menuLabel: string, itemLabel: string) => void;
};

/**
 * The iframe's own `contentWindow` + expected origin per `appId`, so the host
 * can post commands back down. Kept outside the store: nothing renders from
 * it, and `Window` references don't belong in reactive state snapshots.
 */
const framesByAppId = new Map<string, RegisteredFrame>();

function postToFrame(frame: RegisteredFrame | undefined, message: HostToIframeMessage): void {
  frame?.window.postMessage(message, frame.origin);
}

export const useIframeAppChannelStore = create<IframeAppChannelState>()((set) => ({
  menusByAppId: {},

  setMenus: (appId, menus) =>
    set((state) => ({ menusByAppId: { ...state.menusByAppId, [appId]: menus } })),

  registerFrame: (appId, frame) => {
    framesByAppId.set(appId, frame);
  },

  unregisterFrame: (appId) => {
    framesByAppId.delete(appId);
    set((state) => {
      const menusByAppId = { ...state.menusByAppId };
      delete menusByAppId[appId];
      return { menusByAppId };
    });
  },

  requestMenus: (appId) => {
    postToFrame(framesByAppId.get(appId), { channel: IFRAME_APP_CHANNEL, type: "request-menus" });
  },

  sendMenuCommand: (appId, menuLabel, itemLabel) => {
    postToFrame(framesByAppId.get(appId), {
      channel: IFRAME_APP_CHANNEL,
      type: "menu-command",
      menuLabel,
      itemLabel,
    });
  },
}));
