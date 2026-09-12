"use client";

import { useEffect, useRef, useState } from "react";
import { SiteLogo } from "@/components/icons/SiteLogo";
import { SpotlightIcon } from "@/components/os/spotlight/Spotlight";
import { getApp, type AppDefinition } from "@/lib/apps";
import { APPLE_MENU_ITEMS, DEFAULT_APP_MENUS } from "@/lib/menu-bar";
import { useBootStore } from "@/stores/useBootStore";
import { useSpotlightStore } from "@/stores/useSpotlightStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { Clock } from "./Clock";
import { ControlCenterContent, ControlCenterIcon } from "./ControlCenter";
import { MenuBarButton, MenuBarMenuItem, MenuBarMenuSeparator } from "./MenuBarButton";
import { StatusIcons } from "./StatusIcons";

type MenuBarProps = {
  apps: AppDefinition[];
};

/**
 * Fixed top bar: portfolio logo (stands in for the Apple logo — the real
 * one is trademarked), focused app name + its menus, then status
 * icons/clock on the right. Reads the focused app from `useWindowStore`;
 * falls back to "Finder" when nothing is focused (see os-macos-ui skill).
 */
export function MenuBar({ apps }: MenuBarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const focusedAppId = useWindowStore((state) => state.focusedAppId);
  const setBootStage = useBootStore((state) => state.setStage);

  const toggleSpotlight = useSpotlightStore((state) => state.toggle);

  const focusedApp = focusedAppId ? getApp(apps, focusedAppId) : undefined;
  const appName = focusedApp?.name ?? "Finder";
  const menus = focusedApp?.menus ?? DEFAULT_APP_MENUS;

  useEffect(() => {
    if (!openMenuId) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Element;
      // Dropdown panels are portaled to <body> (see MenuBarButton), so they
      // aren't inside `barRef` — recognize them via their shared role.
      if (barRef.current?.contains(target) || target.closest('[role="menu"]')) return;
      setOpenMenuId(null);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
        return;
      }
      // Real macOS: while a menu is open, Left/Right moves to and opens the
      // adjacent menu (cycling), keeping focus on its trigger.
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (!barRef.current) return;
      const triggers = Array.from(
        barRef.current.querySelectorAll<HTMLElement>("[data-menu-id]"),
      );
      const index = triggers.findIndex((el) => el.dataset.menuId === openMenuId);
      if (index === -1) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = triggers[(index + delta + triggers.length) % triggers.length];
      const nextId = next?.dataset.menuId;
      if (nextId) {
        setOpenMenuId(nextId);
        next.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuId]);

  return (
    <div
      ref={barRef}
      className="liquid-glass glass-hairline fixed inset-x-0 top-0 z-1000 flex h-(--menu-bar-height) items-center gap-1 rounded-none border-x-0 border-t-0 px-2 text-[13px] text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]"
    >
      <MenuBarButton
        id="apple"
        ariaLabel="Menu"
        openId={openMenuId}
        onOpenChange={setOpenMenuId}
        label={<SiteLogo size={14} />}
      >
        {APPLE_MENU_ITEMS.map((item) =>
          "label" in item ? (
            <MenuBarMenuItem
              key={item.id}
              label={item.label}
              onSelect={() => {
                setOpenMenuId(null);
                if (item.id === "lock") {
                  // The anti-FOUC `.boot-seen` class (see globals.css) permanently
                  // hides `.boot-screen-root` via CSS once the boot sequence has
                  // played this session — necessary before hydration, but it would
                  // also swallow this deliberate re-lock. Lift it only here.
                  document.documentElement.classList.remove("boot-seen");
                  setBootStage("login");
                }
              }}
            />
          ) : (
            <MenuBarMenuSeparator key={item.id} />
          ),
        )}
      </MenuBarButton>

      <span className="px-1 font-semibold">{appName}</span>

      {menus.map((menu) => (
        <MenuBarButton
          key={menu.label}
          id={`app-${menu.label}`}
          openId={openMenuId}
          onOpenChange={setOpenMenuId}
          label={menu.label}
        >
          {menu.items.map((item) => (
            <MenuBarMenuItem
              key={item.label}
              label={item.label}
              shortcut={item.shortcut}
              onSelect={() => setOpenMenuId(null)}
            />
          ))}
        </MenuBarButton>
      ))}

      <div className="ml-auto flex items-center gap-1">
        <StatusIcons />
        <MenuBarButton
          id="control-center"
          ariaLabel="Centre de contrôle"
          openId={openMenuId}
          onOpenChange={setOpenMenuId}
          label={<ControlCenterIcon className="size-4" />}
        >
          <ControlCenterContent />
        </MenuBarButton>
        <button
          type="button"
          aria-label="Spotlight"
          onClick={toggleSpotlight}
          className="flex h-full items-center rounded-sm px-2"
        >
          <SpotlightIcon className="size-4" />
        </button>
        <Clock />
      </div>
    </div>
  );
}
