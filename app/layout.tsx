import { LocaleController } from "../components/i18n/locale-controller";
import type { Metadata } from "next";
import { I18nProvider } from "../components/i18n/i18n-provider";
import { ThemeController } from "../components/theme/theme-controller";
import { getRequestI18n } from "../lib/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getRequestI18n();

  return {
    title: t("app.name"),
    description: t("app.metadata.description"),
  };
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const { locale } = await getRequestI18n();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-base-200 text-base-content antialiased">
        <I18nProvider locale={locale}>
          <LocaleController />
          <ThemeController />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
