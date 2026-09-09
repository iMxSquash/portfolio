"use client";

import { AnimatePresence } from "framer-motion";
import { getApp, type AppDefinition } from "@/lib/apps";
import { useWindowStore } from "@/stores/useWindowStore";
import { Window } from "./Window";

type WindowManagerProps = {
  apps: AppDefinition[];
};

/** Renders every open window from `useWindowStore`, resolved against the apps registry. */
export function WindowManager({ apps }: WindowManagerProps) {
  const windows = useWindowStore((state) => state.windows);

  return (
    <AnimatePresence>
      {Object.values(windows).map((windowState) => {
        const app = getApp(apps, windowState.appId);
        if (!app) return null;
        const Content = app.type === "component" ? app.component : undefined;

        return (
          <Window key={app.id} app={app} state={windowState}>
            {Content ? <Content /> : null}
          </Window>
        );
      })}
    </AnimatePresence>
  );
}
