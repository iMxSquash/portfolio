"use client";

import { useState } from "react";
import { IconChevronLeft } from "@tabler/icons-react";
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
      <div className="bg-window-canvas flex h-full flex-col text-[15px]">
        <div className="flex h-12 shrink-0 items-center px-2">
          <button
            type="button"
            onClick={() => setSelectedNoteId(null)}
            className="text-system-blue flex items-center gap-0.5 px-2 py-1.5 text-[17px]"
          >
            <IconChevronLeft size={22} stroke={2.2} aria-hidden="true" />
            Notes
          </button>
        </div>
        <article className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
          <h1 className="mb-1 text-2xl font-bold">{selectedNote.title}</h1>
          <p className="text-foreground/50 mb-4 text-[13px]">{selectedNote.date}</p>
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
    <div className="bg-window-canvas flex h-full flex-col text-[15px]">
      <div className="shrink-0 px-5 pt-4 pb-2">
        <h1 className="text-3xl font-bold">Notes</h1>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {NOTES.map((note) => (
          <li key={note.id} className="border-b border-black/8 dark:border-white/8">
            <button
              type="button"
              onClick={() => setSelectedNoteId(note.id)}
              className="flex w-full flex-col gap-0.5 px-5 py-3 text-left"
            >
              <span className="font-semibold">{note.title}</span>
              <span className="text-foreground/50 truncate text-[13px]">
                {note.date} — {note.preview}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
