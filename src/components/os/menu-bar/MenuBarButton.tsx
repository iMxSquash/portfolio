"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type MenuBarButtonProps = {
  id: string;
  label: ReactNode;
  ariaLabel?: string;
  bold?: boolean;
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  children: ReactNode;
};

/**
 * A single menu-bar trigger + its dropdown panel. The panel is rendered
 * through a portal into `document.body` instead of as a DOM child: the menu
 * bar itself is a `liquid-glass` surface, and nesting another blurred glass
 * layer inside it is the "glass-on-glass" anti-pattern (see
 * liquid-glass-tailwind skill) — expensive and buggy in Safari.
 */
export function MenuBarButton({
  id,
  label,
  ariaLabel,
  bold,
  openId,
  onOpenChange,
  children,
}: MenuBarButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; left?: number; right?: number } | null>(
    null,
  );
  const isOpen = openId === id;

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const top = rect.bottom + 4;
    // Triggers on the right half of the bar (status icons, Control Center)
    // anchor the panel from the right edge, otherwise `left: rect.left`
    // pushes a wide panel straight off the viewport.
    if (rect.left > window.innerWidth / 2) {
      setPosition({ top, right: window.innerWidth - rect.right });
    } else {
      setPosition({ top, left: rect.left });
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => onOpenChange(isOpen ? null : id)}
        onPointerEnter={() => {
          if (openId !== null && openId !== id) onOpenChange(id);
        }}
        className={`flex h-full items-center rounded-[4px] px-2 text-[13px] ${bold ? "font-semibold" : ""} ${
          isOpen ? "bg-white/25 dark:bg-white/15" : ""
        }`}
      >
        {label}
      </button>
      {isOpen && position
        ? createPortal(
            <div
              role="menu"
              className="liquid-glass fixed z-[1001] min-w-56 rounded-lg p-1 shadow-glass-lg"
              style={{ top: position.top, left: position.left, right: position.right }}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function MenuBarMenuItem({
  label,
  shortcut,
  onSelect,
}: {
  label: string;
  shortcut?: string;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      // Panel is `rounded-lg` (8px) with `p-1` (4px) padding — concentric child radius is 8-4=4px (see liquid-glass-tailwind skill).
      className="flex w-full items-center justify-between gap-4 rounded-[4px] px-2 py-1 text-left text-[13px] hover:bg-system-blue hover:text-white"
    >
      <span>{label}</span>
      {shortcut ? <span className="text-xs opacity-60">{shortcut}</span> : null}
    </button>
  );
}

export function MenuBarMenuSeparator() {
  return <hr className="my-1 border-black/10 dark:border-white/10" />;
}
