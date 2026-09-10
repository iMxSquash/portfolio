/**
 * Decorative status icons (wifi, battery) — static placeholders, not read
 * from real device state. Wiring them to Control Center is a Phase 3 bonus,
 * not built yet.
 */
export function StatusIcons() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <WifiIcon />
      <BatteryIcon />
    </div>
  );
}

function WifiIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path d="M8 9.3c-1.1 0-2.1.4-2.9 1.1a.6.6 0 0 0 .8.9c.6-.5 1.3-.8 2.1-.8s1.5.3 2.1.8a.6.6 0 0 0 .8-.9A4.4 4.4 0 0 0 8 9.3Z" />
      <path d="M8 6.3c-1.9 0-3.6.7-5 1.9a.6.6 0 0 0 .8.9A6.4 6.4 0 0 1 8 7.5c1.6 0 3.1.6 4.2 1.6a.6.6 0 0 0 .8-.9 7.6 7.6 0 0 0-5-1.9Z" />
      <path d="M8 3.3C5.4 3.3 3 4.3 1.1 6a.6.6 0 0 0 .8.9C3.6 5.4 5.7 4.5 8 4.5s4.4.9 6.1 2.4a.6.6 0 0 0 .8-.9C13 4.3 10.6 3.3 8 3.3Z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="22" height="15" viewBox="0 0 24 15" fill="none">
      <rect x="1" y="2" width="19" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2.5" y="3.5" width="14" height="8" rx="1.2" fill="currentColor" />
      <path d="M22 6v3a1.5 1.5 0 0 0 0-3Z" fill="currentColor" />
    </svg>
  );
}
