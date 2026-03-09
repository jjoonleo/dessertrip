"use client";

import { createContext, useEffect, useMemo, useState, useContext } from "react";
import {
  createTranslator,
  type AppLocale,
  type TranslationKey,
  type TranslationValues,
} from "../../lib/i18n/config";

type I18nContextValue = {
  locale: AppLocale;
  t: (key: TranslationKey, values?: TranslationValues) => string;
  setLocale: (locale: AppLocale) => void;
};

const defaultLocale: AppLocale = "ko";

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  t: createTranslator(defaultLocale),
  setLocale: () => undefined,
});

type I18nProviderProps = {
  children: React.ReactNode;
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

export function useI18n() {
  return useContext(I18nContext);
}
