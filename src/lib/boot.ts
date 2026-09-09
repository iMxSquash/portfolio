export type BootStage = "booting" | "login" | "unlocking" | "done";

export const BOOT_STORAGE_KEY = "boot-seen";

export const BOOT_DURATION_S = 2.2;
export const BOOT_DURATION_S_REDUCED = 0.2;

export const UNLOCK_DURATION_S = 0.35;
export const UNLOCK_DURATION_S_REDUCED = 0.05;

export const DISPLAY_NAME = "Elwen";

/** Session-scoped: wrapped in try/catch since private browsing can throw or no-op on storage access. */
export function hasSeenBootThisSession(): boolean {
  try {
    return sessionStorage.getItem(BOOT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markBootSeenThisSession() {
  try {
    sessionStorage.setItem(BOOT_STORAGE_KEY, "1");
  } catch {
    // Storage unavailable (e.g. private browsing) — the sequence just replays next time, harmless.
  }
}
