"use client";

import { useState } from "react";
import { SiteLogo } from "@/components/icons/SiteLogo";
import { ABOUT_THIS_MAC_APP_ID, getApp, launchApp } from "@/lib/apps";
import { DISPLAY_NAME } from "@/lib/boot";
import { SITE_TAGLINE } from "@/lib/seo";
import { useAppsStore } from "@/stores/useAppsStore";
import { useOSStore } from "@/stores/useOSStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useWindowStore } from "@/stores/useWindowStore";
import { SettingsGroup } from "../controls/SettingsGroup";
import { SettingsRow } from "../controls/SettingsRow";
import { SettingsSecondaryButton } from "../controls/SettingsSecondaryButton";

/**
 * Général: identity blurb, a link to the About-This-Mac easter egg (desktop
 * only — it has no iOS equivalent and its "Ouvrir…" button goes through the
 * macOS-only window manager, see TODO-settings.md Phase 9), and the
 * reset-everything escape hatch (both platforms).
 */
export function GeneralPane() {
  const apps = useAppsStore((state) => state.apps);
  const openWindow = useWindowStore((state) => state.openWindow);
  const resetAll = useSettingsStore((state) => state.resetAll);
  const isDesktop = useOSStore((state) => state.mode) === "macos";
  // Inline two-step confirmation instead of `window.confirm` (see TODO-settings.md).
  const [confirmingReset, setConfirmingReset] = useState(false);

  function openAboutThisMac() {
    const aboutApp = getApp(apps, ABOUT_THIS_MAC_APP_ID);
    if (aboutApp) launchApp(aboutApp, openWindow);
  }

  function handleResetClick() {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    resetAll();
    setConfirmingReset(false);
  }

  return (
    <div>
      <SettingsGroup srOnlyTitle="Identité">
        <SettingsRow label={DISPLAY_NAME} description={SITE_TAGLINE}>
          <SiteLogo size={28} />
        </SettingsRow>
        {isDesktop ? (
          <SettingsRow label="À propos de ce Mac">
            <SettingsSecondaryButton onClick={openAboutThisMac}>Ouvrir…</SettingsSecondaryButton>
          </SettingsRow>
        ) : null}
      </SettingsGroup>

      <SettingsGroup
        srOnlyTitle="Réinitialisation"
        helpText="Remet le Liquid Glass, l'accessibilité, le Dock, le son et la couleur d'accentuation à leurs valeurs d'origine. Le thème et le fond d'écran ne sont pas concernés."
      >
        <SettingsRow label="Réinitialiser tous les réglages">
          <div className="flex items-center gap-2">
            {confirmingReset ? (
              <span className="text-foreground/55 text-[12px]">Confirmer ?</span>
            ) : null}
            <SettingsSecondaryButton
              onClick={handleResetClick}
              onBlur={() => setConfirmingReset(false)}
              variant={confirmingReset ? "destructive" : "default"}
            >
              {confirmingReset ? "Réinitialiser" : "Réinitialiser…"}
            </SettingsSecondaryButton>
          </div>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}
