"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getMobileApps, type AppDefinition } from "@/lib/apps";
import {
  chunkIntoPages,
  IOS_STATUS_BAR_CLEARANCE,
  IOS_TABLET_MIN_WIDTH_QUERY,
  SPRINGBOARD_COLUMNS_PHONE,
  SPRINGBOARD_COLUMNS_TABLET,
  SPRINGBOARD_MAX_ROWS_PHONE,
  SPRINGBOARD_MAX_ROWS_TABLET,
} from "@/lib/ios";
import { useMediaQuery } from "@/lib/use-media-query";
import { SpringboardIcon } from "./SpringboardIcon";

type SpringboardProps = {
  apps: AppDefinition[];
};

// Content clears the status bar above and the iOS dock below, both of which
// float over the springboard rather than pushing its layout.
const PAGE_TOP_INSET = `calc(${IOS_STATUS_BAR_CLEARANCE} + 16px)`;
const PAGE_BOTTOM_INSET = "calc(var(--ios-dock-height) + env(safe-area-inset-bottom) + 24px)";

/**
 * Icon grid with horizontal, swipe-paginated pages (see os-ios-ui skill).
 * `scroll-snap` drives the paging — more reliable than a hand-rolled drag
 * gesture for this — and a scroll listener only derives which page is
 * current, for the dots.
 */
export function Springboard({ apps }: SpringboardProps) {
  const reducedMotion = useReducedMotion();
  const isTablet = useMediaQuery(IOS_TABLET_MIN_WIDTH_QUERY);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const columns = isTablet ? SPRINGBOARD_COLUMNS_TABLET : SPRINGBOARD_COLUMNS_PHONE;
  const rows = isTablet ? SPRINGBOARD_MAX_ROWS_TABLET : SPRINGBOARD_MAX_ROWS_PHONE;
  // Every mobile-visible app, dock ones included — real iOS allows an app to
  // live on a springboard page and in the dock at once (see getIOSDockApps).
  const pages = chunkIntoPages(getMobileApps(apps), columns * rows);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setCurrentPage(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <motion.div
      key="springboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.15 }}
      className="absolute inset-0"
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-x" }}
      >
        {pages.map((pageApps, pageIndex) => (
          <div
            key={pageIndex}
            className="grid h-full w-full shrink-0 snap-start content-start gap-x-4 gap-y-7 px-6"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              paddingTop: PAGE_TOP_INSET,
              paddingBottom: PAGE_BOTTOM_INSET,
            }}
          >
            {pageApps.map((app) => (
              <SpringboardIcon key={app.id} app={app} />
            ))}
          </div>
        ))}
      </div>

      {pages.length > 1 ? (
        <div
          className="pointer-events-none absolute inset-x-0 flex justify-center gap-1.5"
          style={{ bottom: "calc(var(--ios-dock-height) + env(safe-area-inset-bottom) + 8px)" }}
        >
          {pages.map((_, pageIndex) => (
            <span
              key={pageIndex}
              aria-hidden="true"
              className={`size-1.5 rounded-full transition-opacity ${
                pageIndex === currentPage ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
