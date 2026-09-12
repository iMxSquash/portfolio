"use client";

import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import { FolderIcon } from "@/components/icons/FolderIcon";
import { focusListSibling } from "@/lib/arrow-key-nav";
import { NOTES, NOTE_FOLDERS } from "@/lib/notes-content";
import { useLiquidGlassRefraction } from "@/lib/use-liquid-glass-refraction";
import { useLiquidGlassStore } from "@/stores/useLiquidGlassStore";

/**
 * Sidebar is a larger element (per apple-design skill: Materials — Color) so
 * it goes more opaque than the base `liquid-glass` default, to stay legible
 * over the notes list scrolling behind it.
 */
const SIDEBAR_TINT = {
  "--glass-tint-alpha": "18%",
  "--glass-tint-alpha-dark": "50%",
} as CSSProperties;

/**
 * Read-only Notes.app clone: sidebar (folders) / list (notes) / editor,
 * doubling as the CV (see os-apps skill). Three columns collapse to
 * shrinking, never disappearing, columns down to the app's `minSize`.
 */
export function Notes() {
  const [selectedFolderId, setSelectedFolderId] = useState(NOTE_FOLDERS[0].id);
  const notesInFolder = useMemo(
    () => NOTES.filter((note) => note.folderId === selectedFolderId),
    [selectedFolderId],
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(notesInFolder[0]?.id);
  const selectedNote = NOTES.find((note) => note.id === selectedNoteId) ?? notesInFolder[0];
  const [sidebarEl, setSidebarEl] = useState<HTMLElement | null>(null);
  const glassParams = useLiquidGlassStore((state) => state.params);
  // Sidebar is an actionable nav surface — refraction defaults on, aberration
  // stays 0 (Dock + Spotlight already spend the 1-2-element chromatic budget).
  useLiquidGlassRefraction(sidebarEl, {
    scale: glassParams.refractScale,
    aberration: 0,
    mode: glassParams.refractMode,
  });

  function handleSelectFolder(folderId: string) {
    setSelectedFolderId(folderId);
    const firstNote = NOTES.find((note) => note.folderId === folderId);
    setSelectedNoteId(firstNote?.id);
  }

  return (
    <div className="flex h-full min-h-0 text-[13px]">
      <nav
        ref={setSidebarEl}
        className="liquid-glass w-36 min-w-28 shrink-0 rounded-none border-y-0 border-l-0 py-2"
        style={SIDEBAR_TINT}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) =>
          focusListSibling(event, event.currentTarget, "vertical")
        }
      >
        {NOTE_FOLDERS.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => handleSelectFolder(folder.id)}
            onFocus={() => handleSelectFolder(folder.id)}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-system-blue ${
              folder.id === selectedFolderId
                ? "bg-amber-400/30 dark:bg-amber-400/20"
                : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <FolderIcon />
            <span className="truncate">{folder.name}</span>
          </button>
        ))}
      </nav>

      <div
        className="w-56 min-w-40 shrink-0 overflow-y-auto border-r border-black/10 dark:border-white/10"
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
          focusListSibling(event, event.currentTarget, "vertical")
        }
      >
        {notesInFolder.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => setSelectedNoteId(note.id)}
            onFocus={() => setSelectedNoteId(note.id)}
            className={`flex w-full flex-col gap-0.5 border-b border-black/5 px-3 py-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-system-blue dark:border-white/5 ${
              note.id === selectedNote?.id ? "bg-amber-400/25 dark:bg-amber-400/15" : ""
            }`}
          >
            <span className="truncate font-semibold">{note.title}</span>
            <span className="text-foreground/50 truncate text-[12px]">
              {note.date} — {note.preview}
            </span>
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
        {selectedNote ? (
          <article key={selectedNote.id}>
            <h1 className="mb-1 inline-block bg-amber-300/40 px-1 text-xl font-bold dark:bg-amber-300/25">
              {selectedNote.title}
            </h1>
            <p className="text-foreground/50 mb-4 text-[12px]">{selectedNote.date}</p>
            {selectedNote.body.map((paragraph, index) => (
              <p key={index} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </article>
        ) : null}
      </div>
    </div>
  );
}
