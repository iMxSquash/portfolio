"use client";

import { useState } from "react";
import { IconChevronLeft } from "@tabler/icons-react";
import { IOS_STATUS_BAR_CLEARANCE } from "@/lib/ios";
import { NOTES } from "@/lib/notes-content";

/**
 * iOS Notes: one column, stacked list -> note navigation (see os-ios-ui
 * skill) instead of desktop `Notes.tsx`'s three-column layout, which depends
 * on `useWindowChrome()` (traffic lights, drag handlers) that has no meaning
 * in a full-screen iOS app. Reuses the same content source (`NOTES`), no
 * window chrome dependency. Folders collapse away here: every folder in
 * `NOTE_FOLDERS` holds exactly one note today, so a flat note list already
 * reads the same as a folder list — matching the skill's two-level "liste →
 * note" nav rather than inventing a third folder screen it doesn't ask for.
 */
export function NotesMobile() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const selectedNote = NOTES.find((note) => note.id === selectedNoteId);

  if (selectedNote) {
    return (
      // `absolute inset-0` (instead of flowing inside AppFullScreenView's
      // own padded box) so this pure black background bleeds all the way
      // under the status bar, matching its own paddingTop here.
      <div
        className="absolute inset-0 flex flex-col bg-black text-[15px] text-white"
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
              {paragraph}
            </p>
          ))}
        </article>
      </div>
    );
  }

  return (
    <div
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
            <li key={note.id} className="border-b border-black/8 last:border-b-0 dark:border-white/8">
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
    </div>
  );
}
