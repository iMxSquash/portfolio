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

/**
 * Re-locks the session: lifts the anti-FOUC `.boot-seen` class (see
 * globals.css) that would otherwise keep `BootScreen` permanently hidden,
 * then re-enters its stage machine at "login". Shared by the macOS menu
 * bar's "Verrouiller l'écran" (see MenuBar.tsx) and the iOS corner-swipe
 * lock gesture (see LockCornerGesture.tsx) — both mode's own way in, same
 * effect, so this stays the one place that defines it.
 */
export function relockSession(setBootStage: (stage: BootStage) => void) {
  document.documentElement.classList.remove("boot-seen");
  setBootStage("login");
}
