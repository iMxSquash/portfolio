import { IconWifi } from "@tabler/icons-react";

/**
 * Decorative status icons (wifi, battery) — static placeholders, not read
 * from real device state. Wiring them to Control Center is a Phase 3 bonus,
 * not built yet.
 */
export function StatusIcons() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <IconWifi size={15} stroke={2.2} />
      <BatteryIcon />
    </div>
  );
}

// Kept bespoke (no Tabler swap): the real macOS status-bar battery is a
// solid fill bar inside an outline capsule, not the segmented-bars look of
// generic battery icon sets — see os-macos-ui skill on fidelity.
function BatteryIcon() {
  return (
    <svg width="22" height="15" viewBox="0 0 24 15" fill="none">
      <rect x="1" y="2" width="19" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2.5" y="3.5" width="14" height="8" rx="1.2" fill="currentColor" />
      <path d="M22 6v3a1.5 1.5 0 0 0 0-3Z" fill="currentColor" />
    </svg>
  );
}
