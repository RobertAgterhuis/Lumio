import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lumio-legacy.nl"),
  title: {
    default: "Lumio — Rust en overzicht voor uw medewerkers",
    template: "%s | Lumio",
  },
  description:
    "Lumio helpt medewerkers belangrijke persoonlijke zaken te organiseren. Een laagdrempelig benefit voor moderne werkgevers — €125 p.p., WKR-passend, geen implementatie.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Lumio",
    title: "Lumio — Rust en overzicht voor uw medewerkers",
    description:
      "Een laagdrempelig benefit dat medewerkers helpt bij life events. Modern werkgeverschap zonder implementatieproject.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="flex min-h-screen flex-col">
        {/* SC 2.4.1 — skip navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-[#355E68] focus:px-4 focus:py-2 focus:text-white focus:shadow-md"
        >
          Ga naar hoofdinhoud
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
        <Footer />
        <Script
          defer
          data-domain="lumio-legacy.nl"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
