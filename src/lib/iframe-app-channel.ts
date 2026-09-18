import type { MenuDefinition, MenuEntryDefinition } from "./apps";

/**
 * Generic `postMessage` protocol between the portfolio shell and any
 * `type: 'iframe'` project app (see os-apps skill) — not specific to a given
 * project. Today it only carries menu-bar content/commands (see MenuBar.tsx),
 * but any iframe app can plug into it the same way. The discriminant
 * `channel` field lets the listener ignore unrelated `postMessage` traffic
 * (browser extensions, analytics embeds) sharing the same window.
 */
export const IFRAME_APP_CHANNEL = "elwen-os" as const;

export type IframeToHostMessage = {
  channel: typeof IFRAME_APP_CHANNEL;
  type: "menus";
  menus: MenuDefinition[];
};

export type HostToIframeMessage =
  | { channel: typeof IFRAME_APP_CHANNEL; type: "request-menus" }
  | {
      channel: typeof IFRAME_APP_CHANNEL;
      type: "menu-command";
      menuLabel: string;
      itemLabel: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMenuEntry(value: unknown): value is MenuEntryDefinition {
  if (!isRecord(value)) return false;
  if (value.separator === true) return true;
  return (
    typeof value.label === "string" &&
    (value.shortcut === undefined || typeof value.shortcut === "string")
  );
}

function isMenuDefinition(value: unknown): value is MenuDefinition {
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    Array.isArray(value.items) &&
    value.items.every(isMenuEntry)
  );
}

/**
 * Never trust `postMessage` payloads by shape alone — validates every field
 * before the caller acts on it. Returns `null` for anything malformed or
 * unrelated instead of throwing, so the listener can just skip it.
 */
export function parseIframeToHostMessage(data: unknown): IframeToHostMessage | null {
  if (!isRecord(data) || data.channel !== IFRAME_APP_CHANNEL) return null;
  if (data.type === "menus" && Array.isArray(data.menus) && data.menus.every(isMenuDefinition)) {
    return { channel: IFRAME_APP_CHANNEL, type: "menus", menus: data.menus };
  }
  return null;
}
