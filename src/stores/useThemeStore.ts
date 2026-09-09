import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_STORAGE_KEY, resolveTheme, type ThemeMode } from "@/lib/theme";

type ThemeStore = {
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: "system",
      setTheme: (mode) => set({ mode }),
      toggleTheme: () => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const resolved = resolveTheme(get().mode, prefersDark);
        set({ mode: resolved === "dark" ? "light" : "dark" });
      },
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
