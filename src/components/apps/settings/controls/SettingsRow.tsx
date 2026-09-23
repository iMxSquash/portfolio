import type { ReactNode } from "react";

type SettingsRowProps = {
  label: string;
  description?: string;
  /**
   * Id of the row's own control, for a real `<label htmlFor>` association
   * (native `<input>`s — see `SettingsSlider.tsx`). Leave unset for a control
   * that already carries its own `aria-label` (`Toggle`, `SegmentedControl`).
   */
  controlId?: string;
  children: ReactNode;
};

/** One line inside a `SettingsGroup`: label (+ optional description) left, control right — min 44px tall (see apple-design skill's minimum control size). */
export function SettingsRow({ label, description, controlId, children }: SettingsRowProps) {
  const labelContent = (
    <>
      <span className="block truncate text-[13px]">{label}</span>
      {description ? <p className="text-foreground/55 mt-0.5 text-[11px]">{description}</p> : null}
    </>
  );

  return (
    <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-2.5">
      {controlId ? (
        <label htmlFor={controlId} className="min-w-0 cursor-pointer">
          {labelContent}
        </label>
      ) : (
        <div className="min-w-0">{labelContent}</div>
      )}
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}
