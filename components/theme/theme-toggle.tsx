"use client";

import { useThemeStore } from "../../lib/stores/theme-store";

type ThemeToggleProps = {
  label?: boolean;
};

export function ThemeToggle({ label = true }: ThemeToggleProps) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <label className="label cursor-pointer gap-3">
      {label ? (
        <span className="label-text text-xs font-semibold uppercase tracking-[0.24em]">
          Theme
        </span>
      ) : null}
      <input
        aria-label="Toggle theme"
        checked={theme === "dark"}
        className="toggle toggle-primary"
        onChange={() => toggleTheme()}
        type="checkbox"
      />
      <span className="min-w-12 text-right text-xs font-semibold uppercase tracking-[0.2em] text-base-content/70">
        {theme === "dark" ? "Dark" : "Pastel"}
      </span>
    </label>
  );
}
