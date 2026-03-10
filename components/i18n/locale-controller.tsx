"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LOCALE_COOKIE_NAME,
  resolveLocaleFromBrowserLanguages,
} from "../../lib/i18n/config";
import { useI18n } from "./i18n-context";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readLocaleCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieValue = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.split("=")[1];

  return cookieValue === "ko" || cookieValue === "en" ? cookieValue : null;
}

function writeLocaleCookie(locale: "ko" | "en") {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

export function LocaleController() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const browserLocale = resolveLocaleFromBrowserLanguages(
      window.navigator.languages,
      window.navigator.language,
    );
    const cookieLocale = readLocaleCookie();

    if (cookieLocale !== browserLocale) {
      writeLocaleCookie(browserLocale);
    }

    if (browserLocale === locale) {
      document.documentElement.lang = browserLocale;
      return;
    }

    setLocale(browserLocale);
    document.documentElement.lang = browserLocale;
    router.refresh();
  }, [locale, router, setLocale]);

  return null;
}
