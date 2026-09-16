import { StatusIcons } from "@/components/os/menu-bar/StatusIcons";
import { IOS_STATUS_BAR_CLEARANCE, IOS_STATUS_BAR_FADE_MASK } from "@/lib/ios";
import { StatusBarClock } from "./StatusBarClock";

type StatusBarProps = {
  /**
   * `"overlay"` (springboard/lock screen, wallpaper behind) matches the
   * macOS menu bar's white-text-on-wallpaper treatment. `"content"` (an app
   * is open full screen) sits over a frosted blur/fade scrim instead, tinted
   * black or white from the OS theme (not per-app content) so the clock and
   * status icons keep guaranteed contrast whatever the app renders
   * underneath — the lightweight approximation of "la status bar... passe en
   * couleur adaptée à l'app" (os-ios-ui skill) without per-app color
   * metadata in the registry.
   */
  variant: "overlay" | "content";
};

/**
 * Fixed top bar: time on the left, wifi/battery on the right (see os-ios-ui
 * skill). The springboard/lock screen ("overlay") sits directly over the
 * wallpaper, same as the macOS menu bar (see MenuBar.tsx) — no material. An
 * open app ("content") gets a blurred, theme-tinted scrim behind the text
 * instead, fading out toward the bar's bottom edge — real app content now
 * extends up underneath this bar (see `AppFullScreenView.tsx`), so there's
 * something worth blurring. `pointer-events-none` on the whole bar: it can
 * now geometrically overlap real, interactive app content (e.g. an iframe's
 * own top nav), and nothing in here (clock, icons) is itself interactive.
 */
export function StatusBar({ variant }: StatusBarProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-1000 flex items-end justify-between px-5 pb-1.5 text-[15px] font-semibold ${
        variant === "overlay"
          ? "text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]"
          : "text-foreground"
      }`}
      // Total box height = content height + the notch/Dynamic Island inset,
      // kept in border-box (Tailwind preflight default) so the inset eats
      // into padding rather than shrinking the content row.
      style={{ height: IOS_STATUS_BAR_CLEARANCE, paddingTop: "env(safe-area-inset-top)" }}
    >
      {variant === "content" ? (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-white/40 backdrop-blur-lg backdrop-saturate-[180%] dark:bg-black/35"
          style={{ maskImage: IOS_STATUS_BAR_FADE_MASK, WebkitMaskImage: IOS_STATUS_BAR_FADE_MASK }}
        />
      ) : null}
      <StatusBarClock />
      <StatusIcons />
    </div>
  );
}
