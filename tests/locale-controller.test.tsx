// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { I18nProvider } from "../components/i18n/i18n-provider";
import { LocaleController } from "../components/i18n/locale-controller";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe("locale controller", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    document.cookie = "";
    document.documentElement.lang = "en";
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "ko-KR",
    });
    Object.defineProperty(window.navigator, "languages", {
      configurable: true,
      value: ["ko-KR", "en-US"],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("syncs the browser-preferred Korean locale and refreshes server content", async () => {
    render(
      <I18nProvider locale="en">
        <LocaleController />
        <div>content</div>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    expect(document.documentElement.lang).toBe("ko");
    expect(document.cookie).toContain("dessertrip-locale=ko");
  });
});
