import type { Metadata } from "next";
import { ThemeController } from "../components/theme/theme-controller";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dessertrip",
  description: "Management app data layer for the Dessertrip club.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-base-200 text-base-content antialiased">
        <ThemeController />
        {children}
      </body>
    </html>
  );
}
