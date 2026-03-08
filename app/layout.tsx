import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.vercel.app'),
  title: {
    default: "Virginia Liquidation | Industrial & Estate Auctions",
    template: "%s | Virginia Liquidation"
  },
  description: "Northern Virginia's premier marketplace for industrial liquidation, commercial equipment, and estate auctions. Secure verified assets through our professional bidding engine.",
  keywords: ["Industrial Auctions", "Virginia Liquidation", "Commercial Equipment", "Estate Sales", "Machinery Auctions", "Richmond VA Auctions"],
  authors: [{ name: "Virginia Liquidation Team" }],
  creator: "Virginia Liquidation",
  publisher: "Virginia Liquidation",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://virginialiquidation.vercel.app",
    siteName: "Virginia Liquidation",
    title: "Virginia Liquidation | Professional Industrial Marketplace",
    description: "The leading engine for high-end industrial and commercial liquidations in Northern Virginia.",
    images: [
      {
        url: "/images/og-image.jpg", // Make sure to add this image to public/images/
        width: 1200,
        height: 630,
        alt: "Virginia Liquidation Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virginia Liquidation | Industrial Auctions",
    description: "Northern Virginia's premier industrial liquidation marketplace.",
    images: ["/images/og-image.jpg"],
    creator: "@virginialiquidation",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import AdminToolbar from "@/components/admin/AdminToolbar";
import { createClient } from "@/lib/supabase/server";
import Script from "next/script";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('gtm_id')
    .eq('id', 'global')
    .maybeSingle();

  const gtmId = settings?.gtm_id;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}
      </head>
      <body className={`${sansFont.variable} ${displayFont.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {gtmId && (
          <noscript>
            <iframe 
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0" 
              width="0" 
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <AdminToolbar />
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
