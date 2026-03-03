import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { DM_Serif_Display } from "next/font/google";
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
    // SP-2-001: neutral default — B2C audience is primary; B2B pages override per-page
    default: "Lumio — Alles geregeld als het er echt toe doet",
    template: "%s | Lumio",
  },
  description:
    "Lumio helpt je testament, wilsverklaring, digitale bezittingen en noodcontacten veilig offline bijhouden. €125 eenmalig, geen abonnement.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Lumio",
    // SP-2-001: neutral OG default — individual pages override with their own OG title
    title: "Lumio — Alles geregeld als het er echt toe doet",
    description:
      "Veilig en offline: testament, wilsverklaring, digitale bezittingen en noodcontacten op één plek. €125 eenmalig, geen abonnement, geen cloud.",
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

// SP-2-002: Organisation JSON-LD — site-wide structured data
const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lumio",
  url: "https://www.lumio-legacy.nl",
  logo: "https://www.lumio-legacy.nl/logo.svg",
  description:
    "Lumio helpt je testament, wilsverklaring, digitale bezittingen en noodcontacten veilig offline bijhouden.",
  email: "info@lumio.app",
  areaServed: "NL",
  foundingLocation: { "@type": "Place", addressCountry: "NL" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="flex min-h-screen flex-col">
        {/* SP-2-002: Organisation JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />
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
      </body>
    </html>
  );
}
