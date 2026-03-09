"use client";

import { useEffect } from "react";
import { useThemeStore } from "../../lib/stores/theme-store";

export function ThemeController() {
  const theme = useThemeStore((state) => state.theme);
  const hydrated = useThemeStore((state) => state.hydrated);
  const hydrateTheme = useThemeStore((state) => state.hydrateTheme);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const root = document.documentElement;

    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [hydrated, theme]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    document.documentElement.classList.add("theme-ready");
  }, [hydrated]);

  return null;
}
