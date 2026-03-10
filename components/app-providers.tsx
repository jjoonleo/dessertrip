"use client";

import { type ReactNode } from "react";
import type { AppLocale } from "../lib/i18n/config";
import { LocaleController } from "./i18n/locale-controller";
import { I18nProvider } from "./i18n/i18n-provider";
import { ThemeController } from "./theme/theme-controller";

type AppProvidersProps = {
  children: ReactNode;
  locale: AppLocale;
};

export function AppProviders({ children, locale }: AppProvidersProps) {
  return (
    <I18nProvider locale={locale}>
      <LocaleController />
      <ThemeController />
      {children}
    </I18nProvider>
  );
}
