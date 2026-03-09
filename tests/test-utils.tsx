import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { I18nProvider } from "../components/i18n/i18n-provider";
import type { AppLocale } from "../lib/i18n/config";

export function renderWithLocale(
  ui: ReactElement,
  locale: AppLocale = "en",
) {
  const result = render(<I18nProvider locale={locale}>{ui}</I18nProvider>);

  return {
    ...result,
    rerender: (nextUi: ReactElement) =>
      result.rerender(<I18nProvider locale={locale}>{nextUi}</I18nProvider>),
  };
}
