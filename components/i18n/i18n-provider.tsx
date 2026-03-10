"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createTranslator,
  type AppLocale,
} from "../../lib/i18n/config";
import { I18nContext } from "./i18n-context";

type I18nProviderProps = {
  children: ReactNode;
  locale: AppLocale;
};

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const [localeOverride, setLocaleOverride] = useState<AppLocale | null>(null);
  const currentLocale = localeOverride ?? locale;

  useEffect(() => {
    setLocaleOverride(null);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale: currentLocale,
      t: createTranslator(currentLocale),
      setLocale: setLocaleOverride,
    }),
    [currentLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
