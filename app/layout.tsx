import type { Metadata } from "next";
import { AppProviders } from "../components/app-providers";
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
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
