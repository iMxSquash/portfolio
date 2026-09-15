import { StatusIcons } from "@/components/os/menu-bar/StatusIcons";
import { IOS_STATUS_BAR_CLEARANCE } from "@/lib/ios";
import { StatusBarClock } from "./StatusBarClock";

type StatusBarProps = {
  /**
   * `"overlay"` (springboard/lock screen, wallpaper behind) matches the
   * macOS menu bar's white-text-on-wallpaper treatment. `"content"` (an app
   * is open full screen) follows the theme foreground color instead, so it
   * stays legible over an app's own light/dark canvas — the closest
   * lightweight approximation of "la status bar... passe en couleur adaptée
   * à l'app" (os-ios-ui skill) without per-app color metadata in the
   * registry.
   */
  variant: "overlay" | "content";
};

/**
 * Fixed top bar: time on the left, wifi/battery on the right (see os-ios-ui
 * skill). No Liquid Glass material — same "sits directly over the content"
 * decision as the macOS menu bar (see MenuBar.tsx).
 */
export function StatusBar({ variant }: StatusBarProps) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-1000 flex items-end justify-between px-5 pb-1.5 text-[15px] font-semibold ${
        variant === "overlay"
          ? "text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]"
          : "text-foreground"
      }`}
      // Total box height = content height + the notch/Dynamic Island inset,
      // kept in border-box (Tailwind preflight default) so the inset eats
      // into padding rather than shrinking the content row.
      style={{ height: IOS_STATUS_BAR_CLEARANCE, paddingTop: "env(safe-area-inset-top)" }}
    >
      <StatusBarClock />
      <StatusIcons />
    </div>
  );
}
