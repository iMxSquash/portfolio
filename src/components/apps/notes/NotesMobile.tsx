"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { IconChevronLeft } from "@tabler/icons-react";
import { LinkifiedText } from "@/components/apps/notes/LinkifiedText";
import { IOS_STATUS_BAR_CLEARANCE } from "@/lib/ios";
import { NOTES } from "@/lib/notes-content";

// Approximates real iOS's push/pop navigation curve.
const NAV_TRANSITION = { type: "tween", duration: 0.32, ease: [0.32, 0.72, 0, 1] } as const;
const NAV_TRANSITION_REDUCED = { duration: 0 } as const;

// Real iOS recognizes its "swipe from the left edge to go back" gesture
// only when the touch starts within a narrow strip of the screen edge, not
// anywhere on the page — so a normal rightward scroll gesture elsewhere on
// the note never triggers it.
const EDGE_SWIPE_ZONE_WIDTH = 24;
const EDGE_SWIPE_BACK_THRESHOLD_PX = 60;

// The list trails behind the note by a slight parallax offset instead of
// vanishing instantly — real iOS never leaves a bare gap behind the sliding
// screen, and it also gives AnimatePresence a real value to animate so it
// keeps the list mounted for the note's full slide duration instead of
// unmounting it the instant `selectedNoteId` changes.
const LIST_PARALLAX_OFFSET = "-25%";

/**
 * iOS Notes: one column, stacked list -> note navigation (see os-ios-ui
 * skill) instead of desktop `Notes.tsx`'s three-column layout, which depends
 * on `useWindowChrome()` (traffic lights, drag handlers) that has no meaning
 * in a full-screen iOS app. Reuses the same content source (`NOTES`), no
 * window chrome dependency. Folders collapse away here: `NOTES` is small
 * enough overall that one flat list reads fine without a folder screen —
 * matching the skill's two-level "liste → note" nav rather than inventing a
 * third folder screen it doesn't ask for.
 */
export function NotesMobile() {
  const reducedMotion = useReducedMotion();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const selectedNote = NOTES.find((note) => note.id === selectedNoteId);
  const transition = reducedMotion ? NAV_TRANSITION_REDUCED : NAV_TRANSITION;

  // Framer's `onPanEnd` (unlike its `drag` prop) recognizes the gesture
  // without moving the element itself and without manual pointer capture —
  // exactly what this invisible hit zone needs, since only the full-screen
  // transition above should ever move.
  function handleEdgeSwipeEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x > EDGE_SWIPE_BACK_THRESHOLD_PX) {
      setSelectedNoteId(null);
    }
  }

  return (
    <AnimatePresence initial={false}>
      {selectedNote ? (
        <motion.div
          key="detail"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={transition}
          // `absolute inset-0` (instead of flowing inside AppFullScreenView's
          // own padded box) so this pure black background bleeds all the way
          // under the status bar, matching its own paddingTop here. `z-10`
          // keeps it above the list regardless of mount/unmount order during
          // the transition (the pushed screen is always on top).
          className="absolute inset-0 z-10 flex flex-col bg-black text-[15px] text-white"
          style={{ paddingTop: IOS_STATUS_BAR_CLEARANCE }}
        >
          <div className="flex h-12 shrink-0 items-center px-2">
            <button
              type="button"
              onClick={() => setSelectedNoteId(null)}
              className="text-system-yellow flex items-center gap-0.5 px-2 py-1.5 text-[17px]"
            >
              <IconChevronLeft size={22} stroke={2.2} aria-hidden="true" />
              Notes
            </button>
          </div>
          <article className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
            <h1 className="mb-1 text-2xl font-bold">{selectedNote.title}</h1>
            <p className="mb-4 text-[13px] text-white/50">{selectedNote.date}</p>
            {selectedNote.body.map((paragraph, index) => (
              <p key={index} className="mb-3 leading-relaxed">
                <LinkifiedText text={paragraph} />
              </p>
            ))}
          </article>

          {/* Swipe-from-left-edge-to-go-back hit zone, below the header so
              it never steals taps from the back button above it. */}
          <motion.div
            onPanEnd={handleEdgeSwipeEnd}
            aria-hidden="true"
            className="absolute top-12 bottom-0 left-0 touch-none"
            style={{ width: EDGE_SWIPE_ZONE_WIDTH }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="list"
          initial={{ x: LIST_PARALLAX_OFFSET }}
          animate={{ x: 0 }}
          exit={{ x: LIST_PARALLAX_OFFSET }}
          transition={transition}
          className="absolute inset-0 flex flex-col bg-black text-[15px]"
          style={{ paddingTop: IOS_STATUS_BAR_CLEARANCE }}
        >
          <div className="shrink-0 px-5 pt-4 pb-2">
            <h1 className="text-3xl font-bold text-white">Notes</h1>
            <p className="text-[13px] text-white/50">
              {NOTES.length} {NOTES.length > 1 ? "notes" : "note"}
            </p>
          </div>
          {/* Grouped-list card (iOS Settings/Notes style): the app's previous
              plain background now reads as this card floating on the pure black
              page, dividers unchanged between rows. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <ul className="bg-window-canvas overflow-hidden rounded-xl">
              {NOTES.map((note) => (
                <li
                  key={note.id}
                  className="border-b border-black/8 last:border-b-0 dark:border-white/8"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedNoteId(note.id)}
                    className="flex w-full flex-col gap-0.5 px-4 py-3 text-left"
                  >
                    <span className="font-semibold">{note.title}</span>
                    <span className="text-foreground/50 truncate text-[13px]">
                      {note.date} {note.preview}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
