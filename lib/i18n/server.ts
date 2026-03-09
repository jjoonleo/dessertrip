import mongoose from "mongoose";
import { cookies, headers } from "next/headers";
import { ZodError } from "zod";
import {
  LOCALE_COOKIE_NAME,
  createTranslator,
  isTranslationKey,
  resolveLocaleFromAcceptLanguage,
  type AppLocale,
  type TranslationKey,
} from "./config";

export async function resolveRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale === "ko" || cookieLocale === "en") {
    return cookieLocale;
  }

  const requestHeaders = await headers();
  return resolveLocaleFromAcceptLanguage(requestHeaders.get("accept-language"));
}

export async function getRequestI18n() {
  const locale = await resolveRequestLocale();

  return {
    locale,
    t: createTranslator(locale),
  };
}

function translateErrorKey(locale: AppLocale, key: TranslationKey) {
  return createTranslator(locale)(key);
}

function getKnownErrorKey(error: Error): TranslationKey | null {
  if (isTranslationKey(error.message)) {
    return error.message;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const nestedError = Object.values(error.errors)[0];

    if (nestedError && isTranslationKey(nestedError.message)) {
      return nestedError.message;
    }
  }

  return null;
}

export function getLocalizedErrorMessage(locale: AppLocale, error: unknown) {
  if (error instanceof ZodError) {
    const issue = error.issues[0];

    if (issue && isTranslationKey(issue.message)) {
      return translateErrorKey(locale, issue.message);
    }
  }

  if (error instanceof Error) {
    const knownKey = getKnownErrorKey(error);

    if (knownKey) {
      return translateErrorKey(locale, knownKey);
    }
  }

  return translateErrorKey(locale, "errors.generic");
}
