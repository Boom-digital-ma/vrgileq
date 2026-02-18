import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const displayFont = Geist({
  variable: "--font-display",
  subsets: ["latin"],
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Virginia Liquidation | Industrial & Estate Auctions",
    template: "%s | Virginia Liquidation"
  },
  description: "Northern Virginia's premier marketplace for industrial liquidation, commercial equipment, and estate auctions.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sansFont.variable} ${displayFont.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
