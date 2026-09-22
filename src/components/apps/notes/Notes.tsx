"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { FolderIcon } from "@/components/icons/FolderIcon";
import { LinkifiedText } from "@/components/apps/notes/LinkifiedText";
import { useWindowChrome } from "@/components/os/window/WindowChromeContext";
import { focusListSibling } from "@/lib/arrow-key-nav";
import {
  SIDEBAR_CHROME_GLASS,
  SIDEBAR_CHROME_TINT_DARK,
  SIDEBAR_CHROME_TINT_LIGHT,
} from "@/lib/glass-presets";
import { NOTES, NOTE_FOLDERS } from "@/lib/notes-content";
import { useIsDarkMode } from "@/lib/use-is-dark-mode";
import { useLiquidGlass } from "@/lib/use-liquid-glass";

/**
 * Read-only Notes.app clone: sidebar (folders) / list (notes) / editor,
 * doubling as the CV (see os-apps skill). Three columns collapse to
 * shrinking, never disappearing, columns down to the app's `minSize`. Same
 * "unified" window chrome as Finder (see os-apps skill): no separate title
 * bar, the sidebar carries the traffic lights in its own top row.
 */
export function Notes() {
  const [selectedFolderId, setSelectedFolderId] = useState(NOTE_FOLDERS[0].id);
  const notesInFolder = useMemo(
    () => NOTES.filter((note) => note.folderId === selectedFolderId),
    [selectedFolderId],
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(notesInFolder[0]?.id);
  const selectedNote = NOTES.find((note) => note.id === selectedNoteId) ?? notesInFolder[0];
  const currentFolder = useMemo(
    () => NOTE_FOLDERS.find((folder) => folder.id === selectedFolderId),
    [selectedFolderId],
  );
  const [sidebarEl, setSidebarEl] = useState<HTMLElement | null>(null);
  const { trafficLights, dragHandlers } = useWindowChrome();

  // `LiquidGlassConfig.tint` is a static value with no light/dark switching
  // of its own, so the exact `--window-canvas` match (see
  // SIDEBAR_CHROME_TINT_LIGHT/DARK) needs the resolved theme here.
  const isDarkMode = useIsDarkMode();
  const sidebarGlass = useMemo(
    () => ({
      ...SIDEBAR_CHROME_GLASS,
      tint: isDarkMode ? SIDEBAR_CHROME_TINT_DARK : SIDEBAR_CHROME_TINT_LIGHT,
    }),
    [isDarkMode],
  );
  // Same flat window chrome as the Finder sidebar (see SIDEBAR_CHROME_GLASS)
  // — no refraction, tinted to read as one continuous surface with the
  // content pane.
  useLiquidGlass(sidebarEl, sidebarGlass);

  function handleSelectFolder(folderId: string) {
    setSelectedFolderId(folderId);
    const firstNote = NOTES.find((note) => note.folderId === folderId);
    setSelectedNoteId(firstNote?.id);
  }

  return (
    <div className="flex h-full min-h-0 text-[13px]">
      <nav
        ref={setSidebarEl}
        className="flex w-40 min-w-32 shrink-0 flex-col border-y-0 border-l-0"
      >
        <div
          className="flex h-(--toolbar-height) shrink-0 items-center pl-4 select-none"
          {...dragHandlers}
        >
          {trafficLights}
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2"
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
            focusListSibling(event, event.currentTarget, "vertical")
          }
        >
          <p className="text-foreground/55 px-3 pb-1 text-[11px] font-medium">Dossiers</p>
          {NOTE_FOLDERS.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => handleSelectFolder(folder.id)}
              onFocus={() => handleSelectFolder(folder.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-system-blue ${
                folder.id === selectedFolderId
                  ? "bg-black/6 text-system-yellow font-medium dark:bg-white/7"
                  : "hover:bg-black/4 dark:hover:bg-white/4"
              }`}
            >
              <FolderIcon />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="bg-window-canvas flex min-h-0 flex-1 flex-col">
        <div
          className="flex h-(--toolbar-height) shrink-0 items-center px-3 select-none"
          {...dragHandlers}
        >
          <span className="font-semibold">{currentFolder?.name}</span>
        </div>

        <div className="flex min-h-0 flex-1">
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
                  note.id === selectedNote?.id ? "bg-system-yellow/25 dark:bg-system-yellow/15" : ""
                }`}
              >
                <span className="truncate font-semibold">{note.title}</span>
                <span className="text-foreground/50 truncate text-[12px]">
                  {note.date} {note.preview}
                </span>
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
            {selectedNote ? (
              <article key={selectedNote.id}>
                <h1 className="mb-1 inline-block bg-system-yellow/40 px-1 text-xl font-bold dark:bg-system-yellow/25">
                  {selectedNote.title}
                </h1>
                <p className="text-foreground/50 mb-4 text-[12px]">{selectedNote.date}</p>
                {selectedNote.body.map((paragraph, index) => (
                  <p key={index} className="mb-3 leading-relaxed">
                    <LinkifiedText text={paragraph} />
                  </p>
                ))}
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
