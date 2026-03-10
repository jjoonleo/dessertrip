import { describe, expect, it } from "vitest";
import { createMemberInputSchema } from "../lib/validation";
import {
  resolveLocaleFromAcceptLanguage,
  resolveLocaleFromBrowserLanguages,
  translate,
} from "../lib/i18n/config";
import { getLocalizedErrorMessage } from "../lib/i18n/server";

describe("i18n locale resolution", () => {
  it("defaults to Korean when no request language is present", () => {
    expect(resolveLocaleFromAcceptLanguage(undefined)).toBe("ko");
    expect(resolveLocaleFromAcceptLanguage("ko-KR,ko;q=0.9")).toBe("ko");
    expect(resolveLocaleFromAcceptLanguage("ja-JP,ja;q=0.9")).toBe("ko");
  });

  it("switches to English for English request languages", () => {
    expect(resolveLocaleFromAcceptLanguage("en")).toBe("en");
    expect(resolveLocaleFromAcceptLanguage("en-US,en;q=0.9")).toBe("en");
    expect(resolveLocaleFromAcceptLanguage("fr-FR, en-GB;q=0.8")).toBe("en");
  });

  it("keeps Korean when Korean is preferred and English is only a fallback", () => {
    expect(resolveLocaleFromAcceptLanguage("ko,en-US;q=0.9,en;q=0.8")).toBe("ko");
    expect(resolveLocaleFromAcceptLanguage("ko-KR, en;q=0.5")).toBe("ko");
  });

  it("uses browser language order for client-side locale sync", () => {
    expect(resolveLocaleFromBrowserLanguages(["ko-KR", "en-US"], "en-US")).toBe("ko");
    expect(resolveLocaleFromBrowserLanguages(["en-US", "ko-KR"], "ko-KR")).toBe("en");
    expect(resolveLocaleFromBrowserLanguages([], "ko-KR")).toBe("ko");
  });
});

describe("i18n error localization", () => {
  it("localizes validation errors to Korean by default", () => {
    let thrownError: unknown;

    try {
      createMemberInputSchema.parse({
        name: "   ",
        gender: "female",
        isManager: false,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(getLocalizedErrorMessage("ko", thrownError)).toBe("이름 입력 필요");
    expect(getLocalizedErrorMessage("en", thrownError)).toBe("Name is required.");
  });

  it("translates regular UI keys for both locales", () => {
    expect(translate("ko", "nav.activities.label")).toBe("활동");
    expect(translate("en", "nav.activities.label")).toBe("Activities");
  });
});
