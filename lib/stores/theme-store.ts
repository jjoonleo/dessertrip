"use client";

import { create } from "zustand";

export type ThemeName = "pastel" | "dark";

export type ThemeState = {
  theme: ThemeName;
  drawerOpen: boolean;
  hydrated: boolean;
  hydrateTheme: () => void;
  toggleTheme: () => void;
  setDrawerOpen: (drawerOpen: boolean) => void;
};

const STORAGE_KEY = "dessertrip-theme";

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  const candidate = (globalThis as { localStorage?: Storage }).localStorage;
  return candidate ?? null;
}

function getStoredTheme(): ThemeName | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const value = storage.getItem(STORAGE_KEY);
  return value === "pastel" || value === "dark" ? value : null;
}

function getPreferredTheme(): ThemeName {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "pastel";
}

function persistTheme(theme: ThemeName) {
  const storage = getStorage();
  storage?.setItem(STORAGE_KEY, theme);
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "pastel",
  drawerOpen: false,
  hydrated: false,
  hydrateTheme: () =>
    set({
      theme: getStoredTheme() ?? getPreferredTheme(),
      hydrated: true,
    }),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "pastel" ? "dark" : "pastel";
      persistTheme(theme);

      return {
        theme,
      };
    }),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
}));
