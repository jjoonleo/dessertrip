"use client";

import { createContext, useContext } from "react";
import {
  createTranslator,
  type AppLocale,
  type TranslationKey,
  type TranslationValues,
} from "../../lib/i18n/config";

export type I18nContextValue = {
  locale: AppLocale;
  t: (key: TranslationKey, values?: TranslationValues) => string;
  setLocale: (locale: AppLocale) => void;
};

const defaultLocale: AppLocale = "ko";

export const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  t: createTranslator(defaultLocale),
  setLocale: () => undefined,
});

export function useI18n() {
  return useContext(I18nContext);
}
