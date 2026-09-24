"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { getProjectApps, launchApp } from "@/lib/apps";
import { NOTES } from "@/lib/notes-content";
import { useAppsStore } from "@/stores/useAppsStore";
import { useWindowStore } from "@/stores/useWindowStore";

type Line = { id: number; text: string };

/** One command: what it does, and (for `ls`/`cat`/`open`) the candidates Tab-completion offers for its first argument — see `handleTabComplete`. */
type CommandDefinition = {
  run: (args: string[]) => void;
  argCandidates?: () => string[];
};

const PROMPT = "elwen@portfolio ~ %";

const NOTE_BY_FILE: Record<string, (typeof NOTES)[number] | undefined> = {
  "about.txt": NOTES.find((note) => note.id === "about-me"),
  "skills.txt": NOTES.find((note) => note.id === "skills-list"),
  "contact.txt": NOTES.find((note) => note.id === "contact-info"),
};

/** Longest string every entry in `words` starts with, or `""` if they share none. */
function longestCommonPrefix(words: string[]): string {
  let prefix = words[0] ?? "";
  for (const word of words.slice(1)) {
    while (prefix && !word.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/**
 * Fake Terminal easter egg (see TODO.md Phase 9): a handful of canned
 * commands, some of them genuinely wired to the app registry (`ls
 * projects`/`open <projet>` read/launch the real Supabase-backed project
 * apps, see os-apps skill) rather than hardcoded copy.
 */
export function Terminal() {
  const apps = useAppsStore((state) => state.apps);
  const openWindow = useWindowStore((state) => state.openWindow);
  // Per-instance line-id counter (not module state — nothing outside this
  // component's own list keying needs it). Starts at 1: id 0 is the welcome
  // line below, given directly rather than through `makeLine` since reading
  // a ref during the `useState` lazy initializer isn't allowed mid-render.
  const nextLineId = useRef(1);
  function makeLine(text: string): Line {
    return { id: nextLineId.current++, text };
  }

  const [lines, setLines] = useState<Line[]>(() => [
    { id: 0, text: "Portfolio Terminal (tapez « help » pour la liste des commandes)." },
  ]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const commandHistory = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  function print(text: string) {
    setLines((prev) => [...prev, makeLine(text)]);
  }

  // Single source of truth for what the terminal can do: `runCommand` and
  // Tab-completion both read this instead of keeping their own, separately
  // maintained command lists/switches in sync by hand.
  const commands: Record<string, CommandDefinition> = {
    help: {
      run: () =>
        print(
          "Commandes : help, whoami, ls, ls projects, cat <fichier>, open <projet>, date, clear",
        ),
    },
    whoami: {
      run: () => print("elwen (développeur full-stack)"),
    },
    ls: {
      run: (args) => {
        if (args[0] === "projects") {
          const names = getProjectApps(apps).map((app) => app.name);
          print(names.length > 0 ? names.join("   ") : "(aucun projet visible)");
        } else {
          print("about.txt   skills.txt   contact.txt   projects/");
        }
      },
      argCandidates: () => ["projects"],
    },
    cat: {
      run: (args) => {
        const note = NOTE_BY_FILE[args[0] ?? ""];
        if (note) {
          note.body.forEach(print);
        } else {
          print(`cat: ${args[0] ?? ""}: fichier introuvable`);
        }
      },
      argCandidates: () => Object.keys(NOTE_BY_FILE),
    },
    open: {
      run: (args) => {
        const target = args.join(" ").toLowerCase();
        const app = getProjectApps(apps).find(
          (candidate) => candidate.name.toLowerCase() === target || candidate.id === target,
        );
        if (app) {
          print(`Ouverture de ${app.name}…`);
          launchApp(app, openWindow);
        } else {
          print(`open: ${target}: application introuvable (essayez « ls projects »)`);
        }
      },
      argCandidates: () => getProjectApps(apps).map((app) => app.id),
    },
    date: {
      run: () => print(new Date().toLocaleString("fr-FR")),
    },
    clear: {
      run: () => setLines([]),
    },
    sudo: {
      run: (args) => print(`${args[0] ?? "sudo"}: permission refusée. Cet incident sera signalé.`),
    },
    exit: {
      run: () => print("Il n'y a pas d'échappatoire. (Le bouton rouge, en revanche, fonctionne.)"),
    },
  };

  function runCommand(raw: string) {
    const trimmed = raw.trim();
    setLines((prev) => [...prev, makeLine(`${PROMPT} ${raw}`)]);
    if (!trimmed) return;
    commandHistory.current.push(raw);

    const [command, ...args] = trimmed.split(/\s+/);
    const definition = command ? commands[command] : undefined;
    if (definition) {
      definition.run(args);
    } else {
      print(`command not found: ${command}`);
    }
  }

  /** Shell-style Tab completion: completes the command or its current (first) argument, extends to the longest shared prefix on multiple matches, else lists them. */
  function handleTabComplete() {
    const words = input.split(/\s+/).filter(Boolean);
    // A trailing space means the cursor is past the last word, starting a
    // fresh (empty) one — represent that as an explicit empty token so
    // `prefix`/`wordsBeforeCompletion` both derive from the same array.
    const tokens = /\s$/.test(input) ? [...words, ""] : words.length > 0 ? words : [""];
    const prefix = tokens.at(-1) ?? "";
    const wordsBeforeCompletion = tokens.slice(0, -1);
    const completingCommand = wordsBeforeCompletion.length === 0;

    const candidates = (
      completingCommand
        ? Object.keys(commands)
        : wordsBeforeCompletion.length === 1
          ? (commands[wordsBeforeCompletion[0] ?? ""]?.argCandidates?.() ?? [])
          : []
    ).filter((candidate) => candidate.startsWith(prefix));

    if (candidates.length === 0) return;

    if (candidates.length === 1) {
      setInput(`${[...wordsBeforeCompletion, candidates[0]].join(" ")} `);
      return;
    }

    const commonPrefix = longestCommonPrefix(candidates);
    if (commonPrefix.length > prefix.length) {
      setInput([...wordsBeforeCompletion, commonPrefix].join(" "));
    } else {
      print(`${PROMPT} ${input}`);
      print(candidates.join("   "));
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    runCommand(input);
    setInput("");
    setHistoryIndex(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const history = commandHistory.current;
    if (event.key === "Tab") {
      event.preventDefault();
      handleTabComplete();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(historyIndex - 1, 0);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? "");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] ?? "");
      }
    }
  }

  return (
    <div
      className="flex h-full flex-col gap-1 overflow-y-auto bg-black p-3 font-mono text-[13px] text-[#5CFF5C] [--scrollbar-thumb-hover:#ffffff99] [--scrollbar-thumb:#ffffff66]"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line) => (
        <div key={line.id} className="whitespace-pre-wrap">
          {line.text}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <label htmlFor="terminal-input" className="shrink-0">
          {PROMPT}
        </label>
        <input
          id="terminal-input"
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none"
        />
      </form>
      <div ref={bottomRef} />
    </div>
  );
}
