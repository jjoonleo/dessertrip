"use client";

import { useI18n } from "../i18n/i18n-provider";
import { useThemeStore } from "../../lib/stores/theme-store";

type ThemeToggleProps = {
  label?: boolean;
};

export function ThemeToggle({ label = true }: ThemeToggleProps) {
  const { t } = useI18n();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <label className="label cursor-pointer gap-3">
      {label ? (
        <span className="label-text text-xs font-semibold uppercase tracking-[0.24em]">
          {t("theme.label")}
        </span>
      ) : null}
      <input
        aria-label={t("theme.toggleAria")}
        checked={theme === "dark"}
        className="toggle toggle-primary"
        onChange={() => toggleTheme()}
        type="checkbox"
      />
      <span className="min-w-12 text-right text-xs font-semibold uppercase tracking-[0.2em] text-base-content/70">
        {theme === "dark" ? t("theme.dark") : t("theme.pastel")}
      </span>
    </label>
  );
}
