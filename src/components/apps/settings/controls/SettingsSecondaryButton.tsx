import type { ButtonHTMLAttributes, ReactNode } from "react";

type SettingsSecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** "destructive" is the reddened confirm step of a two-step action (see GeneralPane's reset button). */
  variant?: "default" | "destructive";
};

/** The small bordered pill button repeated across panes: "Ouvrir…", "Réinitialiser…", "Tester"… */
export function SettingsSecondaryButton({
  children,
  variant = "default",
  className = "",
  ...buttonProps
}: SettingsSecondaryButtonProps) {
  const variantClass =
    variant === "destructive"
      ? "bg-red-500 text-white hover:bg-red-600"
      : "border border-black/10 hover:bg-black/4 dark:border-white/15 dark:hover:bg-white/4";

  return (
    <button
      type="button"
      {...buttonProps}
      className={`focus-visible:outline-system-blue rounded-full px-3 py-1 text-[12px] font-medium focus-visible:outline-2 disabled:opacity-40 ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}
