
import { create } from "zustand";
import type { ThemeName } from "../types/themes";

interface ThemeState {
  activeTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  activeTheme: "codeon",
  setTheme: (theme) => set({ activeTheme: theme }),
}));
