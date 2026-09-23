import { useId, type ReactNode } from "react";

type SettingsGroupProps = {
  /** Visible heading above the inset box — real macOS System Settings often groups controls with no heading at all. */
  title?: string;
  /**
   * Accessible name for a group with no visible `title` (real macOS still
   * gives these an accessible name even when nothing is shown on screen, so
   * a screen reader can tell groups apart). Ignored when `title` is set,
   * since the visible heading already labels the group.
   */
  srOnlyTitle?: string;
  /** Optional help text below the box (e.g. a performance note). */
  helpText?: string;
  children: ReactNode;
};

/**
 * Rounded inset box (System Settings' signature "group" card) — rows inside
 * are separated by a hairline via `divide-y`, see `SettingsRow.tsx`. Always
 * carries an accessible name (`title` or `srOnlyTitle`) via `aria-labelledby`,
 * even when nothing is shown on screen.
 */
export function SettingsGroup({ title, srOnlyTitle, helpText, children }: SettingsGroupProps) {
  const headingId = useId();
  const heading = title ?? srOnlyTitle;

  return (
    <section aria-labelledby={heading ? headingId : undefined} className="mb-6">
      {heading ? (
        <h2
          id={headingId}
          className={
            title
              ? "text-foreground/55 mb-2 px-1 text-[11px] font-semibold tracking-wide uppercase"
              : "sr-only"
          }
        >
          {heading}
        </h2>
      ) : null}
      <div className="divide-y divide-black/8 overflow-hidden rounded-[10px] bg-black/[0.03] dark:divide-white/8 dark:bg-white/[0.04]">
        {children}
      </div>
      {helpText ? <p className="text-foreground/55 mt-2 px-1 text-[11px]">{helpText}</p> : null}
    </section>
  );
}
